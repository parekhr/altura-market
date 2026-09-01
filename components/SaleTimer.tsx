"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Renders nothing — this component exists purely for its side effect: it
// schedules a single router.refresh() for the moment the sale expires,
// which re-runs the home page's server-side ensureActiveSale() and rolls
// the countdown/banner over to a new sale automatically.
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
