import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { buildSpotifyAuthorizeUrl } from "@/server/auth/spotify";

const OAUTH_STATE_COOKIE = "pulseboard_oauth_state";
const STATE_MAX_AGE_SECONDS = 60 * 10;

export async function GET() {
  const state = randomBytes(32).toString("hex");
  const response = NextResponse.redirect(buildSpotifyAuthorizeUrl({ state }));

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  });

  return response;
}
