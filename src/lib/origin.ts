import type { NextRequest } from "next/server";

export function getCanonicalOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return null;

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function originFromRequest(request: NextRequest): string {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");

  return `${proto}://${host}`;
}
