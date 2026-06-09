"use client";

import { Droplet, MapPin, Calendar } from "lucide-react";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";
import { useSwrCache } from "@/lib/hooks/useSwrCache";

interface DonationEntry {
  _id: string;
  donorName: string;
  donorBloodGroup: string;
  donorProfileImageUrl?: string;
  location: string;
  donatedAt: string;
  communityId?: { name: string; logoUrl: string } | null;
}

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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetchDonations(): Promise<DonationEntry[]> {
  const res = await fetch(`${BASE}/api/v1/donations/recent`);
  const d = await res.json();
  return Array.isArray(d?.data) ? (d.data as DonationEntry[]).slice(0, 12) : [];
}

export default function RecentDonations() {
  const { lang } = useLang();
  const t = translations[lang].recentDonations;
  const { data: donations, loading } = useSwrCache<DonationEntry[]>(
    "recent_donations",
    fetchDonations,
    [],
  );

  // Hide section entirely only when we know there's nothing to show
  if (!loading && donations.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-blood-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="section-title">
            {t.title1}<em className="text-blood-600 not-italic">{t.titleHighlight}</em>
          </h2>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {donations.map((d) => (
              <article
                key={d._id}
                className="card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200"
              >
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

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate font-heading">
                    {d.donorName}
                  </p>

                  {d.communityId && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {d.communityId.logoUrl && (
                        <img src={d.communityId.logoUrl} alt={d.communityId.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                      )}
                      <span className="text-[10px] text-blood-600 font-semibold truncate font-body">
                        {d.communityId.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600 font-body">
                    <span className="flex items-center gap-0.5">
                      <MapPin size={10} />
                      {d.location}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Calendar size={10} />
                      {getTimeAgo(d.donatedAt)}
                    </span>
                  </div>
                </div>

                <Droplet size={14} className="text-blood-400 shrink-0" />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
