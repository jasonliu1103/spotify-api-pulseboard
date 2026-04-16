import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { invariant } from "@/lib/utils/assert";

const SESSION_COOKIE = "pulseboard_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  invariant(secret, "Missing SESSION_SECRET.");
  return secret;
}

function toBase64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

function sign(payload: string) {
  return toBase64Url(createHmac("sha256", getSecret()).update(payload).digest());
}

export function setSessionCookie(response: NextResponse, userId: string) {
  const payload = toBase64Url(userId);
  const signature = sign(payload);
  response.cookies.set(SESSION_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = fromBase64Url(signature);
  const b = fromBase64Url(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return fromBase64Url(payload).toString("utf8");
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
