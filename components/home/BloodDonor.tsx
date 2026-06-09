"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import DonorCard, { Donor, DonorCardSkeleton } from "./../donor/DonorCard";

export default function BloodDonor({ initialData }: { initialData: Donor[] }) {
  const { lang } = useLang();
  const t = translations[lang].bloodDonor;

  return (
    <section className="py-6 md:py-8 bg-gradient-to-br from-rose-50 via-white to-red-50/40 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blood-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            href="/find-donor"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blood-600 hover:text-blood-700 font-body group"
          >
            {t.viewAll}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.length > 0
            ? initialData.map((item) => <DonorCard key={item.id} donor={item} />)
            : Array.from({ length: 6 }).map((_, i) => <DonorCardSkeleton key={i} />)}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/find-donor" className="btn-outline rounded-full">
            {t.viewAllMobile}
          </Link>
        </div>
      </div>
    </section>
  );
}
