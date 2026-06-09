"use client";

import { useLang } from "@/components/layout/LangContext";
import { authFetch } from "@/lib/api";
import { translations } from "@/lib/translations";
import { ArrowRight, Clock, Shield, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";

/* ── count-up animation ─────────────────────────────────── */
function useCountUp(target: string, duration = 1600) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (target === "..." || target === "—") { setDisplay(target); return; }

    if (target === "24/7") {
      const frames = ["00/0", "08/3", "16/5", "20/6", "24/7"];
      let i = 0;
      const iv = setInterval(() => {
        setDisplay(frames[Math.min(i++, frames.length - 1)]);
        if (i >= frames.length) clearInterval(iv);
      }, duration / frames.length);
      return () => clearInterval(iv);
    }

    const isKPlus = target.endsWith("k+");
    const isPlus = !isKPlus && target.endsWith("+");
    const isPct = target.endsWith("%");

    let end: number;
    let suffix: string;
    if (isKPlus) { end = parseFloat(target) * 1000; suffix = "k+"; }
    else if (isPlus) { end = parseInt(target); suffix = "+"; }
    else if (isPct) { end = parseInt(target); suffix = "%"; }
    else { setDisplay(target); return; }

    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(2, -10 * p);           // easeOutExpo
      const v = Math.round(e * end);
      setDisplay(isKPlus ? `${(v / 1000).toFixed(1)}${suffix}` : `${v}${suffix}`);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return display;
}

/* ── single stat card ───────────────────────────────────── */
function StatCard({ icon: Icon, value, label, index }: {
  icon: React.ElementType; value: string; label: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const displayed = useCountUp(value);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -14,
      y: ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 14,
    });
  };

  return (
    <div
      ref={ref}
      style={{ animation: `sc-reveal .7s cubic-bezier(.22,1,.36,1) ${index * 160}ms both`, perspective: "700px" }}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHover(false); }}
    >
      <div style={{
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hover ? 8 : 0}px)`,
        transition: hover ? "transform .06s linear box-shadow .3s ease" : "transform .45s cubic-bezier(.22,1,.36,1)",
        transformStyle: "preserve-3d",
        borderRadius: 18,
        padding: "20px 10px 16px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        /* box-shadow handles both border + shadow — fully transitionable */
        boxShadow: hover
          ? "0 20px 40px rgba(220,38,38,.12), 0 0 0 1.5px rgba(220,38,38,.2), inset 0 1px 0 rgba(255,255,255,.9)"
          : "0 4px 18px rgba(0,0,0,.05), 0 0 0 1px rgba(220,38,38,.07), inset 0 1px 0 rgba(255,255,255,.8)",
      }}>

        {/* hover tint overlay — opacity fade avoids background re-paint artifacts */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
          background: "linear-gradient(145deg,rgba(220,38,38,.07) 0%,transparent 100%)",
          opacity: hover ? 1 : 0,
          transition: "opacity .3s ease",
        }} />

        {/* scan-beam */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: 0, left: "-80%", width: "50%", height: "100%",
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)",
            animation: `sc-beam 3.2s ease-in-out ${index * 700}ms infinite`,
          }} />
        </div>

        {/* icon + pulse rings — always in DOM, opacity-controlled to avoid flicker */}
        <div style={{ position: "relative", display: "inline-flex", marginBottom: 10 }}>
          {[0, 1].map(k => (
            <div key={k} style={{
              position: "absolute", inset: k === 0 ? -10 : -5, borderRadius: "50%",
              border: "1.5px solid rgba(220,38,38,.28)",
              opacity: hover ? 1 : 0,
              animation: hover ? `sc-ring 1.3s ease-out ${k * 260}ms infinite` : "none",
              transition: "opacity .2s ease",
              pointerEvents: "none",
            }} />
          ))}
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(220,38,38,.08)",
            boxShadow: hover ? "0 0 20px rgba(220,38,38,.2)" : "0 0 0 rgba(220,38,38,0)",
            transform: hover ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
            transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <Icon size={18} style={{ color: "#dc2626" }} />
          </div>
        </div>

        {/* value — plain color transition, no webkit-clip (causes black flash) */}
        <div style={{
          fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-heading)", lineHeight: 1.1,
          color: hover ? "#dc2626" : "#111827",
          transition: "color .3s ease",
        }}>
          {displayed}
        </div>

        {/* label */}
        <div style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: 3, letterSpacing: "0.03em" }}>{label}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { lang } = useLang();
  const t = translations[lang].hero;
  const [totalDonors, setTotalDonors] = useState<string>("...");

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await authFetch(`${baseUrl}/api/v1/users/search?page=1&limit=1`, { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        const total: number = data?.meta?.total ?? 0;
        setTotalDonors(total > 999 ? `${(total / 1000).toFixed(1)}k+` : `${total}+`);
      } catch {
        setTotalDonors("—");
      }
    };
    fetchTotal();
  }, []);

  const stats = [
    { icon: Users, value: totalDonors, label: t.statDonors },
    { icon: Shield, value: "100%", label: t.statSafety },
    { icon: Clock, value: "24/7", label: t.statEmergency },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blood-50/60 to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blood-100/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blood-50/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="page-enter">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blood-600 uppercase tracking-widest mb-5 font-body">
              <span className="w-6 h-px bg-blood-600" />
              {t.tagline}
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              style={{
                fontFamily: "var(--font-heading)",
                lineHeight: lang === "bn" ? "1.35" : "1.15",
              }}
            >
              {t.title1}
              <em className="text-blood-600 not-italic">{t.titleHighlight} </em>
              {t.title2}
            </h1>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8 max-w-lg font-body">
              {t.desc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login" className="btn-primary rounded-full px-8 py-3.5">
                {t.cta1}
                <ArrowRight size={16} />
              </Link>
              <Link href="/find-donor" className="btn-outline rounded-full px-8 py-3.5">
                {t.cta2}
              </Link>
            </div>

            <style>{`
              @keyframes sc-reveal {
                from { opacity:0; transform:translateY(18px) scale(.93); }
                to   { opacity:1; transform:translateY(0)   scale(1);   }
              }
              @keyframes sc-beam {
                0%   { left:-80%; }
                60%  { left:130%; }
                100% { left:130%; }
              }
              @keyframes sc-ring {
                0%   { transform:scale(1);   opacity:.7; }
                100% { transform:scale(2.1); opacity:0;  }
              }
            `}</style>
            <div className="mt-12 grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <StatCard key={label} icon={Icon} value={value} label={label} index={i} />
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80"
                alt="Blood donation — hands connected in life-saving action"
                className="w-full h-full object-cover"
                loading="eager"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Shield size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-body">{t.badge1Title}</p>
                <p className="text-sm font-bold text-gray-900 font-body">{t.badge1Sub}</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-blood-600 text-white rounded-2xl shadow-lg px-4 py-3 max-w-xs">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-75">
                {t.badge2Tag}
              </p>
              <p className="text-lg font-bold leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
                {t.badge2Text}
                <span className="text-blood-200">{t.badge2Highlight}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
