import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

const COOKIES_TO_PURGE = [
  "truedeal_session",
  "truedeal_seller_slug",
  "truedeal_guest_id",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url"
];

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  for (const name of COOKIES_TO_PURGE) {
    try {
      cookieStore.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      });
      cookieStore.delete({ name, path: "/" });
      cookieStore.delete(name);
    } catch {}
  }

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirect") || "/login";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  // Explicitly add Set-Cookie headers with maxAge: 0 to force browser eviction
  for (const name of COOKIES_TO_PURGE) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0)
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
