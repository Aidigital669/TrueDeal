import { NextRequest, NextResponse } from "next/server";
import { runScrapyFramework } from "@/lib/scrapy-engine";
import { runCrawleeScraper } from "@/lib/crawlee-scraper";

export const maxDuration = 60; // 60 seconds timeout for deep Scrapy data scraping

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "Website URL is required" }, { status: 400 });
    }

    // Run Superpowerful Scrapy Framework
    try {
      const result = await runScrapyFramework(url, 30);
      return NextResponse.json(result);
    } catch (scrapyErr: any) {
      console.warn("Scrapy framework fallback to Crawlee:", scrapyErr.message);
      const fallbackResult = await runCrawleeScraper(url, 30);
      return NextResponse.json(fallbackResult);
    }
  } catch (error: any) {
    console.error("API /api/scrape-website error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to scrape website data" }, { status: 500 });
  }
}
