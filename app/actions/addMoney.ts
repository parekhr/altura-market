"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/app/actions/session";

export async function addTestMoney() {
  const sessionId = await getOrCreateSessionId();

  await prisma.balance.upsert({
    where: { sessionId },
    create: { sessionId, money: 5000 + 1000 },
    update: { money: { increment: 1000 } },
  });
}
