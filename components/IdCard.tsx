"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

export interface IdCardData {
  name: string;
  bloodGroup: string;
  phone: string;
  location: string;
  address: string;
  profileImageUrl?: string | null;
  donationCount?: number;
  communityName?: string | null;
  communityLogoUrl?: string | null;
  cardType?: "donor" | "member";
}

interface Props {
  data: IdCardData;
  onClose: () => void;
}

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

/**
 * Fetch any remote image and return a base64 data-URL.
 * Uses fetch+FileReader (most reliable for CORS) with a canvas fallback.
 */
async function toDataURL(url: string): Promise<string> {
  // Primary: fetch as blob → FileReader
  try {
    const res = await fetch(url, { mode: "cors", cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {/* fall through */}

  // Fallback: draw via canvas (may fail on tainted canvases, but worth trying)
  return new Promise<string>((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || 128;
        c.height = img.naturalHeight || 128;
        c.getContext("2d")?.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/png"));
      } catch { resolve(""); }
    };
    img.onerror = () => resolve("");
    img.src = url;
  });
}

/* ─── Inline-style constants for the card (html2canvas reads computed styles) ─ */
const W = 338; // px — exactly 3.375″ at ~100 dpi; scale×4 → 400 dpi print quality
const H = 213; // px — exactly 2.125″ at ~100 dpi

export default function IdCard({ data, onClose }: Props) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const [dl, setDl] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState("");
  const [logoSrc,   setLogoSrc]   = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = 0;
    const total = (data.profileImageUrl ? 1 : 0) + (data.communityLogoUrl ? 1 : 0);
    const check = () => { if (++done >= total) setReady(true); };
    if (total === 0) { setReady(true); return; }
    if (data.profileImageUrl) toDataURL(data.profileImageUrl).then(v => { setAvatarSrc(v); check(); });
    if (data.communityLogoUrl) toDataURL(data.communityLogoUrl).then(v => { setLogoSrc(v); check(); });
  }, [data.profileImageUrl, data.communityLogoUrl]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDl(true);
    try {
      const h2c = (await import("html2canvas")).default;
      const canvas = await h2c(cardRef.current, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0,
      });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `fenibloodline-id-${data.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    } catch { window.print(); }
    finally { setDl(false); }
  };

  const isMember = data.cardType === "member";
  const ini = initials(data.name);
  const avatar = avatarSrc || "";
  const logo   = logoSrc   || "";

  /* ─── All card styles are inline so html2canvas captures them exactly ─── */
  return (
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Loading shimmer until images are fetched */}
        {!ready && (
          <div style={{ width: W, height: H, borderRadius: 12, background: "#f3f4f6", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #b91c1c", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {/* ════════════════ THE CARD ════════════════ */}
        {/* Capture wrapper — 4 px white padding prevents html2canvas border-radius clip */}
        <div
          ref={cardRef}
          style={{
            display: ready ? "block" : "none",
            margin: "0 auto",
            padding: 4,
            background: "#ffffff",
            borderRadius: 14,
          }}
        >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: W,
            height: H,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
            fontFamily: "system-ui, -apple-system, Arial, sans-serif",
            background: "#ffffff",
          }}
        >
          {/* ══ WHITE TOP SECTION ══ */}
          <div style={{ flex: 1, padding: "14px 14px 8px 14px", display: "flex", flexDirection: "column", gap: 7, background: "#ffffff" }}>

            {/* Row: avatar · name · blood group
                 NOTE: alignItems intentionally NOT "center" — html2canvas mishandles
                 flex centering and clips text from the top. We use explicit paddingTop
                 on children to achieve visual centering instead. */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>

              {/* Avatar */}
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                overflow: "hidden", border: "2.5px solid #fca5a5",
                background: "#fef2f2",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {avatar
                  ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <span style={{ fontSize: 18, fontWeight: 800, color: "#b91c1c", lineHeight: 1 }}>{ini}</span>
                }
              </div>

              {/* Name + meta — paddingTop manually centers against 52px avatar */}
              <div style={{ flex: 1, minWidth: 0, paddingTop: 10 }}>
                {/* NO overflow:hidden here — html2canvas clips incorrectly when
                    overflow:hidden is combined with flex-centering. The card's own
                    overflow:hidden handles any edge-case clipping. */}
                <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", lineHeight: 1.35, whiteSpace: "normal", wordBreak: "break-word" }}>
                  {data.name}
                </div>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>
                  {isMember ? "Community Member" : "Blood Donor"}
                </div>
                {(data.donationCount ?? 0) > 0 && (
                  <div style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>
                    ❤ {data.donationCount} donation{data.donationCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Blood group badge — marginTop visually centers against 52px avatar */}
              <div style={{
                width: 42, height: 42, marginTop: 5, borderRadius: 8, flexShrink: 0,
                background: "#b91c1c", color: "#ffffff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900,
                boxShadow: "0 2px 8px rgba(185,28,28,0.45)",
              }}>
                {data.bloodGroup}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#f3f4f6", flexShrink: 0 }} />

            {/* Info rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <IRow label="PHONE"    value={data.phone} />
              <IRow label="LOCATION" value={`${data.location}, Feni`} />
              {data.address && <IRow label="ADDRESS"  value={data.address} />}
            </div>
          </div>

          {/* ══ RED BOTTOM SECTION ══ */}
          <div style={{
            height: 58,
            background: "linear-gradient(110deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 65%, #dc2626 100%)",
            padding: "0 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
            gap: 8,
          }}>
            {/* Left: favicon + org name + tagline — never shrinks */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.png" alt="" width={22} height={22} style={{ display: "block", flexShrink: 0, borderRadius: "50%" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ color: "#ffffff", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1.15 }}>
                  Feni Blood Line
                </span>
                <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 7.5, fontWeight: 500, letterSpacing: "0.03em", lineHeight: 1.15 }}>
                  Saving Lives in Feni District
                </span>
              </div>
            </div>

            {/* Right: community badge OR website URL */}
            {data.communityName ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 5, maxWidth: 152, minWidth: 0, flexShrink: 1 }}>
                {logo
                  ? <img src={logo} alt="" width={18} height={18} style={{ borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.5)", flexShrink: 0, display: "block", marginTop: 2 }} />
                  : null
                }
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span style={{ color: "rgba(255,255,255,0.50)", fontSize: 6.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.2 }}>Community</span>
                  <span style={{ color: "rgba(255,255,255,0.90)", fontSize: 8, fontWeight: 700, lineHeight: 1.35, whiteSpace: "normal", wordBreak: "break-word", display: "block" }}>
                    {data.communityName}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ color: "rgba(255,255,255,0.70)", fontSize: 8.5, fontWeight: 600, letterSpacing: "0.03em" }}>fenibloodline.com</span>
              </div>
            )}
          </div>
        </div>
        </div>
        {/* ════════════════ END CARD ════════════════ */}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, width: W, margin: "0 auto" }}>
          <button
            onClick={handleDownload}
            disabled={dl || !ready}
            className="btn-primary flex-1 rounded-2xl py-3 justify-center gap-2 text-sm disabled:opacity-60"
          >
            <Download size={15} />
            {dl ? "Generating..." : "Download PNG"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-2xl font-body transition-colors bg-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function IRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ fontSize: 7.5, color: "#9ca3af", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", width: 50, flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: "#1f2937", fontWeight: 600, lineHeight: 1.3 }}>
        {value}
      </span>
    </div>
  );
}
