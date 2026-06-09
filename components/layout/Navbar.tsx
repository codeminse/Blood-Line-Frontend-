"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import { useLang } from "@/components/layout/LangContext";
import clsx from "clsx";
import { Menu, Search, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { en: "Home",           bn: "হোম",             href: "/" },
  { en: "Find Donor",     bn: "ডোনার খুঁজুন",    href: "/find-donor" },
  { en: "Emergency",      bn: "জরুরি",            href: "/emergency" },
  { en: "Donations",      bn: "রক্তদান",          href: "/recent-donations" },
  { en: "Hospitals",      bn: "হাসপাতাল",         href: "/hospital" },
];

const communityLink = { en: "Community", bn: "কমিউনিটি", href: "/community/register" };

const ui = {
  en: { beDonor: "Be a Donor", myProfile: "My Profile" },
  bn: { beDonor: "ডোনার হন", myProfile: "আমার প্রোফাইল" },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { lang, toggle } = useLang();
  const t = ui[lang];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-[2px] border-b border-gray-100 shadow-sm">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Feni Blood Line Home">
          <Image src="/favicon.png" width={30} height={30} alt="Feni Blood Line" />
          <span
            className="font-heading font-bold text-base text-gray-900 tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Feni Blood Line
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[...navLinks, ...(!loading && !user ? [communityLink] : [])].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "nav-link",
                pathname === link.href && "text-blood-600 font-semibold"
              )}
            >
              {lang === "en" ? link.en : link.bn}
            </Link>
          ))}

          {/* Language toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="flex items-center rounded-full bg-gray-100 border border-gray-200 overflow-hidden hover:border-blood-300 transition-colors"
          >
            <span className={clsx("px-3 py-1.5 text-xs font-bold rounded-full transition-colors", lang === "en" ? "bg-blood-600 text-white" : "text-gray-500 hover:text-gray-700")}>
              EN
            </span>
            <span className={clsx("px-3 py-1.5 text-xs font-bold rounded-full transition-colors", lang === "bn" ? "bg-blood-600 text-white" : "text-gray-500 hover:text-gray-700")}>
              বাং
            </span>
          </button>

          {/* Search → Find Donor */}
          <Link
            href="/find-donor"
            aria-label="Search donors"
            className={clsx(
              "p-2 rounded-full transition-colors",
              pathname === "/find-donor"
                ? "bg-blood-50 text-blood-600"
                : "text-gray-500 hover:bg-blood-50 hover:text-blood-600"
            )}
          >
            <Search size={18} />
          </Link>

          {/* Auth */}
          {!loading && (
            user ? (
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-blood-200 hover:border-blood-400 transition-colors"
                aria-label={t.myProfile}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "Profile"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-blood-50 flex items-center justify-center">
                    <User size={16} className="text-blood-600" />
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login" className="btn-primary py-2 px-5 rounded-full text-sm">
                {t.beDonor}
              </Link>
            )
          )}
        </div>

        {/* Mobile: language toggle + search + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="flex items-center rounded-full bg-gray-100 border border-gray-200 overflow-hidden hover:border-blood-300 transition-colors"
          >
            <span className={clsx("px-2.5 py-1 text-xs font-bold rounded-full transition-colors", lang === "en" ? "bg-blood-600 text-white" : "text-gray-500")}>
              EN
            </span>
            <span className={clsx("px-2.5 py-1 text-xs font-bold rounded-full transition-colors", lang === "bn" ? "bg-green-600 text-white" : "text-gray-500")}>
              বাং
            </span>
          </button>

          <Link
            href="/find-donor"
            aria-label="Search donors"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            onClick={() => setMobileOpen(false)}
          >
            <Search size={20} />
          </Link>

          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-3 space-y-3 animate-fade-in">
          {[...navLinks, ...(!loading && !user ? [communityLink] : [])].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "block py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-blood-50 text-blood-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {lang === "en" ? link.en : link.bn}
            </Link>
          ))}

          {/* Language toggle mobile */}
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">ভাষা / Language</span>
            <div className="flex items-center rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
              <span className={clsx("px-3 py-1 text-xs font-bold rounded-full transition-colors", lang === "en" ? "bg-blood-600 text-white" : "text-gray-500")}>
                EN
              </span>
              <span className={clsx("px-3 py-1 text-xs font-bold rounded-full transition-colors", lang === "bn" ? "bg-green-600 text-white" : "text-gray-500")}>
                বাং
              </span>
            </div>
          </button>

          {!loading && (
            user ? (
              <Link
                href="/profile"
                className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "Profile"}
                    className="w-7 h-7 rounded-full object-cover border border-blood-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blood-50 border border-blood-200 flex items-center justify-center">
                    <User size={14} className="text-blood-600" />
                  </div>
                )}
                {t.myProfile}
              </Link>
            ) : (
              <Link
                href="/login"
                className="block btn-primary text-center rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {t.beDonor}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
