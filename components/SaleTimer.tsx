"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SaleTimer({ expiresAt }: { expiresAt: number }) {
  const router = useRouter();

  useEffect(() => {
    const msRemaining = expiresAt - Date.now();
    if (msRemaining <= 0) {
      router.refresh();
      return;
    }

    const timeoutId = setTimeout(() => {
      router.refresh();
    }, msRemaining);

    return () => clearTimeout(timeoutId);
  }, [expiresAt, router]);

  return null;
}
