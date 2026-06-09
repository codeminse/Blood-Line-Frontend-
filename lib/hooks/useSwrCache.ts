"use client";

import { useState, useEffect, useRef } from "react";

const TTL = 5 * 60 * 1000; // 5 min

interface Slot<T> { data: T; ts: number }

function readSlot<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const slot = JSON.parse(raw) as Slot<T>;
    return Date.now() - slot.ts < TTL ? slot.data : null;
  } catch { return null; }
}

function writeSlot<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() } satisfies Slot<T>));
  } catch {}
}

/**
 * Stale-while-revalidate hook.
 * - Instantly returns cached data from sessionStorage (no loading flash)
 * - Fetches fresh data in the background
 * - Auto-revalidates every 5 minutes
 */
export function useSwrCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  fallback: T,
): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;

    // Immediate cache hit → no loading spinner
    const cached = readSlot<T>(cacheKey);
    if (cached !== null) {
      setData(cached);
      setLoading(false);
    }

    const doFetch = async () => {
      try {
        const fresh = await fetcher();
        if (!active.current) return;
        writeSlot(cacheKey, fresh);
        setData(fresh);
        setLoading(false);
      } catch {
        if (active.current) setLoading(false);
      }
    };

    doFetch();
    const interval = setInterval(doFetch, TTL);
    return () => {
      active.current = false;
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading };
}
