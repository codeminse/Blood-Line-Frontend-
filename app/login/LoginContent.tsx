"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import GoogleLoginButton from "@/components/layout/GoogleLoginButton";
import { Shield, Users, Droplet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Tab = "donor" | "community";

export default function LoginContent() {
  const { lang } = useLang();
  const t = translations[lang].login;
  const [tab, setTab] = useState<Tab>("donor");

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm page-enter">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
            <Image src="/favicon.png" alt="Feni Blood Line" width={30} height={30} />
            <span className="font-heading font-bold text-base text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
              Feni Blood Line
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">
            {t.title}
          </h1>
          <p className="text-gray-500 text-sm font-body mb-8">{t.subtitle}</p>

          {/* Tab toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
            <button
              onClick={() => setTab("donor")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                tab === "donor"
                  ? "bg-white text-blood-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Droplet size={15} />
              Donor
            </button>
            <button
              onClick={() => setTab("community")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                tab === "community"
                  ? "bg-white text-blood-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users size={15} />
              Community
            </button>
          </div>

          {/* Tab content */}
          {tab === "donor" && (
            <div className="space-y-4">
              <div className="bg-blood-50 border border-blood-100 rounded-xl px-4 py-3 text-sm text-blood-700 font-body">
                Sign in with Google to register as a blood donor or manage your donor profile.
              </div>
              <GoogleLoginButton mode="donor" />
            </div>
          )}

          {tab === "community" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 font-body">
                Sign in with the Google account you used to register your community.
                After approval, you&apos;ll be redirected to your community dashboard.
              </div>
              <GoogleLoginButton mode="community" />
              <p className="text-center text-xs text-gray-400 font-body">
                Don&apos;t have a community yet?{" "}
                <Link href="/community/register" className="text-blood-600 font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-5 font-body">{t.note}</p>
        </div>
      </div>

      {/* Right — decorative panel */}
      <div className="hidden lg:block relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=900&q=80"
          width={900}
          height={800}
          alt="Blood donation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/80 to-blood-700/60" />

        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="self-end">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-400/30 flex items-center justify-center">
                <Shield size={13} className="text-green-300" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-body">{t.badge1Title}</p>
                <p className="text-white font-bold text-sm font-body">{t.badge1Sub}</p>
              </div>
            </div>
          </div>

          <div className="text-white max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-blood-200 mb-4 font-body">{t.tagline}</p>
            <h2 className="text-4xl font-bold leading-tight mb-4 font-heading">
              {t.quote}
              <span className="text-blood-300">{t.quoteHighlight}</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed font-body">{t.quoteDesc}</p>

            <div className="flex items-center gap-3 mt-6">
              <div className="flex -space-x-3">
                {["MR", "TA", "SG"].map((init) => (
                  <div key={init} className="w-8 h-8 rounded-full bg-blood-200 border-2 border-white flex items-center justify-center text-xs font-bold text-blood-800">
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-xs font-body">{t.joinedThisMonth}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
