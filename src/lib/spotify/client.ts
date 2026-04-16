const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

interface SpotifyFetchOptions {
  accessToken: string;
  path: string;
  searchParams?: Record<string, string | number | undefined>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "SpotifyApiError";
  }
}

export async function spotifyFetch<T>({
  accessToken,
  path,
  searchParams,
  method = "GET",
  body,
}: SpotifyFetchOptions): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE}${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "1");
      const waitMs = Math.min(Math.max(retryAfter, 1), 10) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      throw new SpotifyApiError(
        response.status,
        `Spotify ${method} ${path} failed: ${response.status} ${await response.text()}`,
      );
    }

    return (await response.json()) as T;
  }

  throw new SpotifyApiError(429, `Spotify ${method} ${path} rate-limited`);
}

interface Paged<T> {
  items: T[];
  next: string | null;
}

export async function spotifyFetchAll<T>({
  accessToken,
  path,
  searchParams,
  maxItems,
  pageSize = 50,
}: {
  accessToken: string;
  path: string;
  searchParams?: Record<string, string | number | undefined>;
  maxItems?: number;
  pageSize?: number;
}): Promise<T[]> {
  const out: T[] = [];
  let offset = 0;

  while (true) {
    const page = await spotifyFetch<Paged<T>>({
      accessToken,
      path,
      searchParams: { ...searchParams, limit: pageSize, offset },
    });
    out.push(...page.items);
    if (!page.next) break;
    if (maxItems !== undefined && out.length >= maxItems) break;
    offset += pageSize;
  }

  return maxItems !== undefined ? out.slice(0, maxItems) : out;
}
