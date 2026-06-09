"use client";

import { BackpackIcon, Clock, Home, Hospital, Info, MapPin, Phone } from "lucide-react";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

export type Emergency = {
  id: string;
  bloodGroup: string;
  patientName: string;
  unitsNeeded: number;
  urgency: string;
  hospitalName: string;
  location: string;
  address: string;
  status: string;
  notes: string;
  createdAt: string;
  contactNumber: string;
  communityName?: string;
  communityLogoUrl?: string;
};

export default function EmergencyCard({ req }: { req: Emergency }) {
  const { lang } = useLang();
  const t = translations[lang].emergencyCard;

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "Just now";
    if (h < 1) return `${m} min ago`;
    if (d < 1) return `${h} hr ago`;
    return `${d} day${d !== 1 ? "s" : ""} ago`;
  };

  const urgencyLabel = req.urgency;

  const urgencyColor =
    req.urgency === "URGENT" ? "bg-red-600" :
    req.urgency === "HIGH"   ? "bg-red-500" :
    req.urgency === "MEDIUM" ? "bg-orange-500" :
    req.urgency === "NEEDED" ? "bg-orange-400" :
    "bg-green-600";

  return (
    <article className="card p-6 group hover:-translate-y-1 transition-all duration-300">
      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="badge-blood w-12 h-12 text-base">
            {req.bloodGroup}
          </div>
          <div>
            <p className="font-heading font-semibold text-gray-900 text-base">
              {req.patientName}
            </p>
            {req.communityName && (
              <div className="flex items-center gap-1 mt-0.5">
                {req.communityLogoUrl && (
                  <img src={req.communityLogoUrl} alt={req.communityName} className="w-3.5 h-3.5 rounded-full object-cover" />
                )}
                <span className="text-[10px] text-blood-600 font-semibold font-body">{req.communityName}</span>
              </div>
            )}
          </div>
        </div>

        <span className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider font-body ${urgencyColor}`}>
          {urgencyLabel}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-700 font-body">
          <BackpackIcon size={14} className="text-blood-500 shrink-0" />
          <p className="text-lg text-gray-700 font-body">{req.unitsNeeded} {t.bag}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 font-body">
          <Hospital size={14} className="text-blood-500 shrink-0" />
          {req.hospitalName}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 font-body">
          <MapPin size={14} className="text-gray-500 shrink-0" />
          {req.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 font-body">
          <Home size={14} className="text-gray-500 shrink-0" />
          {req.address}
        </div>
        {req.notes && (
          <div className="flex items-center gap-2 text-sm text-gray-700 font-body">
            <Info size={14} className="text-gray-500 shrink-0" />
            {req.notes}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600 font-body">
          <Clock size={12} className="shrink-0" />
          {getTimeAgo(req.createdAt)}
        </div>
        <a
          href={`tel:${req.contactNumber}`}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-blood-600 transition-colors font-body"
        >
          <Phone size={12} className="text-gray-500" />
          {req.contactNumber}
        </a>
      </div>

      {/* Button */}
      <a
        href={`tel:${req.contactNumber}`}
        className="btn-primary w-full rounded-lg justify-center flex items-center gap-2"
        aria-label={`Call ${req.hospitalName}`}
      >
        <Phone size={12} />
        {t.callNow}
      </a>
    </article>
  );
}
