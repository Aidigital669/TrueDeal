import { NextRequest, NextResponse } from "next/server";
import { runPythonImageEnhancer, enhanceScrapedProductsBatchWithPython } from "@/lib/python-image-enhancer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { urls, products, minRes } = body;

    if (Array.isArray(products) && products.length > 0) {
      const { enhancedProducts, totalEnhanced } = await enhanceScrapedProductsBatchWithPython(products);
      return NextResponse.json({
        success: true,
        products: enhancedProducts,
        totalEnhanced,
        count: products.length
      });
    }

    if (Array.isArray(urls) && urls.length > 0) {
      const results = await runPythonImageEnhancer(urls, { minRes });
      const enhancedCount = results.filter(r => r.enhanced).length;
      return NextResponse.json({
        success: true,
        results,
        total: results.length,
        enhancedCount
      });
    }

    return NextResponse.json(
      { success: false, error: "Please provide either 'urls' or 'products' array" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API enhance-images error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to enhance images" },
      { status: 500 }
    );
  }
}
