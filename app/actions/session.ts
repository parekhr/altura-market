"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

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

export async function getBalance() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) return 5000;

  const balance = await prisma.balance.findUnique({ where: { sessionId } });
  return balance?.money ?? 5000;
}