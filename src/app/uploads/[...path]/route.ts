import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// MIME type map
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".pdf": "application/pdf"
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Prevent directory traversal
    const safePath = pathSegments.map(p => p.replace(/[^a-zA-Z0-9._-]/g, "")).join(path.sep);
    const fullPath = path.join(process.cwd(), "public", "uploads", safePath);

    if (!fs.existsSync(fullPath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const stat = await fs.promises.stat(fullPath);
    if (!stat.isFile()) {
      return new NextResponse("Not a file", { status: 404 });
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = await fs.promises.readFile(fullPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      }
    });
  } catch (error: any) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
