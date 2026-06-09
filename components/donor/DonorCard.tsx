"use client";

import { Home, MapPin, Phone } from "lucide-react";
import { FaHeart } from "react-icons/fa6";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

export interface Donor {
  id: string;
  name: string;
  initials: string;
  bloodGroup: string;
  profileImageUrl: string;
  location: string;
  area: string;
  phone: string;
  email: string;
  homeAddress: string;
  available: boolean;
  verified: boolean;
  donationCount?: number;
  communityId?: string | null;
  communityName?: string | null;
  communityLogoUrl?: string | null;
}

interface DonorCardProps {
  donor: Donor;
}

export function DonorCardSkeleton() {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
      </div>
      <div className="space-y-2.5 mb-4">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
    </article>
  );
}

export default function DonorCard({ donor }: DonorCardProps) {
  const { lang } = useLang();
  const t = translations[lang].donorCard;

  return (
    <article className="card p-5 backdrop-blur-sm group hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {donor.profileImageUrl ? (
                <img src={donor.profileImageUrl} alt={donor.name} className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
                  <circle cx="20" cy="15" r="8" fill="#9ca3af" />
                  <path d="M4 38c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#9ca3af" />
                </svg>
              )}
            </div>
            {donor.available && (
              <FaHeart className="absolute -bottom-0.5 -right-0.5 text-blood-600" />
            )}
          </div>

          <div>
            <p className="font-heading font-semibold text-gray-900 text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {donor.name}
            </p>
            {donor.communityName && (
              <div className="flex items-center gap-1 mt-0.5">
                {donor.communityLogoUrl && (
                  <img src={donor.communityLogoUrl} alt={donor.communityName} className="w-4 h-4 rounded-full object-cover" />
                )}
                <span className="text-[11px] text-blood-600 font-semibold font-body">{donor.communityName}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-lg text-gray-700 font-body mt-0.5">
              <MapPin size={18} />
              {donor.location}, Feni
            </div>
          </div>
        </div>

        {/* Blood group badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="badge-blood text-sm w-9 h-9">{donor.bloodGroup}</span>
          {(donor.donationCount ?? 0) > 0 && (
            <span className="text-[10px] font-bold text-blood-600 bg-blood-50 border border-blood-100 rounded-full px-2 py-0.5 whitespace-nowrap">
              ❤ {donor.donationCount}×
            </span>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 mb-4">
        <a href={`tel:${donor.phone}`} className="flex items-center gap-2 text-lg text-gray-700 hover:text-blood-600 transition-colors font-body">
          <Phone size={18} className="text-gray-500" />
          {donor.phone}
        </a>
        <div className="flex items-center gap-2 text-lg text-gray-700 font-body">
          <Home size={18} className="text-gray-500 shrink-0" />
          {donor.homeAddress}
        </div>
        <div className="flex items-center gap-2 text-lg text-gray-700 font-bold">
          {t.readyToDonate}:&nbsp;
          {donor.available ? (
            <span className="text-green-500 font-semibold">{t.yes}</span>
          ) : (
            <span className="text-red-500 font-semibold">{t.no}</span>
          )}
        </div>
      </div>

      <a href={`tel:${donor.phone}`} className="btn-primary w-full rounded-lg justify-center" aria-label={`Call ${donor.name}`}>
        <Phone size={12} />
        {t.callNow}
      </a>
    </article>
  );
}
