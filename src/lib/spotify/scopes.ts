export const spotifyScopes = [
  "playlist-modify-private",
  "playlist-modify-public",
  "playlist-read-collaborative",
  "playlist-read-private",
  "user-library-read",
  "user-read-email",
  "user-read-private",
  "user-top-read",
] as const;

export const spotifyScopeString = spotifyScopes.join(" ");
