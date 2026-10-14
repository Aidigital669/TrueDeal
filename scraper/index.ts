/**
 * ============================================================================
 * Universal Scraper Suite - Master Export Entrypoint
 * ============================================================================
 * Complete copy of all scraper engines ready to be imported into any product.
 */

// 1. Single Product Scraper (E-commerce, VPS specs, Real Estate, recurring prices, crore/lakh parser)
export { 
  scrapeSingleProduct, 
  type ScrapedSingleProduct 
} from "./single-product-scraper";

// 2. Headless Deep Scraper (Playwright Chromium, SPA hydration, network API sniffing, reviews)
export { 
  scrapeWithHeadlessBrowser, 
  type HeadlessScrapeResult 
} from "./headless-deep-scraper";

// 3. Scrapy Framework (Multi-page LinkExtractor, ItemPipeline, Company & Product extraction)
export { 
  runScrapyFramework, 
  runScrapySpiderPipeline, 
  type ScrapyEngineResult 
} from "./scrapy-engine";

// 4. Deep Website Crawler (Heuristic multi-page crawl)
export { 
  runDeepCrawler, 
  type DeepCrawlResult, 
  type DeepScrapedProduct, 
  type DeepScrapedCompany, 
  type CrawledPageInfo 
} from "./deep-website-crawler";

// 5. Crawlee Cheerio Scraper (Crawlee CheerioCrawler batch discovery)
export { 
  runCrawleeScraper 
} from "./crawlee-scraper";

// 6. Image Intelligence Engine & CDN Resolution Upgrader (Shopify, Amazon, WordPress, etc. to 2048x2048)
export { 
  extractSuperpowerfulImages, 
  upgradeImageUrl, 
  makeAbsoluteUrl, 
  isValidProductImage, 
  isImageRelevantToProduct, 
  getCategoryFallbackImage, 
  parseSrcset,
  type ExtractedMedia 
} from "./image-extractor";

// 7. Universal AI PDF Catalog & Brochure Intelligence Engine
export { 
  scrapePdfCatalog, 
  type ScrapedPdfItem, 
  type ScrapedPdfResult 
} from "./pdf-scraper";

// 8. Python Pillow AI Image Enhancer (Super-resolution, contrast & dynamic lighting)
export { 
  runPythonImageEnhancer, 
  enhanceScrapedProductsBatchWithPython, 
  type EnhancedImageResult, 
  type ImageEnhancerResponse 
} from "./python-image-enhancer";

// 9. Website Scraper Actions
export { 
  scrapeAndImportWebsite, 
  type ScrapedProduct, 
  type ScrapedCompanyInfo, 
  type ScrapingResult 
} from "./website-scraper-actions";

// 10. Gemini Multimodal AI Refiners
export { 
  refineProductExtractionWithGemini, 
  refineCompanyExtractionWithGemini, 
  parseSearchIntentWithGemini, 
  generateGeminiSearchResponse, 
  generateGeminiConversationalAnswer 
} from "./gemini";
