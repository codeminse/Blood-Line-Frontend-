"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

interface Community {
  _id: string;
  name: string;
  logoUrl: string;
}

const abbr = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0].toUpperCase()).join("");

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function CommunitySection() {
  const { lang } = useLang();
  const t = translations[lang].communitySection;

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading]         = useState(true);
  const [active, setActive]           = useState(0);
  const [imgErrors, setImgErrors]     = useState<Record<string, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/v1/communities`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.data)) setCommunities(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scrollToActive = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const items = track.querySelectorAll<HTMLElement>("[data-community]");
    const target = items[idx];
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft - track.clientWidth / 2 + target.offsetWidth / 2,
      behavior: "smooth",
    });
  }, []);

  const go = useCallback((idx: number) => {
    if (!communities.length) return;
    const next = (idx + communities.length) % communities.length;
    setActive(next);
    scrollToActive(next);
  }, [communities.length, scrollToActive]);

  useEffect(() => { scrollToActive(active); }, [active, scrollToActive]);

  useEffect(() => {
    if (!communities.length) return;
    autoRef.current = setInterval(() => setActive((a) => (a + 1) % communities.length), 3000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [communities.length]);

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActive((a) => (a + 1) % communities.length), 3000);
  };

  if (loading) return (
    <section className="py-16 bg-gray-50/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left skeleton */}
          <div className="w-full lg:w-[60%]">
            <div className="mb-8 space-y-3">
              <div className="h-3 w-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-9 w-3/4 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
            </div>

            <div className="relative">
              <div className="flex items-end gap-5 overflow-hidden pt-5 pb-2 px-10">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0"
                    style={{ transform: i === 2 ? "scale(1.15) translateY(-8px)" : "scale(0.88)", opacity: i === 2 ? 1 : 0.4 }}>
                    <div className="rounded-2xl bg-gray-200 animate-pulse"
                      style={{ width: i === 2 ? 90 : 70, height: i === 2 ? 90 : 70 }} />
                    <div className="h-3 rounded bg-gray-200 animate-pulse" style={{ width: i === 2 ? 80 : 64 }} />
                    <div className="h-2.5 rounded bg-gray-200 animate-pulse" style={{ width: i === 2 ? 60 : 48 }} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex items-center gap-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-1.5 rounded-full bg-gray-200 animate-pulse"
                      style={{ width: i === 0 ? 20 : 6 }} />
                  ))}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>

            <div className="h-3 w-32 rounded bg-gray-200 animate-pulse mt-5" />
          </div>

          {/* Right skeleton */}
          <div className="w-full lg:w-[40%]">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
              <div className="h-7 w-3/4 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-7 w-1/2 rounded-lg bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-4/6 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="h-11 w-full rounded-xl bg-gray-200 animate-pulse mt-2" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );

  if (communities.length === 0) return null;

  const countText = communities.length === 1 ? t.verifiedCountSingle : t.verifiedCount;

  return (
    <section className="py-16 bg-gray-50/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Left 60% ── */}
          <div className="w-full lg:w-[60%]">
            <div className="mb-8">
              <p className="text-xs font-bold text-blood-600 uppercase tracking-widest mb-2 font-body">
                {t.network}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}>
                {t.title1}<em className="text-blood-600 not-italic">{t.titleHighlight}</em>
              </h2>
              <p className="text-base text-gray-700 font-body leading-relaxed">{t.tagline}</p>
            </div>

            {/* Focused carousel */}
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12
                              bg-gradient-to-r from-gray-50/80 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12
                              bg-gradient-to-l from-gray-50/80 to-transparent z-10" />

              <div
                ref={trackRef}
                className="flex items-end gap-5 overflow-x-auto scroll-smooth pt-5 pb-2 px-10"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {communities.map((c, i) => {
                  const focused = i === active;
                  return (
                    <button
                      key={c._id}
                      data-community={i}
                      onClick={() => { setActive(i); resetAuto(); }}
                      className="flex flex-col items-center gap-3 flex-shrink-0 focus:outline-none select-none"
                      style={{
                        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                        transform: focused ? "scale(1.15) translateY(-8px)" : "scale(0.88)",
                        opacity: focused ? 1 : 0.5,
                      }}
                    >
                      {/* Logo — no overflow:hidden so border-radius never clips the image */}
                      <div style={{
                        width:  focused ? 90 : 70,
                        height: focused ? 90 : 70,
                        borderRadius: focused ? 22 : 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#ffffff",
                        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: focused
                          ? "0 8px 32px rgba(185,28,28,0.22), 0 0 0 3px #b91c1c"
                          : "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1.5px #fca5a5",
                        padding: focused ? 10 : 8,
                        flexShrink: 0,
                      }}>
                        {c.logoUrl && !imgErrors[c._id] ? (
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              width: "auto",
                              height: "auto",
                              display: "block",
                            }}
                            onError={() => setImgErrors((p) => ({ ...p, [c._id]: true }))}
                          />
                        ) : (
                          <span style={{
                            color: "#b91c1c",
                            fontWeight: 900,
                            fontSize: focused ? 24 : 17,
                            lineHeight: 1,
                            transition: "font-size 0.3s",
                            fontFamily: "var(--font-heading)",
                          }}>
                            {abbr(c.name)}
                          </span>
                        )}
                      </div>

                      {/* Full name — always visible */}
                      <span style={{
                        fontSize: focused ? 13 : 11,
                        fontWeight: focused ? 700 : 500,
                        color: focused ? "#b91c1c" : "#374151",
                        textAlign: "center",
                        width: 104,
                        lineHeight: 1.35,
                        transition: "all 0.3s",
                        fontFamily: "var(--font-body)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {communities.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => { go(active - 1); resetAuto(); }}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white
                               hover:bg-blood-50 hover:border-blood-300
                               flex items-center justify-center transition-colors shadow-sm"
                  >
                    <ChevronLeft size={15} className="text-gray-500" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {communities.map((_, i) => (
                      <button key={i} onClick={() => { setActive(i); resetAuto(); }}
                        className="rounded-full transition-all duration-300"
                        style={{ width: i === active ? 20 : 6, height: 6,
                          background: i === active ? "#b91c1c" : "#d1d5db" }} />
                    ))}
                  </div>

                  <button
                    onClick={() => { go(active + 1); resetAuto(); }}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white
                               hover:bg-blood-50 hover:border-blood-300
                               flex items-center justify-center transition-colors shadow-sm"
                  >
                    <ChevronRight size={15} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-600 font-body mt-5">
              {communities.length} {countText}
            </p>
          </div>

          {/* ── Right 40%: join card ── */}
          <div className="w-full lg:w-[40%]">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-xl p-8">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-blood-100/60 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-blood-50 flex items-center justify-center mb-5">
                  <Users size={22} className="text-blood-600" />
                </div>
                <p className="text-sm text-gray-600 font-body mb-1.5">{t.joinQuestion}</p>
                <h3 className="text-2xl font-black text-gray-900 leading-tight mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}>
                  {t.joinTitle1}<br />
                  <span className="text-blood-600">{t.joinTitle2}</span>
                </h3>
                <p className="text-sm text-gray-700 font-body leading-relaxed mb-6">{t.joinDesc}</p>
                <a href="/community/register"
                   className="btn-primary w-full rounded-xl justify-center gap-2 inline-flex items-center">
                  {t.joinBtn} <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
