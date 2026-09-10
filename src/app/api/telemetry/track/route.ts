import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/telemetry";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Beacon sends text/plain
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    if (!body.visitorId || !body.path) {
      return NextResponse.json({ success: false, error: "Missing payload" }, { status: 400 });
    }

    // Extract real client metadata from request headers
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = body.referrer || req.headers.get("referer") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1";

    // Location headers (if deployed behind CDN / Vercel / Cloudflare)
    const city = req.headers.get("x-vercel-ip-city") || req.headers.get("cf-ipcity") || "Direct / Local";
    const state = req.headers.get("x-vercel-ip-country-region") || req.headers.get("cf-region") || "Maharashtra";
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "India";

    // Record asynchronously without holding response
    recordPageView({
      visitorId: body.visitorId,
      sessionId: body.sessionId || body.visitorId,
      path: body.path,
      isHeartbeat: !!body.isHeartbeat,
      referrer,
      userAgent,
      ip,
      city,
      state,
      country
    }).catch((err) => console.error("Async recordPageView error:", err));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
