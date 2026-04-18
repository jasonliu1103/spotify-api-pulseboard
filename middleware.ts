import { NextResponse, type NextRequest } from "next/server";
import { getCanonicalOrigin } from "@/lib/origin";

export function middleware(request: NextRequest) {
  const canonicalOrigin = getCanonicalOrigin();
  if (!canonicalOrigin) return NextResponse.next();
  if (request.nextUrl.origin === canonicalOrigin) {
    return NextResponse.next();
  }

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, canonicalOrigin);
  return NextResponse.redirect(target, 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)"],
};
