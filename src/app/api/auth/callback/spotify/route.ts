import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  exchangeSpotifyCode,
  fetchCurrentSpotifyUser,
} from "@/server/auth/spotify";
import { setSessionCookie } from "@/server/auth/session";

const OAUTH_STATE_COOKIE = "pulseboard_oauth_state";

function originFromRequest(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

function errorRedirect(request: NextRequest, reason: string) {
  const url = new URL("/", originFromRequest(request));
  url.searchParams.set("auth_error", reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const spotifyError = searchParams.get("error");

  const store = await cookies();
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value;

  if (spotifyError) return errorRedirect(request, spotifyError);
  if (!code || !state) return errorRedirect(request, "missing_params");
  if (!expectedState || state !== expectedState) {
    return errorRedirect(request, "state_mismatch");
  }

  const tokens = await exchangeSpotifyCode(code);
  const profile = await fetchCurrentSpotifyUser(tokens.accessToken);
  const tokenExpiresAt = new Date(Date.now() + tokens.expiresInSeconds * 1000);

  const account = await prisma.spotifyAccount.findUnique({
    where: { spotifyUserId: profile.id },
    select: { userId: true },
  });

  const user = await prisma.user.upsert({
    where: { id: account?.userId ?? "__new__" },
    update: {
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
    create: {
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
  });

  await prisma.spotifyAccount.upsert({
    where: { spotifyUserId: profile.id },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt,
      country: profile.country,
      product: profile.product,
    },
    create: {
      userId: user.id,
      spotifyUserId: profile.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt,
      country: profile.country,
      product: profile.product,
    },
  });

  const response = NextResponse.redirect(new URL("/dashboard", originFromRequest(request)));
  response.cookies.delete(OAUTH_STATE_COOKIE);
  setSessionCookie(response, user.id);

  return response;
}
