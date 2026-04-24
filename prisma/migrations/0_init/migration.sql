-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SpotifyTimeRange" AS ENUM ('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "SyncRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiPlaylistRequestStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncLockExpiresAt" TIMESTAMP(3),
    "lastUserSyncStartedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "country" TEXT,
    "product" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "spotifyArtistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genres" TEXT[],
    "imageUrl" TEXT,
    "popularity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "spotifyAlbumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseDate" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "albumId" TEXT,
    "name" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "previewUrl" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackArtist" (
    "trackId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("trackId","artistId")
);

-- CreateTable
CREATE TABLE "UserTopArtistSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "timeRange" "SpotifyTimeRange" NOT NULL,
    "rank" INTEGER NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTopArtistSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTopTrackSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "timeRange" "SpotifyTimeRange" NOT NULL,
    "rank" INTEGER NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTopTrackSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyPlaylistId" TEXT NOT NULL,
    "spotifySnapshotId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN,
    "trackCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistSnapshot" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "spotifySnapshotId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN,
    "trackCount" INTEGER NOT NULL,

    CONSTRAINT "PlaylistSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistTrackSnapshot" (
    "id" TEXT NOT NULL,
    "playlistSnapshotId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3),

    CONSTRAINT "PlaylistTrackSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedTrack" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentlyPlayedEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "contextType" TEXT,
    "contextUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyPlayedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "jobName" TEXT NOT NULL,
    "status" "SyncRunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "recordsWritten" INTEGER NOT NULL DEFAULT 0,
    "stepCounts" JSONB,
    "errorMessage" TEXT,

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiPlaylistRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "AiPlaylistRequestStatus" NOT NULL DEFAULT 'PENDING',
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AiPlaylistRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_userId_key" ON "SpotifyAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_spotifyUserId_key" ON "SpotifyAccount"("spotifyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_spotifyArtistId_key" ON "Artist"("spotifyArtistId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_spotifyAlbumId_key" ON "Album"("spotifyAlbumId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_spotifyTrackId_key" ON "Track"("spotifyTrackId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackArtist_trackId_position_key" ON "TrackArtist"("trackId", "position");

-- CreateIndex
CREATE INDEX "UserTopArtistSnapshot_userId_timeRange_snapshotAt_idx" ON "UserTopArtistSnapshot"("userId", "timeRange", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopArtistSnapshot_userId_artistId_timeRange_snapshotAt_key" ON "UserTopArtistSnapshot"("userId", "artistId", "timeRange", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopArtistSnapshot_userId_timeRange_snapshotAt_rank_key" ON "UserTopArtistSnapshot"("userId", "timeRange", "snapshotAt", "rank");

-- CreateIndex
CREATE INDEX "UserTopTrackSnapshot_userId_timeRange_snapshotAt_idx" ON "UserTopTrackSnapshot"("userId", "timeRange", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopTrackSnapshot_userId_trackId_timeRange_snapshotAt_key" ON "UserTopTrackSnapshot"("userId", "trackId", "timeRange", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopTrackSnapshot_userId_timeRange_snapshotAt_rank_key" ON "UserTopTrackSnapshot"("userId", "timeRange", "snapshotAt", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_spotifyPlaylistId_key" ON "Playlist"("spotifyPlaylistId");

-- CreateIndex
CREATE INDEX "Playlist_userId_updatedAt_idx" ON "Playlist"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "PlaylistSnapshot_playlistId_snapshotAt_idx" ON "PlaylistSnapshot"("playlistId", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistSnapshot_playlistId_snapshotAt_key" ON "PlaylistSnapshot"("playlistId", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrackSnapshot_playlistSnapshotId_position_key" ON "PlaylistTrackSnapshot"("playlistSnapshotId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrackSnapshot_playlistSnapshotId_trackId_position_key" ON "PlaylistTrackSnapshot"("playlistSnapshotId", "trackId", "position");

-- CreateIndex
CREATE INDEX "SavedTrack_userId_savedAt_idx" ON "SavedTrack"("userId", "savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedTrack_userId_trackId_key" ON "SavedTrack"("userId", "trackId");

-- CreateIndex
CREATE INDEX "RecentlyPlayedEvent_userId_playedAt_idx" ON "RecentlyPlayedEvent"("userId", "playedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyPlayedEvent_userId_playedAt_trackId_key" ON "RecentlyPlayedEvent"("userId", "playedAt", "trackId");

-- CreateIndex
CREATE INDEX "SyncRun_jobName_status_startedAt_idx" ON "SyncRun"("jobName", "status", "startedAt");

-- CreateIndex
CREATE INDEX "SyncRun_userId_startedAt_idx" ON "SyncRun"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "AiPlaylistRequest_userId_createdAt_idx" ON "AiPlaylistRequest"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "SpotifyAccount" ADD CONSTRAINT "SpotifyAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopArtistSnapshot" ADD CONSTRAINT "UserTopArtistSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopArtistSnapshot" ADD CONSTRAINT "UserTopArtistSnapshot_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopTrackSnapshot" ADD CONSTRAINT "UserTopTrackSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopTrackSnapshot" ADD CONSTRAINT "UserTopTrackSnapshot_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistSnapshot" ADD CONSTRAINT "PlaylistSnapshot_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrackSnapshot" ADD CONSTRAINT "PlaylistTrackSnapshot_playlistSnapshotId_fkey" FOREIGN KEY ("playlistSnapshotId") REFERENCES "PlaylistSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrackSnapshot" ADD CONSTRAINT "PlaylistTrackSnapshot_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedTrack" ADD CONSTRAINT "SavedTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedTrack" ADD CONSTRAINT "SavedTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyPlayedEvent" ADD CONSTRAINT "RecentlyPlayedEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyPlayedEvent" ADD CONSTRAINT "RecentlyPlayedEvent_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncRun" ADD CONSTRAINT "SyncRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPlaylistRequest" ADD CONSTRAINT "AiPlaylistRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

