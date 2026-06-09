"use client";

import { useEffect, useState, useCallback } from "react";
import { Droplet, MapPin, Calendar, Phone, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";
import type { Metadata } from "next";

interface DonationEntry {
  _id: string;
  donorName: string;
  donorBloodGroup: string;
  donorPhone: string;
  donorProfileImageUrl?: string;
  patientName: string;
  location: string;
  donatedAt: string;
  communityId?: { name: string; logoUrl: string } | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const LIMIT = 20;

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return "Just now";
}

function CardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
      </div>
    </div>
  );
}

export default function RecentDonationsPage() {
  const { lang } = useLang();
  const t = translations[lang].recentDonations;

  const [donations, setDonations] = useState<DonationEntry[]>([]);
  const [meta, setMeta]           = useState<Meta | null>(null);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/v1/donations?page=${p}&limit=${LIMIT}`);
      const json = await res.json();
      if (Array.isArray(json?.data)) setDonations(json.data);
      if (json?.meta)               setMeta(json.meta);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPage(page); }, [page, fetchPage]);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blood-50/20 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.pageTitle?.split(" ").slice(0, -1).join(" ")}{" "}
            <em className="text-blood-600 not-italic">
              {t.pageTitle?.split(" ").slice(-1)[0]}
            </em>
          </h1>
          <p className="text-gray-700 font-body text-base">{t.pageSubtitle}</p>
          {meta && !loading && (
            <p className="text-sm text-gray-600 font-body mt-1">
              {meta.total} {t.showing}
            </p>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Droplet size={40} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-body">{t.noDonations}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((d) => (
              <article key={d._id} className="card p-4 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-4">

                  {/* Avatar + blood group */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-blood-100">
                      {d.donorProfileImageUrl ? (
                        <img src={d.donorProfileImageUrl} alt={d.donorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blood-50">
                          <span className="text-blood-600 font-bold text-sm">
                            {d.donorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 badge-blood w-6 h-6 text-[10px]">
                      {d.donorBloodGroup}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm font-heading truncate">
                        {d.donorName}
                      </p>
                      {d.communityId && (
                        <div className="flex items-center gap-1">
                          {d.communityId.logoUrl && (
                            <img src={d.communityId.logoUrl} alt={d.communityId.name}
                              className="w-3.5 h-3.5 rounded-full object-cover" />
                          )}
                          <span className="text-[10px] text-blood-600 font-semibold font-body">
                            {d.communityId.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-600 font-body">
                      <span className="flex items-center gap-1">
                        <User size={10} />
                        {d.patientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {d.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {getTimeAgo(d.donatedAt)}
                      </span>
                      <a
                        href={`tel:${d.donorPhone}`}
                        className="flex items-center gap-1 hover:text-blood-600 transition-colors"
                      >
                        <Phone size={10} />
                        {d.donorPhone}
                      </a>
                    </div>
                  </div>

                  <Droplet size={14} className="text-blood-300 shrink-0" />
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors font-body"
            >
              <ChevronLeft size={15} /> {t.prev}
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goTo(p as number)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors font-body
                        ${page === p
                          ? "bg-blood-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors font-body"
            >
              {t.next} <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
