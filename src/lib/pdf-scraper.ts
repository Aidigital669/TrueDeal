/**
 * TrueDeal AI PDF Scraper & Document Intelligence Engine
 * Powered by Google Gemini Multimodal Document Processing (Gemini 2.5 / 3.6 Flash)
 */

import { getSellerProductsCollection, cleanSellerSlug, getDb } from "./mongodb";
import { getCategoryFallbackImage } from "./image-extractor";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
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
 * Main function to scrape products and catalog items from a PDF buffer or URL
 */
export async function scrapePdfCatalog(options: ScrapePdfOptions): Promise<PdfScrapingResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  const log = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  let base64Pdf = "";
  let fileSizeBytes = 0;
  const sellerSlug = cleanSellerSlug(options.sellerSlug || "default");
  const filename = options.filename || (options.fileUrl ? options.fileUrl.split("/").pop() : "document.pdf") || "document.pdf";

  try {
    log(`Initializing AI PDF Document Scraper for "${filename}"...`);

    // 1. Resolve PDF Buffer
    if (options.buffer) {
      fileSizeBytes = options.buffer.length;
      base64Pdf = options.buffer.toString("base64");
      log(`Received local PDF file upload (${(fileSizeBytes / 1024).toFixed(1)} KB).`);
    } else if (options.base64Data) {
      const cleanBase64 = options.base64Data.replace(/^data:application\/pdf;base64,/, "");
      base64Pdf = cleanBase64;
      fileSizeBytes = Math.round((cleanBase64.length * 3) / 4);
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
      const buf = Buffer.from(arrayBuffer);
      fileSizeBytes = buf.length;
      base64Pdf = buf.toString("base64");
      log(`Successfully downloaded remote PDF (${(fileSizeBytes / 1024).toFixed(1)} KB).`);
    } else {
      throw new Error("No PDF file provided. Please provide a file upload or remote URL.");
    }

    if (!base64Pdf || fileSizeBytes === 0) {
      throw new Error("PDF file appears to be empty or corrupted.");
    }

    log(`Target isolated tenant partition: products_${sellerSlug}`);
    log(`Connecting to Gemini Multimodal Document Intelligence pipeline...`);

    // 2. Select prompt instructions based on mode
    let modeInstruction = "Extract all products, inventory, catalog items, services, or real estate listings.";
    if (options.mode === "real_estate") {
      modeInstruction = "This document is a real estate brochure or property list. Extract each flat, villa, commercial office, or unit with its title (e.g. '3 BHK Luxury Apartment in Undri'), price (numeric in INR), category 'Properties', specs (BHK, Carpet Area in sqft, Bathrooms, Amenities), and location description.";
    } else if (options.mode === "catalog") {
      modeInstruction = "This document is a commercial product catalog or inventory sheet. Extract each product with its exact title, category, price (numeric), originalPrice/MRP if listed, brand, sku, description, and technical specs.";
    } else if (options.mode === "services") {
      modeInstruction = "This document is a corporate service catalog or rate card. Extract each service offering with its name, pricing/hourly/monthly rate, category 'Corporate & Professional Services', deliverables, and scope.";
    }

    const systemPrompt = `You are TrueDeal's enterprise AI Document & Catalog Scraper.
Analyze the provided PDF document and extract all products, listings, offerings, or services into a strictly valid JSON object.
${modeInstruction}

IMPORTANT EXTRACTION GUIDELINES:
1. Extract the company/organization details: name, phone, email, website, address, tagline.
2. Extract EVERY single product, property, or item listed in the document.
3. Clean and parse numeric prices. If a price is "Rs. 2,49,999" or "₹249", convert to the clean integer 249999 or 249. If a price range like "₹50L - ₹65L", use the starting number (e.g. 5000000). If no price is given, provide a realistic estimated market price or 0.
4. Assign an accurate marketplace category from: "Properties", "Wellness & Food", "Hardware & IT", "Corporate & Professional Services", "Electronics", "Fashion & Apparel", "Home & Living", or "Industrial Supplies".
5. Generate 4-8 relevant search keywords for each item.
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
      "discount": "string (e.g. 15% OFF or null)",
      "description": "string (detailed 2-3 sentences)",
      "sku": "string",
      "specs": [
        { "key": "string", "value": "string" }
      ],
      "aiKeywords": ["string", "string"],
      "inStock": true,
      "inventory": 25
    }
  ]
}`;

    // 3. Call Gemini Multimodal API with inlineData application/pdf
    let rawJsonResponse = "";
    let usedModel = "";

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    for (const model of GEMINI_MODELS) {
      try {
        log(`Engaging Gemini model [${model}] for multimodal layout extraction...`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000); // 35s timeout for deep PDFs

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64Pdf
                    }
                  }
                ]
              }
            ],
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
          if (text) {
            rawJsonResponse = text.trim();
            usedModel = model;
            log(`Gemini [${model}] processed PDF document successfully.`);
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

    if (!rawJsonResponse) {
      throw new Error("AI engine was unable to extract structured data from this PDF. Ensure the PDF contains readable text, tables, or catalog images.");
    }

    // 4. Parse JSON result
    let parsedData: any = null;
    try {
      // Remove possible markdown backticks if any
      const cleanedJson = rawJsonResponse
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsedData = JSON.parse(cleanedJson);
    } catch (e: any) {
      throw new Error(`Failed to parse AI JSON response: ${e.message}`);
    }

    const companyData: ScrapedPdfCompany = parsedData.company || { name: "Extracted Merchant" };
    const rawItems: any[] = Array.isArray(parsedData.items)
      ? parsedData.items
      : Array.isArray(parsedData)
      ? parsedData
      : [];

    log(`AI Document Engine extracted ${rawItems.length} catalog items from PDF.`);

    // 5. Transform and normalize extracted items
    const products: ScrapedPdfItem[] = rawItems.map((item: any, index: number) => {
      const title = item.title || item.product_name || item.name || `Catalog Item #${index + 1}`;
      const category = item.category || "General Catalog";
      const price = typeof item.price === "number" ? item.price : parseFloat(String(item.price || "0").replace(/[^0-9.]/g, "")) || 0;
      const originalPrice = item.originalPrice ? (typeof item.originalPrice === "number" ? item.originalPrice : parseFloat(String(item.originalPrice).replace(/[^0-9.]/g, "")) || undefined) : undefined;
      const fallbackImg = getCategoryFallbackImage(category, title);

      // Normalize specs
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

      return {
        title,
        brand: item.brand || companyData.name || "Verified Brand",
        category,
        price,
        originalPrice,
        discount: item.discount || (originalPrice && originalPrice > price ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF` : undefined),
        description: item.description || `${title} available for direct ordering.`,
        sku: item.sku || `PDF-${Math.floor(1000 + Math.random() * 9000)}`,
        specs: specsArray,
        aiKeywords: Array.isArray(item.aiKeywords) ? item.aiKeywords : [category.toLowerCase(), "catalog", "truedeal"],
        inStock: item.inStock !== false,
        inventory: typeof item.inventory === "number" ? item.inventory : 25,
        primaryImage: item.primaryImage || fallbackImg,
        importedToDb: false
      };
    });

    // Collect detected categories
    const categoriesSet = new Set<string>();
    products.forEach(p => { if (p.category) categoriesSet.add(p.category); });

    // 6. Optional Auto-Import to MongoDB Catalog
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
            images: [{ url: product.primaryImage, isPrimary: true }],
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
    log(`Scraping pipeline completed in ${(processingTimeMs / 1000).toFixed(2)}s.`);

    return {
      success: true,
      filename,
      company: companyData,
      products,
      stats: {
        totalExtracted: products.length,
        totalImported,
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
        categories: [],
        processingTimeMs: Date.now() - startTime,
        fileSizeKb: Math.round(fileSizeBytes / 1024)
      },
      logs,
      error: error.message || "An unexpected error occurred while processing the PDF."
    };
  }
}
