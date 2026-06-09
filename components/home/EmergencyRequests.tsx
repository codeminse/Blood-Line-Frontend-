"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import EmergencyCard, { Emergency } from "../hospital/EmergencyCard";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const REVALIDATE = 5 * 60 * 1000; // 5 min background revalidation

function EmergencyCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-8 w-12 bg-gray-200 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

interface Props {
  initialData: Emergency[];
  /** True only when the server fetch failed — triggers a client-side loading state */
  fetchFailed?: boolean;
}

export default function EmergencyRequests({ initialData, fetchFailed = false }: Props) {
  const { lang } = useLang();
  const t = translations[lang].emergencyRequests;

  // Start with server-provided data. If server fetch failed, show skeletons
  // while the client immediately retries.
  const [data, setData]       = useState<Emergency[]>(initialData);
  const [loading, setLoading] = useState(fetchFailed);

  useEffect(() => {
    const revalidate = async () => {
      try {
        const res = await fetch(`${BASE}/api/v1/blood-requests?page=1&limit=6`);
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          setData(json.data);
          setLoading(false);
        }
      } catch {}
    };

    // If server fetch failed, retry immediately on client
    if (fetchFailed) revalidate();

    // Background revalidate every 5 min regardless
    const timer = setInterval(revalidate, REVALIDATE);
    return () => clearInterval(timer);
  }, [fetchFailed]);

  return (
    <section className="py-6 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title" style={{ fontFamily: "var(--font-heading)" }}>
              {t.title1}
              <em className="text-blood-600 not-italic">{t.titleHighlight}</em>
              {t.title2}
            </h2>
            <p className="section-subtitle font-body">{t.subtitle}</p>
          </div>
          <Link
            href="/emergency"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blood-600 hover:text-blood-700 font-body group"
          >
            {t.viewAll}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── loading ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <EmergencyCardSkeleton key={i} />)}
          </div>
        )}

        {/* ── empty ── */}
        {!loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 font-heading mb-1">
              {t.emptyTitle}
            </h3>
            <p className="text-sm text-gray-600 font-body max-w-xs">{t.emptyDesc}</p>
          </div>
        )}

        {/* ── data ── */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((req) => <EmergencyCard key={req.id} req={req} />)}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link href="/emergency" className="btn-outline rounded-full">
            {t.viewAllMobile}
          </Link>
        </div>
      </div>
    </section>
  );
}
