import { NextRequest, NextResponse } from "next/server";
import { scrapePdfCatalog } from "@/lib/pdf-scraper";

export const maxDuration = 120; // 120s max execution for deep multimodal PDF analysis

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Direct File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const fileUrl = formData.get("fileUrl") as string | null;
      const sellerSlug = (formData.get("sellerSlug") as string) || "anvreeality";
      const mode = (formData.get("mode") as any) || "auto";
      const autoImport = formData.get("autoImport") === "true";

      if (file) {
        // Enforce max 200MB file size limit
        if (file.size > 200 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: "File exceeds maximum size limit of 200MB." },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await scrapePdfCatalog({
          buffer,
          filename: file.name,
          sellerSlug,
          mode,
          autoImport
        });

        return NextResponse.json(result);
      } else if (fileUrl) {
        const result = await scrapePdfCatalog({
          fileUrl: fileUrl.trim(),
          sellerSlug,
          mode,
          autoImport
        });

        return NextResponse.json(result);
      } else {
        return NextResponse.json(
          { success: false, error: "Please provide a PDF file upload or a valid PDF URL." },
          { status: 400 }
        );
      }
    }

    // 2. Application JSON (URL, Base64 Payload, or Save Action)
    const body = await req.json();
    const { fileUrl, base64Data, filename, sellerSlug, mode, autoImport, action, items } = body;

    // Direct commit action for previously previewed items
    if (action === "commit_items" && Array.isArray(items)) {
      const { getSellerProductsCollection, cleanSellerSlug, getDb } = await import("@/lib/mongodb");
      const cleanSlug = cleanSellerSlug(sellerSlug || "default");
      const col = await getSellerProductsCollection(cleanSlug);
      const globalCol = (await getDb()).collection("products");
      let savedCount = 0;

      for (const item of items) {
        const doc = {
          title: item.title,
          brand: item.brand || "Verified Brand",
          category: item.category || "General Catalog",
          price: item.price || 0,
          originalPrice: item.originalPrice,
          discount: item.discount,
          description: item.description,
          sku: item.sku,
          specs: item.specs || [],
          aiKeywords: item.aiKeywords || [],
          primaryImage: item.primaryImage,
          images: [{ url: item.primaryImage, isPrimary: true }],
          inventory: item.inventory || 25,
          inStock: item.inStock !== false,
          sellerSlug: cleanSlug,
          sourceType: "pdf_scraper",
          sourceDocument: filename || "manual_commit.pdf",
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await col.updateOne({ title: item.title, sellerSlug: cleanSlug }, { $set: doc }, { upsert: true });
        await globalCol.updateOne({ title: item.title, sellerSlug: cleanSlug }, { $set: doc }, { upsert: true });
        savedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${savedCount} items into products_${cleanSlug}.`,
        savedCount
      });
    }

    if (!fileUrl && !base64Data) {
      return NextResponse.json(
        { success: false, error: "Either 'fileUrl' or 'base64Data' must be provided." },
        { status: 400 }
      );
    }

    const result = await scrapePdfCatalog({
      fileUrl: fileUrl?.trim(),
      base64Data,
      filename,
      sellerSlug: sellerSlug || "anvreeality",
      mode: mode || "auto",
      autoImport: !!autoImport
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/scrape-pdf error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to parse and scrape PDF document.",
        products: [],
        stats: { totalExtracted: 0, totalImported: 0, categories: [], processingTimeMs: 0, fileSizeKb: 0 },
        logs: [`[Error] ${error.message}`]
      },
      { status: 500 }
    );
  }
}
