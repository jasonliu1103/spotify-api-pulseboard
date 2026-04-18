import { NextResponse, type NextRequest } from "next/server";
import { originFromRequest } from "@/lib/origin";
import { clearSessionCookie } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", originFromRequest(request)), {
    status: 303,
  });
  clearSessionCookie(response);
  return response;
}
