export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtistSummary {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  popularity?: number;
}

export interface SpotifyAlbumSummary {
  id: string;
  name: string;
  release_date?: string;
  images?: SpotifyImage[];
}

export interface SpotifyTrackSummary {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  explicit: boolean;
  popularity?: number;
  album?: SpotifyAlbumSummary;
  artists: Array<Pick<SpotifyArtistSummary, "id" | "name">>;
}
