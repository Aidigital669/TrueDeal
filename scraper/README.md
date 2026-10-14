# Universal Scraper Suite (Full Copy)

This folder contains a complete, independent copy of the entire **Scraper Suite** ready to be copied and used directly in any of your other products (e.g., `AnvReality`, `Management-System`, `AiDigitalWeb`, etc.).

---

## 📁 Folder Structure

| File / Folder | Description |
| :--- | :--- |
| `single-product-scraper.ts` | Scrapes single product URLs (E-Commerce, VPS specs, Real Estate, SaaS, pricing, Crores/Lakhs, recurring prices, specs table, reviews). |
| `headless-deep-scraper.ts` | Playwright Chromium headless engine for JavaScript SPAs (React, Next.js, Vue), network API sniffing, dynamic tabs, and Trustpilot reviews. |
| `scrapy-engine.ts` | Enterprise Scrapy framework for multi-page crawling, LinkExtractor, and ItemPipeline. |
| `deep-website-crawler.ts` | Heuristic multi-page website crawler discovering company profile and products. |
| `crawlee-scraper.ts` | High-speed Crawlee CheerioCrawler batch crawler. |
| `image-extractor.ts` | Image intelligence & CDN resolution upgrader (Shopify, Amazon, WordPress, Unsplash up to 2048x2048). |
| `pdf-scraper.ts` | Universal AI PDF catalog & brochure scraper (pdf-parse + canvas + Gemini AI). |
| `python-image-enhancer.ts` / `.py` | Pillow AI super-resolution and contrast enhancement for scraped photos. |
| `python-scraper.py` | Standalone Python Scrapy-style spider script. |
| `scrapy-spider.py` | Standalone Python spider with sitemap and RSS discovery. |
| `website-scraper-actions.ts` | High-level website scraper actions. |
| `gemini.ts` | Gemini 2.5/3.6 Flash multimodal AI extraction refiners. |
| `index.ts` | Master export entrypoint for importing into any product. |
| `api/` | Drop-in Next.js App Router API route handlers (`scrape-product`, `scrape-website`, `scrape-pdf`, `crawl`, `enhance-images`). |
| `scripts/` | Comprehensive test scripts (`test-scrapers.ts`, `test_full_crawl.ts`, `test_decompiler.ts`, `test_fetch.ts`). |

---

## 🚀 How to Use in Your Other Products

### Step 1: Copy this `scraper` folder
Copy the entire `scraper` folder into your other product's directory (for example, into `d:\AiDigitals_Projects\AnvReality\scraper` or `d:\AiDigitals_Projects\Management-System\scraper`).

### Step 2: Install Dependencies in Target Project
Run in the target project root:
```bash
npm install cheerio crawlee @crawlee/cheerio playwright pdf-parse @napi-rs/canvas dotenv
```
*(If using Playwright headless browser for the first time, run: `npx playwright install chromium`)*

### Step 3: Add API Keys to `.env` (Optional)
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 💻 Usage Examples

### 1. Scrape Single Product / Property / VPS
```typescript
import { scrapeSingleProduct } from "./scraper/single-product-scraper";

async function main() {
  const result = await scrapeSingleProduct("https://contabo.com/en/vps/cloud-vps-m/");
  if (result.success && result.product) {
    console.log("Title:", result.product.title);
    console.log("Price:", result.product.price);
    console.log("Specs:", result.product.specs);
    console.log("Images:", result.product.images);
  }
}
main();
```

### 2. Crawl Entire Website / Domain
```typescript
import { runScrapyFramework } from "./scraper/scrapy-engine";

async function main() {
  const result = await runScrapyFramework("https://anvreealty.com", 20);
  console.log("Company:", result.company.name);
  console.log("Email:", result.company.email);
  console.log("Products/Properties Found:", result.products.length);
}
main();
```

### 3. Headless Browser Scraping (Heavy JavaScript / SPAs)
```typescript
import { scrapeWithHeadlessBrowser } from "./scraper/headless-deep-scraper";

async function main() {
  const result = await scrapeWithHeadlessBrowser("https://contabo.com/en/vps/cloud-vps-m/", { timeoutMs: 25000 });
  console.log("Title:", result.title);
  console.log("APIs Sniffed:", result.apiPayloadsFound);
  console.log("Reviews:", result.reviews);
}
main();
```

### 4. Scrape PDF Catalog / Brochure
```typescript
import { scrapePdfCatalog } from "./scraper/pdf-scraper";
import fs from "fs";

async function main() {
  const buffer = fs.readFileSync("./catalog.pdf");
  const result = await scrapePdfCatalog({ buffer, filename: "catalog.pdf" });
  console.log("Extracted items:", result.items.length);
}
main();
```

### 5. Enhance Catalog Images (Pillow Super-Resolution)
```typescript
import { runPythonImageEnhancer } from "./scraper/python-image-enhancer";

async function main() {
  const results = await runPythonImageEnhancer(["https://example.com/product.jpg"], { minRes: 1000 });
  console.log("Enhanced:", results);
}
main();
```

---

## 🧪 Testing
To test the scrapers directly:
```bash
npx tsx scraper/scripts/test-scrapers.ts
```
