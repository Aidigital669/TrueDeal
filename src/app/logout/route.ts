import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("truedeal_session");
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
