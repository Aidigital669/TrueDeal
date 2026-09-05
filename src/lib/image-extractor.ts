/**
 * ============================================================================
 * TrueDeal Superpowerful Image & Media Intelligence Engine
 * ============================================================================
 * Extracts 100% authentic, high-resolution product and website imagery across:
 * - Lazy-loaded attributes (data-src, data-original, data-lazy, data-zoom-image, data-srcset)
 * - HTML5 <picture> and <source srcset="..."> elements
 * - Next.js SSR Hydration State (<script id="__NEXT_DATA__">, /_next/image optimizer)
 * - Schema.org JSON-LD graph nodes (Product, RealEstateListing, Offer, ImageObject)
 * - Embedded JavaScript stores (Shopify meta.product, WooCommerce variation arrays, SPA state)
 * - Deep raw HTML regex scanner for known high-bandwidth image CDNs
 * - High-res upgrader (Shopify, Amazon, WordPress, Cloudinary, Unsplash)
 * - Intelligent anti-junk filter (removes 1x1 tracking pixels, payment badges, social icons)
 * ============================================================================
 */

import * as cheerio from "cheerio";

export interface ExtractedMedia {
  primaryImage: string;
  images: string[];
}

/**
 * Resolves any relative URL to an absolute URL
 */
export function makeAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
  if (!relativeUrl) return "";
  let clean = relativeUrl.trim();

  // Strip wrapping quotes/escapes often found in inline JS/JSON
  clean = clean.replace(/^['"\\]+|['"\\]+$/g, "").replace(/\\u002f/gi, "/").replace(/\\\//g, "/");

  // Handle Next.js Image Optimizer: /_next/image?url=...&w=...&q=...
  if (clean.includes("/_next/image")) {
    try {
      const parsed = new URL(clean, baseUrl);
      const innerUrl = parsed.searchParams.get("url");
      if (innerUrl) {
        clean = decodeURIComponent(innerUrl);
      }
    } catch {}
  }

  // Handle protocol-relative URL: //cdn.shopify.com/...
  if (clean.startsWith("//")) {
    return `https:${clean}`;
  }

  // Already absolute HTTP/HTTPS URL
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  try {
    const baseObj = new URL(baseUrl);
    // If clean starts with '/', resolve directly to origin
    if (clean.startsWith("/")) {
      return new URL(clean, baseObj.origin).href;
    }
    // If clean is a root asset path (does not start with ./ or ../), resolve directly against origin
    if (!clean.startsWith("./") && !clean.startsWith("../")) {
      return new URL(`/${clean}`, baseObj.origin).href;
    }
    return new URL(clean, baseUrl).href;
  } catch {
    return clean;
  }
}

/**
 * Upgrade low-res thumbnail image URLs to full high-resolution assets
 */
export function upgradeImageUrl(url: string, baseUrl?: string): string {
  if (!url) return "";
  let fullUrl = baseUrl ? makeAbsoluteUrl(url, baseUrl) : url;

  // 1. Next.js image URL extractor
  if (fullUrl.includes("/_next/image")) {
    try {
      const u = new URL(fullUrl);
      const inner = u.searchParams.get("url");
      if (inner) {
        fullUrl = baseUrl ? makeAbsoluteUrl(decodeURIComponent(inner), baseUrl) : decodeURIComponent(inner);
      }
    } catch {}
  }

  // 2. Shopify CDN upgrade:
  // e.g. product_100x100.jpg -> product_2048x2048.jpg or remove size suffix
  if (fullUrl.includes("cdn.shopify.com") || fullUrl.includes("/cdn/shop/")) {
    fullUrl = fullUrl.replace(/_(?:pico|icon|thumb|small|compact|medium|large|grande|100x100|200x200|300x300|400x400|500x500|600x600|800x800|1024x1024|crop_center)(?=[._])/gi, "_2048x2048");
    fullUrl = fullUrl.replace(/_(?:\d+x\d+)(?=[._])/gi, "_2048x2048");
  }

  // 3. Amazon Image CDN upgrade:
  // e.g. ._AC_SR100,100_.jpg or ._SX300_.jpg -> ._AC_SL1500_.jpg
  if (fullUrl.includes("media-amazon.com") || fullUrl.includes("images-amazon.com") || fullUrl.includes("ssl-images-amazon.com")) {
    fullUrl = fullUrl.replace(/\._[A-Z0-9_,]+_\./i, "._AC_SL1500_.");
  }

  // 4. WordPress / WooCommerce Uploads upgrade:
  // e.g. image-150x150.jpg, image-300x300.jpg, image-768x512.jpg -> image.jpg
  if (fullUrl.includes("/wp-content/uploads/")) {
    fullUrl = fullUrl.replace(/-\d{2,4}x\d{2,4}(?=\.[a-z]{3,4})/i, "");
  }

  // 5. Cloudinary CDN upgrade:
  if (fullUrl.includes("res.cloudinary.com")) {
    fullUrl = fullUrl.replace(/\/w_\d+,h_\d+,c_[a-z]+\//i, "/w_1400,q_auto,f_auto/");
    fullUrl = fullUrl.replace(/\/w_\d+\//i, "/w_1400/");
    fullUrl = fullUrl.replace(/\/h_\d+\//i, "/h_1400/");
  }

  // 6. Unsplash upgrade:
  if (fullUrl.includes("images.unsplash.com")) {
    fullUrl = fullUrl.replace(/w=\d+/i, "w=1400").replace(/q=\d+/i, "q=85");
    if (!fullUrl.includes("w=1400")) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + "w=1400&q=85";
    }
  }

  // 7. Contentful CDN (ctfassets.net) upgrade:
  if (fullUrl.includes("images.ctfassets.net") || fullUrl.includes("ctfassets.net")) {
    fullUrl = fullUrl.replace(/([?&])w=\d+/i, "$1w=1400");
    if (!fullUrl.includes("w=1400") && !fullUrl.includes("w=1920")) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + "w=1400&fm=jpg&q=85";
    }
    // Remove any accidental width= that causes 400 Bad Request on Contentful
    fullUrl = fullUrl.replace(/([?&])width=\d+/i, "$1w=1400");
  } else {
    // 8. Generic dimension query params
    fullUrl = fullUrl.replace(/([?&])width=\d+/i, "$1width=1400");
    fullUrl = fullUrl.replace(/([?&])w=\d+/i, "$1w=1400");
    fullUrl = fullUrl.replace(/([?&])height=\d+/i, "$1height=1400");
    fullUrl = fullUrl.replace(/([?&])h=\d+/i, "$1h=1400");
    fullUrl = fullUrl.replace(/([?&])max_width=\d+/i, "$1max_width=1400");
  }

  return fullUrl;
}

// Junk keywords that indicate non-product graphics
const JUNK_IMAGE_KEYWORDS = [
  "1x1", "pixel", "blank.gif", "spacer", "tracking", "transparent",
  "data:image/gif;base64,R0lGOD", "data:image/svg+xml",
  "visa", "mastercard", "amex", "discover", "paypal", "paytm", "gpay", "rupay", "applepay", "payment-methods", "payment_icons", "payment-icons",
  "trust-badge", "secure-checkout", "money-back", "guarantee-badge", "ssl-seal", "norton", "mcafee",
  "facebook.svg", "twitter.svg", "instagram.svg", "whatsapp.svg", "youtube.svg", "linkedin.svg", "social-icons",
  "star.svg", "star-rating", "rating-star", "arrow-right", "arrow-left", "chevron", "close.svg", "menu.svg", "search.svg", "cart.svg", "shopping-bag.svg",
  "loading.gif", "spinner.gif", "loader.gif", "placeholder", "default-avatar", "avatar-", "author-", "user-icon",
  "no-image", "noimage", "no_image", "notfound", "not-found", "sample-logo",
  "badge-", "icon-", "icon_", "-icon.", "_icon.",
  "whitepureplus", "pureplus.png", "/logo.", "-logo.", "_logo.", "logo-", "logo_", "brand-logo", "header-logo", "footer-logo"
];

/**
 * Validates if an image URL is an authentic, high-quality product/catalog asset
 */
export function isValidProductImage(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim().toLowerCase();

  // Must be valid URL length and format
  if (clean.length < 8) return false;
  if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("//") && !clean.startsWith("/")) return false;

  // Reject template placeholders like " + record.Url + " or ${...} or undefined/null/no-image/logo
  if (
    clean.includes("record.url") || 
    clean.includes('"+') || 
    clean.includes("'+") || 
    clean.includes("${") || 
    clean.includes("<%") || 
    clean.includes("undefined") || 
    clean.includes("null") || 
    clean.includes("no-image") || 
    clean.includes("noimage") ||
    clean.includes("ref.png") ||
    clean.includes("no-image-312x220") ||
    clean.includes("/images/logo.") ||
    clean.includes("/logo.") ||
    clean.includes("whitepureplus") ||
    clean.includes("pureplus.png") ||
    clean.endsWith("/logo.png") ||
    clean.endsWith("/logo.svg") ||
    clean.endsWith("/logo.jpeg") ||
    clean.endsWith("/logo.jpg") ||
    clean.endsWith("/logo.webp") ||
    clean.endsWith("/logo.avif")
  ) {
    return false;
  }

  // Filter known junk/tracking keywords
  for (const junk of JUNK_IMAGE_KEYWORDS) {
    if (clean.includes(junk)) return false;
  }

  // Must not be an inline base64 image unless substantial size
  if (clean.startsWith("data:image")) {
    if (clean.includes("data:image/svg+xml") || clean.length < 2000) return false;
  }

  // Check valid image file extension or known image CDN
  const hasImageExt = /\.(?:jpe?g|png|webp|avif|gif)(?:\?.*)?$/i.test(clean);
  const isImageCdn = clean.includes("cdn.") || 
                     clean.includes("images.") || 
                     clean.includes("cloudinary") || 
                     clean.includes("unsplash") || 
                     clean.includes("img.") || 
                     clean.includes("/uploads/") || 
                     clean.includes("/products/") || 
                     clean.includes("/product/") || 
                     clean.includes("/media/") || 
                     clean.includes("/images/") || 
                     clean.includes("/photos/") || 
                     clean.includes("/assets/") || 
                     clean.includes("/catalog/") || 
                     clean.includes("/storage/") ||
                     clean.includes("b2bbricksblob") ||
                     clean.includes("blob.core.windows.net") ||
                     clean.includes("azureedge.net") ||
                     clean.includes("s3.amazonaws.com") ||
                     clean.includes("r2.dev") ||
                     clean.includes("supabase.co") ||
                     clean.includes("digitaloceanspaces.com") ||
                     clean.includes("googleusercontent.com") ||
                     clean.includes("wp-content");

  return hasImageExt || isImageCdn;
}

/**
 * Parse a srcset attribute string and extract the highest-resolution URL
 * Example srcset: "img-small.jpg 300w, img-medium.jpg 600w, img-large.jpg 1200w"
 */
export function parseSrcset(srcset: string, baseUrl: string): string[] {
  if (!srcset) return [];
  const entries = srcset.split(/,\s+(?=[^,]+\s+\d+[wx])/).map(s => s.trim()).filter(Boolean);
  const candidates: { url: string; width: number }[] = [];

  for (const entry of entries) {
    const parts = entry.split(/\s+/);
    if (parts.length > 0) {
      const rawUrl = parts[0];
      let width = 0;
      if (parts[1]) {
        const wMatch = parts[1].match(/^(\d+)w$/i);
        const xMatch = parts[1].match(/^(\d+(?:\.\d+)?)x$/i);
        if (wMatch) width = parseInt(wMatch[1], 10);
        else if (xMatch) width = Math.round(parseFloat(xMatch[1]) * 600);
      }
      const abs = makeAbsoluteUrl(rawUrl, baseUrl);
      if (isValidProductImage(abs)) {
        candidates.push({ url: upgradeImageUrl(abs, baseUrl), width });
      }
    }
  }

  // Sort descending by resolution (highest quality first)
  candidates.sort((a, b) => b.width - a.width);
  return candidates.map(c => c.url);
}

/**
 * Extract images from HTML5 <picture> and <source> elements
 */
function extractPictureSourceImages($: cheerio.CheerioAPI, baseUrl: string, scope?: cheerio.Cheerio<any>): string[] {
  const images: string[] = [];
  const target = scope || $("body");

  target.find("picture source, source[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset") || $(el).attr("data-srcset");
    if (srcset) {
      const parsed = parseSrcset(srcset, baseUrl);
      for (const img of parsed) {
        if (!images.includes(img)) images.push(img);
      }
    }
  });

  return images;
}

/**
 * Extract images from standard DOM <img> elements scanning all lazy-load attributes
 */
function extractDomImages($: cheerio.CheerioAPI, baseUrl: string, scope?: cheerio.Cheerio<any>): string[] {
  const images: string[] = [];
  const target = scope || $("body");

  const ATTR_PRIORITY = [
    "data-zoom-image",
    "data-large-img",
    "data-large",
    "data-high-res-src",
    "data-full-url",
    "data-original",
    "data-src",
    "data-lazy-src",
    "data-lazy",
    "data-image",
    "data-img",
    "data-thumb",
    "data-desktop-src",
    "data-fallback-src",
    "src"
  ];

  target.find("img, [class*='image'] img, [class*='product'] img, [class*='gallery'] img, [class*='slider'] img, [class*='carousel'] img, figure img").each((_, el) => {
    // 1. Check srcset first for high-res
    const srcset = $(el).attr("srcset") || $(el).attr("data-srcset");
    if (srcset) {
      const parsed = parseSrcset(srcset, baseUrl);
      for (const img of parsed) {
        if (!images.includes(img) && images.length < 15) {
          images.push(img);
        }
      }
    }

    // 2. Check prioritized lazy-load attributes
    for (const attr of ATTR_PRIORITY) {
      const val = $(el).attr(attr);
      if (val && !val.includes("data:image/gif") && !val.includes("data:image/svg")) {
        const abs = makeAbsoluteUrl(val, baseUrl);
        if (isValidProductImage(abs)) {
          const upgraded = upgradeImageUrl(abs, baseUrl);
          if (!images.includes(upgraded) && images.length < 15) {
            images.push(upgraded);
            break;
          }
        }
      }
    }
  });

  // 3. Extract CSS background images: style="background-image: url('...')"
  target.find("[style*='background-image'], [style*='background:']").each((_, el) => {
    const style = $(el).attr("style") || "";
    const bgMatch = style.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (bgMatch && bgMatch[1]) {
      const abs = makeAbsoluteUrl(bgMatch[1], baseUrl);
      if (isValidProductImage(abs)) {
        const upgraded = upgradeImageUrl(abs, baseUrl);
        if (!images.includes(upgraded) && images.length < 15) {
          images.push(upgraded);
        }
      }
    }
  });

  return images;
}

/**
 * Extract high-resolution product images from Schema.org JSON-LD structured data
 */
function extractJsonLdImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html();
      if (!text) return;
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : data["@graph"] ? data["@graph"] : [data];

      for (const item of items) {
        const candidates = item["@graph"] ? item["@graph"] : [item];
        for (const node of candidates) {
          // Check product, real estate, accommodation, or service node
          const imgProp = node.image || node.photo || node.thumbnail || node.primaryImageOfPage;
          if (imgProp) {
            const rawImgs = Array.isArray(imgProp) ? imgProp : [imgProp];
            for (const imgItem of rawImgs) {
              let rawUrl = "";
              if (typeof imgItem === "string") {
                rawUrl = imgItem;
              } else if (typeof imgItem === "object" && imgItem !== null) {
                rawUrl = imgItem.url || imgItem.contentUrl || imgItem.thumbnailUrl || "";
              }

              if (rawUrl) {
                const abs = makeAbsoluteUrl(rawUrl, baseUrl);
                if (isValidProductImage(abs)) {
                  const upgraded = upgradeImageUrl(abs, baseUrl);
                  if (!images.includes(upgraded) && images.length < 15) {
                    images.push(upgraded);
                  }
                }
              }
            }
          }
        }
      }
    } catch {}
  });

  return images;
}

/**
 * Extract product images from Next.js SSR State (`__NEXT_DATA__`)
 */
function extractNextDataImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];

  $('script#__NEXT_DATA__, script[type="application/json"]').each((_, el) => {
    try {
      const raw = $(el).html();
      if (!raw || raw.length < 20) return;
      
      // Look for image URL patterns in JSON
      const jsonImgMatches = Array.from(raw.matchAll(/(?:["']?(?:image|image1|image2|image3|image4|img|images|photos|gallery|thumbnail|featured_image|hero_image|src|url)["']?\s*:\s*["']([^"']+\.(?:jpe?g|png|webp|avif)[^"']*)["'])/gi));
      for (const match of jsonImgMatches) {
        if (match[1]) {
          const abs = makeAbsoluteUrl(match[1], baseUrl);
          if (isValidProductImage(abs)) {
            const upgraded = upgradeImageUrl(abs, baseUrl);
            if (!images.includes(upgraded) && images.length < 15) {
              images.push(upgraded);
            }
          }
        }
      }

      // Look for array of image strings: "images": ["https://...", ...]
      const arrayMatches = Array.from(raw.matchAll(/["'](?:images|photos|gallery|media)["']\s*:\s*\[([^\]]+)\]/gi));
      for (const arrMatch of arrayMatches) {
        const itemUrls = Array.from(arrMatch[1].matchAll(/["'](https?:[^"']+)["']/gi));
        for (const item of itemUrls) {
          if (item[1]) {
            const abs = makeAbsoluteUrl(item[1], baseUrl);
            if (isValidProductImage(abs)) {
              const upgraded = upgradeImageUrl(abs, baseUrl);
              if (!images.includes(upgraded) && images.length < 15) {
                images.push(upgraded);
              }
            }
          }
        }
      }
    } catch {}
  });

  return images;
}

/**
 * Deep Regex Fallback Scanner: Scans the entire raw HTML for any valid product images
 */
function scanRawHtmlImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  if (!html) return images;

  // Regex targeting product and CDN image URLs
  const CDN_IMAGE_REGEX = /(?:https?:)?\/\/[^\s"'<>\\]+?\.(?:jpe?g|png|webp|avif)(?:\?[^\s"'<>\\]*)?/gi;
  const matches = Array.from(html.matchAll(CDN_IMAGE_REGEX));

  for (const m of matches) {
    const raw = m[0];
    const abs = makeAbsoluteUrl(raw, baseUrl);
    if (isValidProductImage(abs)) {
      // Prioritize product-like image paths
      const lower = abs.toLowerCase();
      if (
        lower.includes("product") ||
        lower.includes("item") ||
        lower.includes("catalog") ||
        lower.includes("upload") ||
        lower.includes("media") ||
        lower.includes("gallery") ||
        lower.includes("b2bbricksblob") ||
        lower.includes("shopify") ||
        lower.includes("cloudinary") ||
        lower.includes("property")
      ) {
        const upgraded = upgradeImageUrl(abs, baseUrl);
        if (!images.includes(upgraded) && images.length < 15) {
          images.push(upgraded);
        }
      }
    }
  }

  return images;
}

/**
 * Intelligent Fallback Generator for products that have zero photography
 */
export function getCategoryFallbackImage(category: string, title: string): string {
  const text = `${category || ""} ${title || ""}`.toLowerCase();
  
  if (text.includes("real estate") || text.includes("property") || text.includes("commercial") || text.includes("office") || text.includes("shop") || text.includes("showroom") || text.includes("sq.ft") || text.includes("sqft") || text.includes("pune") || text.includes("apartment") || text.includes("flat") || text.includes("villa") || text.includes("land") || text.includes("plot") || text.includes("premise") || text.includes("warehouse")) {
    if (text.includes("shop") || text.includes("showroom") || text.includes("retail")) {
      return "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80"; // Retail showroom
    }
    if (text.includes("medical") || text.includes("hospital")) {
      return "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"; // Hospital / medical facility
    }
    if (text.includes("residential") || text.includes("apartment") || text.includes("villa")) {
      return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"; // Luxury residential property
    }
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"; // Modern commercial tech park / office building
  }

  if (text.includes("vps") || text.includes("server") || text.includes("cloud") || text.includes("hosting") || text.includes("datacenter") || text.includes("kvm") || text.includes("nvme")) {
    return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"; // Server rack
  }

  if (text.includes("seo") || text.includes("marketing") || text.includes("consulting") || text.includes("agency") || text.includes("service") || text.includes("advisory") || text.includes("development") || text.includes("design") || text.includes("website")) {
    return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"; // Business advisory
  }

  if (text.includes("food") || text.includes("malt") || text.includes("drink") || text.includes("snack") || text.includes("beverage") || text.includes("powder") || text.includes("organic") || text.includes("tea") || text.includes("coffee") || text.includes("ayurveda") || text.includes("ayur")) {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"; // Organic healthy food
  }

  if (text.includes("clothing") || text.includes("apparel") || text.includes("fashion") || text.includes("dress") || text.includes("shirt") || text.includes("wear") || text.includes("shoe")) {
    return "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"; // Fashion apparel
  }

  if (text.includes("laptop") || text.includes("computer") || text.includes("phone") || text.includes("gadget") || text.includes("electronics") || text.includes("headphone") || text.includes("audio")) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"; // Electronics / Laptop
  }

  return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"; // General premium product
}

/**
 * Universal Master Image Extraction Pipeline:
 * Discovers and consolidates all authentic high-resolution images from any web page.
 */
export function extractSuperpowerfulImages(
  $: cheerio.CheerioAPI,
  html: string,
  targetUrl: string,
  options: {
    title?: string;
    category?: string;
    productScope?: cheerio.Cheerio<any>;
    maxImages?: number;
  } = {}
): ExtractedMedia {
  const maxImages = options.maxImages || 8;
  const discoveredImages: string[] = [];

  const addUnique = (urlList: string[]) => {
    for (const u of urlList) {
      if (u && isValidProductImage(u)) {
        const upgraded = upgradeImageUrl(u, targetUrl);
        const baseKey = upgraded.split("?")[0].toLowerCase();
        const alreadyExists = discoveredImages.some(existing => existing.split("?")[0].toLowerCase() === baseKey);
        if (!alreadyExists && discoveredImages.length < maxImages) {
          discoveredImages.push(upgraded);
        }
      }
    }
  };

  // 1. OpenGraph & Twitter Meta Image (Often pristine 1200x630 product photo)
  const metaImages = [
    $('meta[property="og:image:secure_url"]').attr("content"),
    $('meta[property="og:image"]').attr("content"),
    $('meta[property="og:image:url"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('meta[name="twitter:image:src"]').attr("content"),
    $('link[rel="image_src"]').attr("href")
  ].filter(Boolean) as string[];

  addUnique(metaImages.map(m => makeAbsoluteUrl(m, targetUrl)));

  // 2. Next.js SSR / React State Extraction (__NEXT_DATA__)
  addUnique(extractNextDataImages($, targetUrl));

  // 3. Schema.org JSON-LD Structured Data Images
  addUnique(extractJsonLdImages($, targetUrl));

  // 4. Scoped Product PDP Container Images
  if (options.productScope && options.productScope.length > 0) {
    addUnique(extractPictureSourceImages($, targetUrl, options.productScope));
    addUnique(extractDomImages($, targetUrl, options.productScope));
  }

  // 5. Global Product Gallery / Slider / PDP DOM Containers
  const galleryScope = $(
    ".product-gallery, .product-images, .pdp-image, .pdp-gallery, .product-media, .product-slider, .slick-slider, .swiper-wrapper, #product-gallery, [class*='gallery'], [class*='product-main'], main"
  );
  if (galleryScope.length > 0) {
    addUnique(extractPictureSourceImages($, targetUrl, galleryScope));
    addUnique(extractDomImages($, targetUrl, galleryScope));
  }

  // 6. Global DOM Image extraction
  if (discoveredImages.length < 3) {
    addUnique(extractPictureSourceImages($, targetUrl));
    addUnique(extractDomImages($, targetUrl));
  }

  // 7. Deep HTML Regex Fallback Scanner
  if (discoveredImages.length < 2) {
    addUnique(scanRawHtmlImages(html, targetUrl));
  }

  // 8. Fallback for image-less services/hosting
  if (discoveredImages.length === 0) {
    const fallback = getCategoryFallbackImage(options.category || "", options.title || "");
    discoveredImages.push(fallback);
  }

  return {
    primaryImage: discoveredImages[0] || "",
    images: discoveredImages
  };
}
