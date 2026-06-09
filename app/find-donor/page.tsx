"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import DonorCard, { type Donor } from "@/components/donor/DonorCard";
import { authFetch } from "@/lib/api";
import { ChevronLeft, ChevronRight, MapPin, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LOCATIONS = ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"];
const LIMIT = 9;

export default function FindDonorPage() {
  const { lang } = useLang();
  const t = translations[lang].findDonor;

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const fetchDonors = useCallback(async (currentPage: number, bg: string, loc: string) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const params = new URLSearchParams({ page: String(currentPage), limit: String(LIMIT) });
      if (bg) params.set("bloodGroup", bg);
      if (loc) params.set("location", loc);

      const res = await authFetch(`${baseUrl}/api/v1/users/search?${params.toString()}`, { method: "GET" });
      if (!res.ok) return;

      const data = await res.json();
      const results: Donor[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.users)
          ? data.data.users
          : Array.isArray(data?.users)
            ? data.users
            : [];

      setDonors(results);
      setMeta({ total: data?.meta?.total ?? results.length, totalPages: data?.meta?.totalPages ?? 1 });
    } catch (err) {
      console.error("Failed to load donors", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDonors(1, "", ""); }, [fetchDonors]);

  const handleSearch = () => { setPage(1); fetchDonors(1, bloodGroup, location); };
  const handleRefresh = () => { setBloodGroup(""); setLocation(""); setPage(1); fetchDonors(1, "", ""); };
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchDonors(newPage, bloodGroup, location);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = Array.from({ length: meta.totalPages }, (_, i) => i + 1);
  const visiblePages = pageNumbers.filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="min-h-screen bg-white page-enter">
      <div className="bg-gradient-to-b from-blood-50/60 to-white border-b border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            {t.title1}
            <em className="text-blood-600 not-italic">{t.titleHighlight}</em>
          </h1>
          <p className="text-gray-700 text-sm md:text-base font-body max-w-xl">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 w-full">
            <select
              className="input-field appearance-none pr-8 cursor-pointer"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              aria-label="Filter by blood group"
            >
              <option value="">{t.allBloodGroups}</option>
              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="relative flex-1 w-full">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
            <select
              className="input-field appearance-none pl-10 pr-8 cursor-pointer"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by location"
            >
              <option value="">{t.allLocations}</option>
              {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary rounded-xl px-6 justify-center disabled:opacity-60 flex-1 w-full"
          >
            <Search size={15} />
            {loading ? t.searching : t.search}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-700 font-body">
            <span className="font-semibold text-gray-900">{meta.total}</span>{" "}
            {t.showingDonors}
          </p>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blood-600 transition-colors font-body disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {t.refresh}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-body">{t.noResults}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {donors.map((donor) => <DonorCard key={donor.id} donor={donor} />)}
          </div>
        )}

        {meta.totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-700 hover:text-blood-600 disabled:opacity-40 font-body"
            >
              <ChevronLeft size={14} />
              {t.prev}
            </button>

            {visiblePages.map((p, idx) => {
              const prev = visiblePages[idx - 1];
              const showEllipsis = prev !== undefined && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-2">
                  {showEllipsis && <span className="text-gray-600 text-xs font-body px-1">...</span>}
                  <button
                    onClick={() => handlePageChange(p)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold font-body transition-colors ${p === page ? "bg-blood-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                </span>
              );
            })}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === meta.totalPages || loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-700 hover:text-blood-600 disabled:opacity-40 font-body"
            >
              {t.next}
              <ChevronRight size={14} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
