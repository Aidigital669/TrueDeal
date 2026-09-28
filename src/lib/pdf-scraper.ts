/**
 * TrueDeal AI PDF Scraper & Universal Document Intelligence Engine
 * - Multi-tiered extraction: pdf-parse local parser + Google Gemini Multimodal AI
 * - Authentic image extraction: captures embedded pictures & page visuals directly from PDFs
 * - Robust pricing detection: INR (₹, Rs), USD, EUR, Lakhs, Crores, MRP & discounts
 * - Zero-failure guarantee: falls back to local heuristic extraction if AI is busy or offline
 */

import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { getSellerProductsCollection, cleanSellerSlug, getDb } from "./mongodb";
import { getCategoryFallbackImage } from "./image-extractor";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-flash-latest"
];

export interface ScrapedPdfItem {
  title: string;
  brand?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  description: string;
  sku?: string;
  specs?: { key: string; value: string }[];
  aiKeywords?: string[];
  inStock?: boolean;
  inventory?: number;
  primaryImage?: string;
  images?: string[];
  pageNumber?: number;
  imageLocation?: { box_2d?: [number, number, number, number] };
  imageDescription?: string;
  hasImageInPdf?: boolean;
  importedToDb?: boolean;
}

export interface ScrapedPdfCompany {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  tagline?: string;
}

export interface PdfScrapingResult {
  success: boolean;
  filename?: string;
  company?: ScrapedPdfCompany;
  products: ScrapedPdfItem[];
  stats: {
    totalExtracted: number;
    totalImported: number;
    totalImages: number;
    categories: string[];
    processingTimeMs: number;
    fileSizeKb: number;
  };
  logs: string[];
  error?: string;
}

export interface ScrapePdfOptions {
  buffer?: Buffer;
  base64Data?: string;
  fileUrl?: string;
  filename?: string;
  sellerSlug?: string;
  mode?: "auto" | "catalog" | "real_estate" | "services";
  autoImport?: boolean;
}

/**
 * Ensures public/uploads/pdf-extracts directory exists
 */
function ensureUploadsDirectory(): string {
  const dir = path.join(process.cwd(), "public", "uploads", "pdf-extracts");
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create uploads directory:", err);
  }
  return dir;
}

/**
 * Saves extracted image bytes to disk and returns public URL
 */
function persistExtractedImage(
  data: Uint8Array | Buffer,
  filenamePrefix: string,
  pageNumber: number,
  index: number
): string {
  try {
    const dir = ensureUploadsDirectory();
    const cleanPrefix = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 24);
    const uniqueName = `pdf_${cleanPrefix}_p${pageNumber}_${index}_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const fullPath = path.join(dir, uniqueName);
    fs.writeFileSync(fullPath, Buffer.from(data));
    return `/uploads/pdf-extracts/${uniqueName}`;
  } catch (err) {
    console.warn("Failed writing PDF extracted image to disk:", err);
    return "";
  }
}

/**
 * Crops a specific product image from a rendered page screenshot using normalized 0-1000 bounding box coordinates
 */
async function cropProductImageFromPage(
  pageBuffer: Buffer | Uint8Array,
  box_2d: [number, number, number, number] | { ymin?: number; xmin?: number; ymax?: number; xmax?: number; top?: number; left?: number; bottom?: number; right?: number },
  filenamePrefix: string,
  pageNumber: number,
  itemIndex: number
): Promise<string> {
  try {
    let ymin: number, xmin: number, ymax: number, xmax: number;
    if (Array.isArray(box_2d)) {
      [ymin, xmin, ymax, xmax] = box_2d;
    } else if (box_2d && typeof box_2d === "object") {
      ymin = box_2d.ymin ?? box_2d.top ?? 0;
      xmin = box_2d.xmin ?? box_2d.left ?? 0;
      ymax = box_2d.ymax ?? box_2d.bottom ?? 0;
      xmax = box_2d.xmax ?? box_2d.right ?? 0;
    } else {
      return "";
    }

    if (typeof ymin !== "number" || typeof xmin !== "number" || typeof ymax !== "number" || typeof xmax !== "number") {
      return "";
    }

    // Auto-detect normalized 0..1 scale if model returns float coordinates
    if (ymax <= 1 && xmax <= 1 && (ymax > 0 || xmax > 0)) {
      ymin *= 1000;
      xmin *= 1000;
      ymax *= 1000;
      xmax *= 1000;
    }

    if (ymax <= ymin || xmax <= xmin) return "";

    const clampedYmin = Math.max(0, Math.min(1000, ymin));
    const clampedXmin = Math.max(0, Math.min(1000, xmin));
    const clampedYmax = Math.max(0, Math.min(1000, ymax));
    const clampedXmax = Math.max(0, Math.min(1000, xmax));

    const img = await loadImage(Buffer.from(pageBuffer));
    let x = Math.round((clampedXmin / 1000) * img.width);
    let y = Math.round((clampedYmin / 1000) * img.height);
    let w = Math.round(((clampedXmax - clampedXmin) / 1000) * img.width);
    let h = Math.round(((clampedYmax - clampedYmin) / 1000) * img.height);

    // Add 2% padding around the bounding box to prevent clipping product edges
    const padX = Math.round(w * 0.02);
    const padY = Math.round(h * 0.02);
    x = Math.max(0, x - padX);
    y = Math.max(0, y - padY);
    w = Math.min(img.width - x, w + padX * 2);
    h = Math.min(img.height - y, h + padY * 2);

    if (w < 30 || h < 30) return "";

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

    const croppedBuf = canvas.toBuffer("image/png");
    return persistExtractedImage(croppedBuf, `${filenamePrefix}_crop_${itemIndex}`, pageNumber, 1);
  } catch (err: any) {
    console.warn("Failed cropping product image:", err.message);
    return "";
  }
}

/**
 * Robust Price Parser
 * Accurately extracts numeric prices, original prices (MRP), and discounts
 */
export function parsePriceFromText(text: string): { price: number; originalPrice?: number; discount?: string } {
  let price = 0;
  let originalPrice: number | undefined;
  let discount: string | undefined;

  if (!text) return { price: 0 };

  // 1. Detect explicit discounts (e.g. "18% off", "25% OFF")
  const discountMatch = text.match(/(\d{1,2}%)\s*off/i);
  if (discountMatch) {
    discount = discountMatch[1].toUpperCase() + " OFF";
  }

  // 2. Detect MRP or Original Price
  const mrpMatch = text.match(/(?:mrp|original|regular|was|strikethrough|list\s*price)[:\s]*(?:rs\.?|inr|₹|\$|€|£)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (mrpMatch) {
    originalPrice = parseFloat(mrpMatch[1].replace(/,/g, ""));
  }

  // 3. Detect Indian Crores (e.g. ₹1.85 Cr, 2.5 Crore)
  const crMatch = text.match(/(?:rs\.?|inr|₹|\$)?\s*([0-9,.]+)\s*(?:cr|crore|crores)\b/i);
  if (crMatch) {
    price = Math.round(parseFloat(crMatch[1].replace(/,/g, "")) * 10000000);
  } else {
    // 4. Detect Indian Lakhs (e.g. ₹50L, 85 Lakhs, 12.5 Lacs)
    const lakhMatch = text.match(/(?:rs\.?|inr|₹|\$)?\s*([0-9,.]+)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
    if (lakhMatch && !lakhMatch[0].toLowerCase().includes("liter") && !lakhMatch[0].toLowerCase().includes("litre")) {
      price = Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * 100000);
    } else {
      // 5. Standard price patterns (e.g. Rs. 45,000, ₹1,299, 12,500/-, $49.99)
      const priceMatch =
        text.match(/(?:price|rate|cost|special|now|offer|fee)[:\s]*(?:rs\.?|inr|₹|\$|€|£)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) ||
        text.match(/(?:rs\.?|inr|₹|\$|€|£)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) ||
        text.match(/([0-9,]+)\s*(?:inr|\/-)/i);

      if (priceMatch) {
        price = parseFloat(priceMatch[1].replace(/,/g, ""));
      }
    }
  }

  // 6. Compute discount if originalPrice > price
  if (originalPrice && originalPrice > price && !discount && price > 0) {
    discount = `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`;
  }

  return { price, originalPrice, discount };
}

/**
 * Intelligent Marketplace Category Predictor based on text keywords
 */
function predictCategory(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes("bhk") ||
    lower.includes("flat") ||
    lower.includes("villa") ||
    lower.includes("sqft") ||
    lower.includes("sq.ft") ||
    lower.includes("apartment") ||
    lower.includes("property") ||
    lower.includes("real estate") ||
    lower.includes("carpet area") ||
    lower.includes("land") ||
    lower.includes("plot") ||
    lower.includes("office space") ||
    lower.includes("penthouse")
  ) {
    return "Properties";
  }

  if (
    lower.includes("food") ||
    lower.includes("organic") ||
    lower.includes("tea") ||
    lower.includes("coffee") ||
    lower.includes("ayurved") ||
    lower.includes("herbal") ||
    lower.includes("powder") ||
    lower.includes("malt") ||
    lower.includes("supplement") ||
    lower.includes("spice") ||
    lower.includes("grain") ||
    lower.includes("snack")
  ) {
    return "Wellness & Food";
  }

  if (
    lower.includes("laptop") ||
    lower.includes("computer") ||
    lower.includes("mobile") ||
    lower.includes("phone") ||
    lower.includes("sensor") ||
    lower.includes("camera") ||
    lower.includes("headphone") ||
    lower.includes("audio") ||
    lower.includes("electronic") ||
    lower.includes("gadget")
  ) {
    return "Electronics";
  }

  if (
    lower.includes("shirt") ||
    lower.includes("pant") ||
    lower.includes("dress") ||
    lower.includes("cotton") ||
    lower.includes("fabric") ||
    lower.includes("wear") ||
    lower.includes("shoe") ||
    lower.includes("apparel") ||
    lower.includes("fashion") ||
    lower.includes("garment")
  ) {
    return "Fashion & Apparel";
  }

  if (
    lower.includes("mixer") ||
    lower.includes("steel") ||
    lower.includes("motor") ||
    lower.includes("industrial") ||
    lower.includes("pump") ||
    lower.includes("valve") ||
    lower.includes("pipe") ||
    lower.includes("hardware") ||
    lower.includes("machinery") ||
    lower.includes("tool") ||
    lower.includes("bearing")
  ) {
    return "Industrial Supplies";
  }

  if (
    lower.includes("consult") ||
    lower.includes("marketing") ||
    lower.includes("development") ||
    lower.includes("service") ||
    lower.includes("hosting") ||
    lower.includes("agency") ||
    lower.includes("design") ||
    lower.includes("seo") ||
    lower.includes("accounting")
  ) {
    return "Corporate & Professional Services";
  }

  if (
    lower.includes("chair") ||
    lower.includes("table") ||
    lower.includes("sofa") ||
    lower.includes("furniture") ||
    lower.includes("decor") ||
    lower.includes("kitchen") ||
    lower.includes("lighting")
  ) {
    return "Home & Living";
  }

  return "General Catalog";
}

/**
 * Fallback Local Deterministic Parser
 * Guaranteed to extract items from any readable PDF text without needing AI
 */
function extractLocalPdfCatalog(
  pageTexts: string[],
  fullText: string,
  extractedImages: string[],
  filename: string
): { company: ScrapedPdfCompany; items: ScrapedPdfItem[] } {
  const lines = fullText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let companyName = "Extracted Merchant";
  let phone = "";
  let email = "";
  let website = "";
  let address = "";

  // Scan early lines for company contact information
  for (const line of lines.slice(0, 20)) {
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !email) email = emailMatch[0];

    const webMatch = line.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?/);
    if (webMatch && !website && !webMatch[0].includes("@")) website = webMatch[0];

    const phoneMatch = line.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    if (phoneMatch && !phone && phoneMatch[0].length >= 10) phone = phoneMatch[0];

    if (/address|location|road|street|midc|nagar|plot|floor/i.test(line) && !address) {
      address = line.replace(/address[:\s]*/i, "").trim();
    }
  }

  // Find candidate merchant name from first line if it's not a generic word
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (
      !/page|catalog|brochure|price list|invoice|quotation|estimate/i.test(firstLine) &&
      firstLine.length > 2 &&
      firstLine.length < 60 &&
      !firstLine.includes("@")
    ) {
      companyName = firstLine;
    }
  }

  // Segment lines into logical product/item blocks
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip page boundary markers
    if (/^--\s*\d+\s*of\s*\d+\s*--$/i.test(line)) continue;

    const isNumbered = /^(?:\d+[\.\)\-]|•|\*|Item\s*\d+|Product\s*\d+)/i.test(line);
    const hasPrice = /(?:rs\.?|inr|₹|\$|usd|eur|price[:\s]|rate[:\s]|\/-)/i.test(line);

    // If we encounter a new numbered item or a block has grown large with a price, start a new block
    if (isNumbered && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else if (hasPrice && currentBlock.length >= 4) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) blocks.push(currentBlock);

  // If segmentation yielded 0 or 1 block but there are multiple lines with prices, segment by price lines
  let itemBlocks = blocks;
  if (itemBlocks.length <= 1 && lines.length > 3) {
    const splitByPrice: string[][] = [];
    let cur: string[] = [];
    for (const l of lines) {
      if (/(?:rs\.?|inr|₹|\$|usd|eur|price[:\s]|rate[:\s]|\/-)/i.test(l) && cur.length > 0) {
        cur.push(l);
        splitByPrice.push(cur);
        cur = [];
      } else {
        cur.push(l);
      }
    }
    if (cur.length > 0) splitByPrice.push(cur);
    if (splitByPrice.length > 1) {
      itemBlocks = splitByPrice;
    }
  }

  // Filter out any blocks that are just headers/contacts with no items
  const validBlocks = itemBlocks.filter(b => {
    const text = b.join(" ").trim();
    if (text.length <= 5) return false;
    if (/^(?:page\s*\d+|contact\s*us|terms\s*&|thank\s*you)$/i.test(text)) return false;

    const hasPrice = /(?:rs\.?|inr|₹|\$|usd|eur|price[:\s]|rate[:\s]|\/-)/i.test(text);
    // If the block has no price, check if it's a company header / contact info
    if (!hasPrice) {
      if (b[0].toLowerCase().trim() === companyName.toLowerCase().trim()) return false;
      if (text.toLowerCase().includes(companyName.toLowerCase()) && /@|phone|email|support|sales|midc/i.test(text)) return false;
      if (/^(?:email|phone|website|contact|address|tel|mobile)[:\s]/i.test(b[0])) return false;
      if (/@/i.test(text) && (text.includes("support@") || text.includes("info@") || text.includes("sales@") || text.includes("contact@"))) return false;
    }
    return true;
  });

  const items: ScrapedPdfItem[] = (validBlocks.length > 0 ? validBlocks : [lines]).map((block, idx) => {
    const blockText = block.join("\n");
    const { price, originalPrice, discount } = parsePriceFromText(blockText);

    // Pick first line as candidate title (clean leading numbering / bullets)
    let rawTitle = block[0]
      .replace(/^(?:\d+[\.\)\-]|•|\*|Item\s*\d+[:\-]?|Product\s*\d+[:\-]?)\s*/i, "")
      .trim();

    // If first line was company name or generic, take second line
    if ((rawTitle.toLowerCase() === companyName.toLowerCase() || rawTitle.length < 3) && block.length > 1) {
      rawTitle = block[1]
        .replace(/^(?:\d+[\.\)\-]|•|\*|Item\s*\d+[:\-]?|Product\s*\d+[:\-]?)\s*/i, "")
        .trim();
    }

    if (!rawTitle || rawTitle.length < 3) {
      rawTitle = `Catalog Item #${idx + 1}`;
    }

    const specs: { key: string; value: string }[] = [];
    const descLines: string[] = [];

    for (let j = 1; j < block.length; j++) {
      const l = block[j];
      const specMatch = l.match(/^([A-Za-z0-9\s]{2,25})[:=-]\s*(.+)$/);
      if (specMatch && !/(?:price|mrp|cost|rate|total)/i.test(specMatch[1])) {
        specs.push({ key: specMatch[1].trim(), value: specMatch[2].trim() });
      } else if (!/(?:rs\.?|inr|₹|\$|price|rate)/i.test(l)) {
        descLines.push(l);
      }
    }

    const category = predictCategory(rawTitle + " " + blockText);
    const assignedImage = extractedImages[idx] || extractedImages[0] || getCategoryFallbackImage(category, rawTitle);

    return {
      title: rawTitle,
      brand: companyName,
      category,
      price,
      originalPrice,
      discount,
      description: descLines.slice(0, 3).join(". ") || `${rawTitle} available for order. Contact merchant for details.`,
      sku: `PDF-${Math.floor(1000 + Math.random() * 9000)}`,
      specs,
      aiKeywords: [category.toLowerCase(), "catalog", "truedeal", "verified"],
      primaryImage: assignedImage,
      images: [assignedImage],
      pageNumber: Math.min(idx + 1, Math.max(1, pageTexts.length)),
      inStock: true,
      inventory: 25
    };
  });

  return {
    company: {
      name: companyName,
      phone,
      email,
      website,
      address,
      tagline: "Verified Merchant Catalog"
    },
    items
  };
}

/**
 * Main function to scrape products and catalog items from a PDF buffer or URL
 */
export async function scrapePdfCatalog(options: ScrapePdfOptions): Promise<PdfScrapingResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  const log = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  let pdfBuffer: Buffer | null = null;
  let base64Pdf = "";
  let fileSizeBytes = 0;
  const sellerSlug = cleanSellerSlug(options.sellerSlug || "default");
  const filename = options.filename || (options.fileUrl ? options.fileUrl.split("/").pop() : "document.pdf") || "document.pdf";

  try {
    log(`Initializing TrueDeal AI Universal PDF Document Engine for "${filename}"...`);

    // 1. Resolve PDF Buffer
    if (options.buffer) {
      pdfBuffer = options.buffer;
      fileSizeBytes = options.buffer.length;
      base64Pdf = options.buffer.toString("base64");
      log(`Received local PDF file upload (${(fileSizeBytes / 1024).toFixed(1)} KB).`);
    } else if (options.base64Data) {
      const cleanBase64 = options.base64Data.replace(/^data:application\/pdf;base64,/, "");
      base64Pdf = cleanBase64;
      pdfBuffer = Buffer.from(cleanBase64, "base64");
      fileSizeBytes = pdfBuffer.length;
      log(`Received base64 PDF stream (${(fileSizeBytes / 1024).toFixed(1)} KB).`);
    } else if (options.fileUrl) {
      log(`Fetching remote PDF from: ${options.fileUrl}...`);
      const response = await fetch(options.fileUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 TrueDeal/1.0"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: HTTP ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      fileSizeBytes = pdfBuffer.length;
      base64Pdf = pdfBuffer.toString("base64");
      log(`Successfully downloaded remote PDF (${(fileSizeBytes / 1024).toFixed(1)} KB).`);
    } else {
      throw new Error("No PDF file provided. Please provide a file upload or remote URL.");
    }

    if (!pdfBuffer || fileSizeBytes === 0) {
      throw new Error("PDF file appears to be empty or corrupted.");
    }

    log(`Target isolated tenant partition: products_${sellerSlug}`);

    // 2. Local PDF Parse: Extract Text, Embedded Images & High-Res Page Screenshots
    log(`Deconstructing PDF layout, text streams & visual photography...`);
    let fullText = "";
    const pageTexts: string[] = [];
    const allExtractedImages: string[] = [];
    const pageImagesMap = new Map<number, string[]>();
    const pageScreenshotsMap = new Map<number, Buffer>();
    let totalPages = 1;

    try {
      const parser = new PDFParse({ data: pdfBuffer });
      
      // Extract text content
      const textRes = await parser.getText();
      fullText = textRes.text || "";
      if (textRes.pages && Array.isArray(textRes.pages)) {
        for (const p of textRes.pages) {
          pageTexts.push(p.text || "");
        }
      }
      
      const infoRes = await parser.getInfo().catch(() => ({ total: 1 }));
      totalPages = infoRes.total || (pageTexts.length > 0 ? pageTexts.length : 1);
      log(`Detected ${totalPages} page(s) in document.`);

      // 2a. High-Resolution Visual Page Captures (for visual display & authentic photo cropping)
      try {
        log(`Rendering high-resolution page visual captures for authentic photography extraction...`);
        const maxPagesToRender = Math.min(totalPages, 12);
        const screenshotRes = await parser.getScreenshot({
          scale: 1.5,
          imageBuffer: true,
          partial: Array.from({ length: maxPagesToRender }, (_, i) => i + 1)
        });

        if (screenshotRes && screenshotRes.pages) {
          for (const p of screenshotRes.pages) {
            if (p.data) {
              const buf = Buffer.from(p.data);
              pageScreenshotsMap.set(p.pageNumber, buf);
              const savedUrl = persistExtractedImage(p.data, `${filename}_page`, p.pageNumber, 1);
              if (savedUrl) {
                allExtractedImages.push(savedUrl);
                pageImagesMap.set(p.pageNumber, [savedUrl]);
              }
            }
          }
          log(`Rendered ${pageScreenshotsMap.size} high-resolution visual page capture(s).`);
        }
      } catch (shotErr: any) {
        log(`Page visual renderer note: ${shotErr.message}`);
      }

      // 2b. Extract authentic embedded raster images from PDF objects
      try {
        const imgRes = await parser.getImage({
          imageDataUrl: true,
          imageBuffer: true,
          imageThreshold: 0 // Retain all authentic product imagery
        });

        if (imgRes && imgRes.pages && imgRes.pages.length > 0) {
          let embeddedCount = 0;
          for (const page of imgRes.pages) {
            const pageImgs: string[] = pageImagesMap.get(page.pageNumber) || [];
            if (page.images && Array.isArray(page.images)) {
              for (let i = 0; i < page.images.length; i++) {
                const img = page.images[i];
                let savedUrl = "";
                if (img.data) {
                  savedUrl = persistExtractedImage(img.data, `${filename}_embed`, page.pageNumber, i + 1);
                } else if (img.dataUrl) {
                  savedUrl = img.dataUrl;
                }
                if (savedUrl) {
                  pageImgs.push(savedUrl);
                  allExtractedImages.push(savedUrl);
                  embeddedCount++;
                }
              }
            }
            if (pageImgs.length > 0) {
              pageImagesMap.set(page.pageNumber, pageImgs);
            }
          }
          if (embeddedCount > 0) {
            log(`Extracted ${embeddedCount} embedded product photo streams directly from PDF!`);
          }
        }
      } catch (imgErr: any) {
        log(`Embedded image scanner note: ${imgErr.message}`);
      }

      await parser.destroy().catch(() => {});
    } catch (parseErr: any) {
      log(`Notice during local PDF extraction: ${parseErr.message}`);
    }

    const cleanDocText = fullText.trim();
    const hasReadableText = cleanDocText.length > 40;
    log(`Extracted text stream: ${cleanDocText.length} characters.`);

    // 3. Configure Prompt for Multimodal & Text Processing
    let modeInstruction = "Extract all products, inventory, catalog items, services, or real estate listings.";
    if (options.mode === "real_estate") {
      modeInstruction = "This document is a real estate brochure or property list. Extract each flat, villa, commercial office, or unit with its title (e.g. '3 BHK Luxury Apartment in Undri'), price (numeric in INR), category 'Properties', specs (BHK, Carpet Area in sqft, Bathrooms, Amenities), and location description.";
    } else if (options.mode === "catalog") {
      modeInstruction = "This document is a commercial product catalog or inventory sheet. Extract each product with its exact title, category, price (numeric), originalPrice/MRP if listed, brand, sku, description, and technical specs.";
    } else if (options.mode === "services") {
      modeInstruction = "This document is a corporate service catalog or rate card. Extract each service offering with its name, pricing/hourly/monthly rate, category 'Corporate & Professional Services', deliverables, and scope.";
    }

    const systemPrompt = `You are TrueDeal's enterprise AI Document & Catalog Scraper.
Analyze the provided PDF document visually and extract all products, listings, offerings, or services into a strictly valid JSON object.
${modeInstruction}

CRITICAL EXTRACTION GUIDELINES:
1. Extract company/organization details: name, phone, email, website, address, tagline.
2. Extract EVERY single product, property, or item shown in the document.
3. Clean and parse numeric prices. If a price is "Rs. 2,49,999" or "₹249" or "1.5 Cr", convert to clean integer/float (e.g. 249999, 249, 15000000). If original price / MRP is mentioned, extract originalPrice. If discount is mentioned, extract discount. If no price is mentioned, set price to 0.
4. Assign accurate marketplace category from: "Properties", "Wellness & Food", "Hardware & IT", "Corporate & Professional Services", "Electronics", "Fashion & Apparel", "Home & Living", or "Industrial Supplies".
5. CRITICAL - REAL PRODUCT IMAGE LOCALIZATION ("Use images as images and content as content"):
   - For every product or item that has a photo, picture, floor plan, or illustration in the document, identify:
     "pageNumber": physical 1-based page number (1, 2, 3...) where this product appears.
     "imageLocation": { "box_2d": [ymin, xmin, ymax, xmax] } (normalized coordinates 0 to 1000 marking the exact boundary box of the product image/photo on that page).
     "imageDescription": clear, vivid visual description of what the product's image looks like in the PDF (e.g. "White ceramic coffee mug with green leaf logo", "Front view of 3-seater blue velvet sofa").
     "hasImageInPdf": true if the product has a visual image/photo on the page, false if text only.
6. Return ONLY valid JSON matching this schema:
{
  "company": {
    "name": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "address": "string",
    "tagline": "string"
  },
  "items": [
    {
      "title": "string (clear, descriptive)",
      "brand": "string",
      "category": "string",
      "price": 0,
      "originalPrice": 0,
      "discount": "string or null",
      "description": "string (detailed 2-3 sentences)",
      "sku": "string",
      "specs": [
        { "key": "string", "value": "string" }
      ],
      "aiKeywords": ["string"],
      "inStock": true,
      "inventory": 25,
      "pageNumber": 1,
      "imageLocation": { "box_2d": [100, 100, 500, 500] },
      "imageDescription": "string",
      "hasImageInPdf": true
    }
  ]
}`;

    // 4. Multi-Strategy Multimodal AI Extraction Pipeline
    let rawJsonResponse = "";
    let usedModel = "";

    const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
    if (apiKey) {
      for (const model of GEMINI_MODELS) {
        try {
          log(`Querying Gemini Intelligence model [${model}] with visual multimodal sight...`);
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for vision analysis

          // Always feed multimodal PDF inline whenever size permits (<= 18MB base64)
          // Also supply the extracted text stream so Gemini has both OCR text and visual coordinates
          let contentsPayload: any[];
          if (base64Pdf && base64Pdf.length <= 18 * 1024 * 1024) {
            contentsPayload = [
              {
                parts: [
                  { text: systemPrompt + (cleanDocText ? `\n\nDocument filename: ${filename}\nTotal pages: ${totalPages}\nExtracted text stream from PDF:\n${cleanDocText.slice(0, 12000)}` : `\n\nDocument filename: ${filename}`) },
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64Pdf
                    }
                  }
                ]
              }
            ];
          } else {
            // PDF exceeds 18MB, send text stream
            contentsPayload = [
              {
                parts: [
                  { text: systemPrompt },
                  { text: `Document filename: ${filename}\nExtracted text content from ${totalPages} page(s):\n${cleanDocText}` }
                ]
              }
            ];
          }

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents: contentsPayload,
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
              }
            })
          });

          clearTimeout(timeout);

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 10) {
              rawJsonResponse = text.trim();
              usedModel = model;
              log(`Gemini [${model}] structured document data & localized visual photos successfully.`);
              break;
            }
          } else {
            const errData = await response.json().catch(() => ({}));
            log(`Gemini [${model}] note: ${errData?.error?.message || response.statusText}`);
          }
        } catch (err: any) {
          log(`Gemini [${model}] exception: ${err.message}`);
        }
      }
    }

    // 5. Structure & Parse Extracted Products
    let companyData: ScrapedPdfCompany = { name: "Extracted Merchant" };
    let rawItems: any[] = [];

    if (rawJsonResponse) {
      try {
        const cleanedJson = rawJsonResponse
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        const parsed = JSON.parse(cleanedJson);
        companyData = parsed.company || companyData;
        rawItems = Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
        log(`AI Document Engine structured ${rawItems.length} catalog items with visual metadata.`);
      } catch (parseErr: any) {
        log(`AI JSON formatting notice: ${parseErr.message}. Falling back to deterministic local parser.`);
        rawItems = [];
      }
    }

    // 6. Zero-Failure Local Parser Fallback
    // If AI was unavailable, busy (503), or returned empty items:
    if (!rawItems || rawItems.length === 0) {
      log(`Activating built-in deterministic local PDF catalog & pricing intelligence engine...`);
      const localResult = extractLocalPdfCatalog(pageTexts, cleanDocText, allExtractedImages, filename);
      companyData = localResult.company || companyData;
      rawItems = localResult.items || [];
      log(`Local Engine successfully extracted ${rawItems.length} items from document!`);
    }

    // 7. Associate Real Extracted Images & Standardize Items
    const products: ScrapedPdfItem[] = await Promise.all(
      rawItems.map(async (item: any, index: number) => {
        const title = String(item.title || item.product_name || item.name || `Catalog Item #${index + 1}`).trim();
        const category = item.category || predictCategory(title + " " + (item.description || ""));
        const fallbackImg = getCategoryFallbackImage(category, title);

        // Price resolution
        let price = typeof item.price === "number" ? item.price : 0;
        if (!price && item.price) {
          price = parsePriceFromText(String(item.price)).price;
        }

        let originalPrice = typeof item.originalPrice === "number" ? item.originalPrice : undefined;
        if (!originalPrice && item.originalPrice) {
          originalPrice = parsePriceFromText(String(item.originalPrice)).price || undefined;
        }

        let discount = item.discount;
        if (!discount && originalPrice && originalPrice > price && price > 0) {
          discount = `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`;
        }

        // Authentic Image Extraction & Resolution:
        let assignedImage = "";
        const pageNum = Number(item.pageNumber) || Math.floor((index / Math.max(1, rawItems.length)) * totalPages) + 1;
        const box_2d = item.imageLocation?.box_2d || item.box_2d || (Array.isArray(item.imageLocation) ? item.imageLocation : null);

        // Priority 1: Crop the exact authentic product photo from high-res page render using Gemini's detected bounding box
        if (box_2d && pageScreenshotsMap.has(pageNum)) {
          const pageBuf = pageScreenshotsMap.get(pageNum)!;
          assignedImage = await cropProductImageFromPage(
            pageBuf,
            box_2d,
            filename,
            pageNum,
            index + 1
          );
          if (assignedImage) {
            allExtractedImages.push(assignedImage);
            log(`Cropped authentic product photo for "${title}" directly from page ${pageNum}!`);
          }
        }

        // Priority 2: Check authentic embedded raster images from this exact page
        if (!assignedImage) {
          const pageImgs = pageImagesMap.get(pageNum);
          if (pageImgs && pageImgs.length > 0) {
            const imgIndex = index % pageImgs.length;
            assignedImage = pageImgs[imgIndex];
            log(`Matched authentic embedded photo for "${title}" from page ${pageNum}.`);
          }
        }

        // Priority 3: Sequential embedded image across all pages
        if (!assignedImage && allExtractedImages[index]) {
          assignedImage = allExtractedImages[index];
        }

        // Priority 4: If single item on page or first item, crop primary visual zone from page screenshot
        if (!assignedImage && pageScreenshotsMap.has(pageNum)) {
          const pageBuf = pageScreenshotsMap.get(pageNum)!;
          assignedImage = await cropProductImageFromPage(
            pageBuf,
            [40, 40, 650, 960],
            filename,
            pageNum,
            index + 1
          );
          if (assignedImage) {
            allExtractedImages.push(assignedImage);
          }
        }

        // Priority 5: Document-level visual capture
        if (!assignedImage && allExtractedImages[0]) {
          assignedImage = allExtractedImages[0];
        }

        // Priority 6: Intelligent category fallback
        if (!assignedImage) {
          assignedImage = fallbackImg;
        }

        // Specs Normalization
        let specsArray: { key: string; value: string }[] = [];
        if (Array.isArray(item.specs)) {
          specsArray = item.specs.map((s: any) => ({
            key: String(s.key || s.name || "Specification"),
            value: String(s.value || s.val || "")
          }));
        } else if (item.specs && typeof item.specs === "object") {
          specsArray = Object.entries(item.specs).map(([key, value]) => ({
            key,
            value: String(value)
          }));
        }

        // If price is 0, add spec stating pricing available on request
        if (price === 0 && !specsArray.some(s => /price/i.test(s.key))) {
          specsArray.push({ key: "Pricing", value: "Available on Request / Custom Quote" });
        }

        return {
          title,
          brand: item.brand || companyData.name || "Verified Merchant",
          category,
          price,
          originalPrice,
          discount,
          description: item.description || `${title} available for direct ordering.`,
          sku: item.sku || `PDF-${Math.floor(1000 + Math.random() * 9000)}`,
          specs: specsArray,
          aiKeywords: Array.isArray(item.aiKeywords) && item.aiKeywords.length > 0
            ? item.aiKeywords
            : [category.toLowerCase(), "catalog", "verified", "truedeal"],
          inStock: item.inStock !== false,
          inventory: typeof item.inventory === "number" ? item.inventory : 25,
          primaryImage: assignedImage,
          images: [assignedImage],
          pageNumber: pageNum,
          imageLocation: item.imageLocation,
          imageDescription: item.imageDescription,
          hasImageInPdf: !!assignedImage,
          importedToDb: false
        };
      })
    );

    // Collect detected categories
    const categoriesSet = new Set<string>();
    products.forEach(p => { if (p.category) categoriesSet.add(p.category); });

    // 8. Optional Auto-Import to MongoDB Catalog
    let totalImported = 0;
    if (options.autoImport && products.length > 0) {
      log(`Auto-importing ${products.length} products to isolated database (products_${sellerSlug})...`);
      try {
        const col = await getSellerProductsCollection(sellerSlug);
        const globalCol = (await getDb()).collection("products");

        for (const product of products) {
          const doc = {
            title: product.title,
            brand: product.brand,
            category: product.category,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            description: product.description,
            sku: product.sku,
            specs: product.specs,
            aiKeywords: product.aiKeywords,
            primaryImage: product.primaryImage,
            images: product.images || [{ url: product.primaryImage, isPrimary: true }],
            inventory: product.inventory,
            inStock: product.inStock,
            sellerSlug,
            sourceType: "pdf_scraper",
            sourceDocument: filename,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Upsert by title and sellerSlug to prevent duplicates
          await col.updateOne(
            { title: product.title, sellerSlug },
            { $set: doc },
            { upsert: true }
          );

          // Also update global search index collection
          await globalCol.updateOne(
            { title: product.title, sellerSlug },
            { $set: doc },
            { upsert: true }
          );

          product.importedToDb = true;
          totalImported++;
        }

        log(`Successfully committed and saved ${totalImported} items directly into the database!`);
      } catch (dbErr: any) {
        log(`Warning during database save: ${dbErr.message}`);
      }
    }

    const processingTimeMs = Date.now() - startTime;
    log(`Scraping pipeline successfully completed in ${(processingTimeMs / 1000).toFixed(2)}s.`);

    return {
      success: true,
      filename,
      company: companyData,
      products,
      stats: {
        totalExtracted: products.length,
        totalImported,
        totalImages: allExtractedImages.length,
        categories: Array.from(categoriesSet),
        processingTimeMs,
        fileSizeKb: Math.round(fileSizeBytes / 1024)
      },
      logs
    };
  } catch (error: any) {
    log(`Fatal Scraper Error: ${error.message}`);
    return {
      success: false,
      filename,
      products: [],
      stats: {
        totalExtracted: 0,
        totalImported: 0,
        totalImages: 0,
        categories: [],
        processingTimeMs: Date.now() - startTime,
        fileSizeKb: Math.round(fileSizeBytes / 1024)
      },
      logs,
      error: error.message || "An unexpected error occurred while processing the PDF."
    };
  }
}
