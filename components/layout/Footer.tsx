"use client";

import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";
import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const { lang } = useLang();
  const t = translations[lang].footer;

  const quickLinks = [
    { label: t.linkRegister, href: "/register" },
    { label: t.linkEmergency, href: "/emergency" },
    { label: t.linkHospital, href: "/hospital" },
    { label: t.linkFind, href: "/find-donor" },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image src="/favicon.png" width={30} height={30} alt="Feni Blood Line" />
              <span className="font-heading font-bold text-base text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                Feni Blood Line
              </span>
            </Link>
            <p className="text-sm text-gray-700 leading-relaxed max-w-xs">{t.tagline}</p>
          </div>

          <div>
            <h3
              className="font-heading font-semibold text-sm text-gray-900 mb-4 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.quickLinks}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-700 hover:text-blood-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="font-heading font-semibold text-sm text-gray-900 mb-4 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.contactSupport}
            </h3>
            <div className="bg-blood-50 border border-blood-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blood-600 uppercase tracking-wider mb-1">{t.helpline}</p>
              <a
                href="tel:+8801889077409"
                className="flex items-center gap-2 text-blood-700 font-bold text-lg font-body hover:text-blood-900 transition-colors"
              >
                <Phone size={16} />
                +8801889077409
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} {t.copyright}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="https://www.facebook.com/ReFatNazmulS" className="hover:text-blood-600 transition-colors underline">
              {t.devs}
            </a>
          </div> 
        </div>
      </div>
    </footer>
  );
}
