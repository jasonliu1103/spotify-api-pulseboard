import { NextResponse, type NextRequest } from "next/server";
import { SyncRunStatus } from "@prisma/client";
import { runUserSync } from "@/jobs/sync-spotify";
import { originFromRequest } from "@/lib/origin";
import { getSessionUserId } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runUserSync(userId);
  const status =
    result.status === SyncRunStatus.SUCCEEDED
      ? 200
      : result.status === "SKIPPED"
        ? 429
        : 500;
  const headers = new Headers();
  if (result.retryAfterSeconds) {
    headers.set("Retry-After", String(result.retryAfterSeconds));
  }

  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  if (acceptsHtml) {
    return NextResponse.redirect(new URL("/dashboard", originFromRequest(request)), {
      status: 303,
    });
  }

  return NextResponse.json(result, {
    status,
    headers,
  });
}
