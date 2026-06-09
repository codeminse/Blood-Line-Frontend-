"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import { MapPin, Star } from "lucide-react";

const donors = [
  { initials: "MR", name: "Mr. Bloom", bloodGroup: "B+", location: "Feni Sadar", donations: 12, rating: 5, available: true, color: "bg-rose-100 text-rose-700" },
  { initials: "TA", name: "T. Adam", bloodGroup: "A+", location: "Chhagalnaiya", donations: 8, rating: 4, available: true, color: "bg-amber-100 text-amber-700" },
  { initials: "SG", name: "S. Gupta", bloodGroup: "O+", location: "Daganbhuiyan", donations: 20, rating: 5, available: false, color: "bg-emerald-100 text-emerald-700" },
  { initials: "RL", name: "R. Lopez", bloodGroup: "AB+", location: "Parshuram", donations: 6, rating: 4, available: true, color: "bg-purple-100 text-purple-700" },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={10} className={i <= count ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );
}

export default function LocalHeroes() {
  const { lang } = useLang();
  const t = translations[lang].localHeroes;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title" style={{ fontFamily: "var(--font-heading)" }}>
            {t.title1}
            <em className="text-blood-600 not-italic">{t.titleHighlight}</em>
          </h2>
          <p className="section-subtitle font-body mx-auto">{t.subtitle}</p>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:mx-0 sm:px-0">
          {donors.map((donor, i) => (
            <article
              key={i}
              className="card snap-start shrink-0 w-56 sm:w-auto p-6 text-center group hover:-translate-y-2 transition-all duration-300"
            >
              <div className="relative mx-auto mb-4 w-fit">
                <div
                  className={`w-16 h-16 rounded-full ${donor.color} flex items-center justify-center text-xl font-bold`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {donor.initials}
                </div>
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blood-600 text-white font-body">
                  {donor.bloodGroup}
                </span>
                {donor.available && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>

              <p className="font-heading font-semibold text-gray-900 text-sm mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                {donor.name}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-2 font-body">
                <MapPin size={10} />
                {donor.location}
              </div>
              <StarRating count={donor.rating} />
              <p className="text-xs text-gray-400 mt-2 font-body">
                {donor.donations} {t.donations}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
