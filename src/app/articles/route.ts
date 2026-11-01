import { NextResponse } from "next/server";

import { POSTS_SECTION } from "@/data/posts";

// The list lives on the home page
export function GET(request: Request) {
  return NextResponse.redirect(new URL(POSTS_SECTION, request.url), 308);
}
