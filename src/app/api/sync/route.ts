import { NextResponse, type NextRequest } from "next/server";
import { runUserSync } from "@/jobs/sync-spotify";
import { getSessionUserId } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runUserSync(userId);

  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  if (acceptsHtml) {
    return NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 303,
    });
  }

  return NextResponse.json(result, {
    status: result.status === "SUCCEEDED" ? 200 : 500,
  });
}
