import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runUserSync } from "@/jobs/sync-spotify";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "cron_secret_missing" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const isVercelCron = authHeader === `Bearer ${secret}`;
  if (!isVercelCron) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.spotifyAccount.findMany({
    select: { userId: true },
  });

  const results: Array<{
    userId: string;
    status: string;
    recordsWritten: number;
    errors: string[];
  }> = [];

  for (const { userId } of accounts) {
    try {
      const result = await runUserSync(userId);
      results.push({
        userId,
        status: result.status,
        recordsWritten: result.recordsWritten,
        errors: result.errors,
      });
    } catch (error) {
      results.push({
        userId,
        status: "FAILED",
        recordsWritten: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  return NextResponse.json({
    syncedUsers: results.length,
    results,
  });
}
