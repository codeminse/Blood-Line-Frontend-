"use client";

import { useState } from "react";
import { Plus, Phone, MapPin, Calendar, User } from "lucide-react";
import AddDonationModal, { type DonorMember } from "./AddDonationModal";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

interface Donation {
  _id: string;
  donorName: string;
  donorBloodGroup: string;
  donorPhone: string;
  donorProfileImageUrl?: string;
  patientName: string;
  patientPhone: string;
  location: string;
  address: string;
  donatedAt: string;
  notes?: string;
}

interface Props {
  donations: Donation[];
  loading: boolean;
  onRefresh: () => void;
  members?: DonorMember[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DonationTable({ donations, loading, onRefresh, members = [] }: Props) {
  const { lang } = useLang();
  const t = translations[lang].donationTable;

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-body">
            <span className="font-semibold text-gray-900">{donations.length}</span>{" "}
            {lang === "bn" ? "রক্তদান নথিভুক্ত" : `donation${donations.length !== 1 ? "s" : ""} recorded`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary rounded-xl justify-center gap-2"
        >
          <Plus size={15} />
          {t.recordDonation}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-body">
          {t.noDonations}
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((d) => (
            <div key={d._id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Donor info */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blood-50 overflow-hidden flex items-center justify-center">
                      {d.donorProfileImageUrl ? (
                        <img src={d.donorProfileImageUrl} alt={d.donorName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-blood-600 font-bold text-sm">{d.donorName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 badge-blood w-5 h-5 text-[9px]">
                      {d.donorBloodGroup}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm font-heading">{d.donorName}</p>
                    <p className="text-xs text-gray-500 font-body flex items-center gap-1">
                      <Phone size={10} /> {d.donorPhone}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500 font-body flex items-center gap-1 justify-end">
                    <Calendar size={10} />
                    {formatDate(d.donatedAt)}
                  </p>
                  <p className="text-xs text-gray-400 font-body flex items-center gap-1 justify-end mt-0.5">
                    <MapPin size={10} /> {d.location}
                  </p>
                </div>
              </div>

              {/* Patient info */}
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-body">
                  <User size={11} className="text-gray-400" />
                  <span className="text-gray-400">{t.patient}</span>
                  <span className="font-semibold">{d.patientName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-body">
                  <Phone size={11} className="text-gray-400" />
                  <span>{d.patientPhone}</span>
                </div>
                {d.notes && (
                  <p className="text-xs text-gray-400 font-body italic">{d.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddDonationModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); onRefresh(); }}
          members={members}
        />
      )}
    </div>
  );
}
