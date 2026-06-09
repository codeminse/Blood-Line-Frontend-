"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useLang } from "@/components/layout/LangContext";

const content = {
  en: {
    label: "About Us",
    titleStart: "Saving Lives Through ",
    titleHighlight: "Blood",
    titleEnd: " Donation",
    desc: "Feni Blood Line connects you with trusted donors in a single click. We are part of a greater mission building local communities where medical precision meets human empathy. Your contribution ensures that help is always near when it matters most.",
    highlights: [
      "Verified donor profiles with medical precision",
      "Privacy-first approach with secure data handling",
      "Real-time availability updates from donors",
      "Serving Feni District communities since 2023",
    ],
    caption: "Serving Feni Since 2023",
  },
  bn: {
    label: "আমাদের সম্পর্কে",
    titleStart: "রক্তদানের মাধ্যমে ",
    titleHighlight: "জীবন",
    titleEnd: " বাঁচান",
    desc: "ফেনী ব্লাড লাইন আপনাকে একটি ক্লিকেই বিশ্বস্ত ডোনারদের সাথে সংযুক্ত করে। আমরা একটি বৃহত্তর মিশনের অংশ স্থানীয় সম্প্রদায় গড়ে তোলা যেখানে চিকিৎসা নির্ভুলতা মানবিক সহানুভূতির সাথে মিলিত হয়। আপনার অবদান নিশ্চিত করে যে সাহায্য সবসময় কাছে থাকে।",
    highlights: [
      "চিকিৎসা নির্ভুলতায় যাচাইকৃত ডোনার প্রোফাইল",
      "সুরক্ষিত ডেটা হ্যান্ডলিংয়ে গোপনীয়তা-প্রথম পদ্ধতি",
      "ডোনারদের কাছ থেকে রিয়েল-টাইম প্রাপ্যতা আপডেট",
      "২০২৩ সাল থেকে ফেনী জেলার সম্প্রদায়গুলি সেবা করছে",
    ],
    caption: "২০২৩ সাল থেকে ফেনীতে সেবা",
  },
};

export default function AboutSection() {
  const { lang } = useLang();
  const t = content[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  // tracks whether the user explicitly clicked the mute button
  const userMutedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0.3;
    video.muted = true;
    video.play().catch(() => {});

    // Browsers block autoplay with sound — unmute automatically on first user interaction
    const unlockSound = () => {
      if (!videoRef.current || userMutedRef.current) return;
      videoRef.current.muted = false;
      setMuted(false);
    };

    document.addEventListener("click", unlockSound, { once: true });
    document.addEventListener("touchstart", unlockSound, { once: true });
    document.addEventListener("keydown", unlockSound, { once: true });

    return () => {
      document.removeEventListener("click", unlockSound);
      document.removeEventListener("touchstart", unlockSound);
      document.removeEventListener("keydown", unlockSound);
    };
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    userMutedRef.current = next;
    video.muted = next;
    setMuted(next);
  }

  return (
    <section className="py-6 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            {/* Video container — click anywhere to play/pause */}
            <div
              className="rounded-3xl overflow-hidden aspect-video shadow-xl relative group cursor-pointer"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src="/Feni Blood Line.mp4"
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Center play/pause — appears on hover or when paused */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${paused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
              >
                <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  {paused ? (
                    <Play size={22} className="text-blood-600 ml-1" fill="currentColor" />
                  ) : (
                    <Pause size={22} className="text-blood-600" fill="currentColor" />
                  )}
                </div>
              </div>
            </div>

            {/* Mute toggle — sibling to video container, not inside overflow-hidden */}
            <button
              onClick={toggleMute}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              aria-label={muted ? "Unmute video" : "Mute video"}
            >
              {muted ? (
                <VolumeX size={16} className="text-white" />
              ) : (
                <Volume2 size={16} className="text-white" />
              )}
            </button>

            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2.5 pointer-events-none">
              <p className="text-white text-xs font-semibold font-body">{t.caption}</p>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blood-600 uppercase tracking-widest mb-5 font-body">
              <span className="w-6 h-px bg-blood-600" />
              {t.label}
            </span>
            <h2 className="section-title mb-5" style={{ fontFamily: "var(--font-heading)" }}>
              {t.titleStart}
              <em className="text-blood-600 not-italic">{t.titleHighlight}</em>
              {t.titleEnd}
            </h2>
            <p className="font-body text-gray-700 leading-relaxed mb-6">{t.desc}</p>

            <ul className="space-y-3 mb-8">
              {t.highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 font-body text-sm text-gray-700">
                  <CheckCircle size={16} className="text-blood-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
