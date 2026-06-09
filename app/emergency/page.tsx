"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import EmergencyCard, { type Emergency } from "@/components/hospital/EmergencyCard";
import { authFetch } from "@/lib/api";
import { ChevronLeft, ChevronRight, Hospital, MapPin, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LIMIT = 9;

export default function EmergencyRequestsPage() {
  const { lang } = useLang();
  const t = translations[lang].emergency;

  const [requests, setRequests] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [inputHospital, setInputHospital] = useState("");
  const [inputBloodGroup, setInputBloodGroup] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [hospital, setHospital] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");

  const fetchRequests = useCallback(async (currentPage: number, bg: string, hosp: string, loc: string) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const params = new URLSearchParams({ page: String(currentPage), limit: String(LIMIT) });
      if (bg) params.set("bloodGroup", bg);
      if (hosp) params.set("hospitalName", hosp);
      if (loc) params.set("location", loc);

      const res = await authFetch(`${baseUrl}/api/v1/blood-requests?${params.toString()}`, { method: "GET" });
      if (!res.ok) return;

      const data = await res.json();
      const raw: Array<Record<string, unknown>> = Array.isArray(data?.data) ? data.data : [];
      const mapped: Emergency[] = raw.map((item) => ({
        id: String(item._id ?? item.id ?? ""),
        bloodGroup: String(item.bloodGroup ?? ""),
        patientName: String(item.patientName ?? ""),
        unitsNeeded: Number(item.unitsNeeded ?? 0),
        urgency: String(item.urgency ?? ""),
        hospitalName: String(item.hospitalName ?? ""),
        location: String(item.location ?? ""),
        address: String(item.address ?? ""),
        status: String(item.status ?? ""),
        notes: String(item.notes ?? ""),
        createdAt: String(item.createdAt ?? ""),
        contactNumber: String(item.contactNumber ?? ""),
        communityName: item.communityName ? String(item.communityName) : undefined,
        communityLogoUrl: item.communityLogoUrl ? String(item.communityLogoUrl) : undefined,
      }));

      setRequests(mapped);
      setMeta({ total: Number(data?.meta?.total ?? mapped.length), totalPages: Number(data?.meta?.totalPages ?? 1) });
    } catch (err) {
      console.error("Failed to load emergency requests", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(1, "", "", ""); }, [fetchRequests]);

  const handleSearch = () => {
    setPage(1);
    setBloodGroup(inputBloodGroup);
    setHospital(inputHospital);
    setLocation(inputLocation);
    fetchRequests(1, inputBloodGroup, inputHospital, inputLocation);
  };

  const handleRefresh = () => {
    setInputHospital(""); setInputBloodGroup(""); setInputLocation("");
    setHospital(""); setBloodGroup(""); setLocation("");
    setPage(1);
    fetchRequests(1, "", "", "");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchRequests(newPage, bloodGroup, hospital, location);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="relative">
            <Hospital size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={t.hospitalPlaceholder}
              className="input-field pl-10"
              value={inputHospital}
              onChange={(e) => setInputHospital(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <select
            className="input-field appearance-none cursor-pointer"
            value={inputBloodGroup}
            onChange={(e) => setInputBloodGroup(e.target.value)}
          >
            <option value="">{t.allBloodGroups}</option>
            {BLOOD_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
          </select>

          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={t.locationPlaceholder}
              className="input-field pl-10"
              value={inputLocation}
              onChange={(e) => setInputLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <button onClick={handleSearch} disabled={loading} className="btn-primary rounded-xl px-6 justify-center disabled:opacity-60">
            <Search size={15} />
            {loading ? t.searching : t.search}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-700 font-body">
            <span className="font-semibold text-gray-900">{meta.total}</span>{" "}
            {t.showingRequests}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-body">{t.noResults}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => <EmergencyCard key={req.id} req={req} />)}
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
