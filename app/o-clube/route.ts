import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/sobre";
  return NextResponse.redirect(url.toString(), { status: 301 });
}
