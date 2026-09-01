"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * The app has no real accounts — a "user" is just whoever holds this
 * cookie. Reads the existing sessionId if present, otherwise mints a new
 * one, sets it as an httpOnly cookie, and seeds a Balance row for it.
 */
export async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get("sessionId");
  if (existing) {
    return existing.value;
  }
  const sessionId = randomUUID();
  cookieStore.set("sessionId", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  await prisma.balance.create({ data: { sessionId } });
  return sessionId;
}

/**
 * Read-only balance lookup for a first render (e.g. layout.tsx), so it
 * doesn't create a session/cookie itself — a brand-new visitor with no
 * cookie yet just sees the default starting balance until they take an
 * action that calls getOrCreateSessionId.
 */
export async function getBalance() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) return 5000;

  const balance = await prisma.balance.findUnique({ where: { sessionId } });
  return balance?.money ?? 5000;
}