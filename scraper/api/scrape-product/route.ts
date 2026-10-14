import { NextRequest, NextResponse } from "next/server";
import { scrapeSingleProduct } from "@/lib/single-product-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid product URL" },
        { status: 400 }
      );
    }

    const result = await scrapeSingleProduct(url);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to extract product" },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/scrape-product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
