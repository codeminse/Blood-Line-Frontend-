"use client";

import { Users, Droplet, TrendingUp, Award } from "lucide-react";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

interface StatsProps {
  totalMembers: number;
  totalDonations: number;
  communityName: string;
}

export default function DashboardStats({ totalMembers, totalDonations, communityName }: StatsProps) {
  const { lang } = useLang();
  const t = translations[lang].dashboardStats;

  const stats = [
    { label: t.totalMembers,   value: totalMembers,   icon: Users,     color: "text-blue-600",   bg: "bg-blue-50" },
    { label: t.bloodDonations, value: totalDonations, icon: Droplet,   color: "text-blood-600",  bg: "bg-blood-50" },
    { label: t.livesImpacted,  value: totalDonations, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: t.communityRank,  value: t.active,       icon: Award,     color: "text-amber-600",  bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 font-heading">{communityName}</h2>
        <p className="text-sm text-gray-500 font-body mt-1">{t.overview}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-heading">{s.value}</p>
            <p className="text-xs text-gray-500 font-body mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
