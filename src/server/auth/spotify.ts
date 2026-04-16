import { prisma } from "@/lib/db/prisma";
import { spotifyScopeString } from "@/lib/spotify/scopes";
import { invariant } from "@/lib/utils/assert";

const TOKEN_REFRESH_LEEWAY_MS = 60 * 1000;

const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_ME_URL = "https://api.spotify.com/v1/me";

interface BuildSpotifyAuthorizeUrlOptions {
  state: string;
  showDialog?: boolean;
}

function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  invariant(clientId, "Missing SPOTIFY_CLIENT_ID.");
  invariant(clientSecret, "Missing SPOTIFY_CLIENT_SECRET.");
  invariant(redirectUri, "Missing SPOTIFY_REDIRECT_URI.");

  return { clientId, clientSecret, redirectUri };
}

function basicAuthHeader(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

export function buildSpotifyAuthorizeUrl({
  state,
  showDialog = false,
}: BuildSpotifyAuthorizeUrlOptions) {
  const { clientId, redirectUri } = getSpotifyCredentials();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: spotifyScopeString,
    state,
    show_dialog: String(showDialog),
  });

  return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
}

export interface SpotifyTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  scope: string;
  tokenType: string;
}

export async function exchangeSpotifyCode(
  code: string,
): Promise<SpotifyTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getSpotifyCredentials();

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Spotify token exchange failed: ${response.status} ${await response.text()}`,
    );
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresInSeconds: json.expires_in,
    scope: json.scope,
    tokenType: json.token_type,
  };
}

export interface SpotifyRefreshResponse {
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number;
  scope: string;
  tokenType: string;
}

export async function refreshSpotifyToken(
  refreshToken: string,
): Promise<SpotifyRefreshResponse> {
  const { clientId, clientSecret } = getSpotifyCredentials();

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Spotify token refresh failed: ${response.status} ${await response.text()}`,
    );
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresInSeconds: json.expires_in,
    scope: json.scope,
    tokenType: json.token_type,
  };
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const account = await prisma.spotifyAccount.findUnique({
    where: { userId },
  });
  invariant(account, `No SpotifyAccount for user ${userId}.`);

  if (account.tokenExpiresAt.getTime() - Date.now() > TOKEN_REFRESH_LEEWAY_MS) {
    return account.accessToken;
  }

  const refreshed = await refreshSpotifyToken(account.refreshToken);
  const tokenExpiresAt = new Date(
    Date.now() + refreshed.expiresInSeconds * 1000,
  );

  await prisma.spotifyAccount.update({
    where: { userId },
    data: {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? account.refreshToken,
      tokenExpiresAt,
    },
  });

  return refreshed.accessToken;
}

export interface SpotifyCurrentUser {
  id: string;
  email: string | null;
  displayName: string | null;
  country: string | null;
  product: string | null;
  avatarUrl: string | null;
}

export async function fetchCurrentSpotifyUser(
  accessToken: string,
): Promise<SpotifyCurrentUser> {
  const response = await fetch(SPOTIFY_ME_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Spotify /me failed: ${response.status} ${await response.text()}`,
    );
  }

  const json = (await response.json()) as {
    id: string;
    email?: string | null;
    display_name?: string | null;
    country?: string | null;
    product?: string | null;
    images?: Array<{ url: string }>;
  };

  return {
    id: json.id,
    email: json.email ?? null,
    displayName: json.display_name ?? null,
    country: json.country ?? null,
    product: json.product ?? null,
    avatarUrl: json.images?.[0]?.url ?? null,
  };
}
