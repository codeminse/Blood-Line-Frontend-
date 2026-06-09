"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    fetch(`${baseUrl}/api/v1/track/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname }),
      credentials: "include",
    }).catch(() => {});
  }, [pathname]);

  return null;
}
