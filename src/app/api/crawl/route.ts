import { NextRequest, NextResponse } from "next/server";
import { runScrapyFramework } from "@/lib/scrapy-engine";
import { runCrawleeScraper } from "@/lib/crawlee-scraper";

export const maxDuration = 60; // 60 seconds maximum timeout for deep Scrapy framework

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "Please provide a valid website URL" }, { status: 400 });
    }

    // Run Superpowerful Scrapy Framework
    try {
      const result = await runScrapyFramework(url, 30);
      return NextResponse.json(result);
    } catch (scraperErr: any) {
      console.warn("Scrapy fallback to Crawlee:", scraperErr.message);
      const fallbackResult = await runCrawleeScraper(url, 30);
      return NextResponse.json(fallbackResult);
    }
  } catch (error: any) {
    console.error("API /api/crawl error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to scrape website data" }, { status: 500 });
  }
}
