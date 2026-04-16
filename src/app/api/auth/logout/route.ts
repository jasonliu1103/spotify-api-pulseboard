import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
  clearSessionCookie(response);
  return response;
}
