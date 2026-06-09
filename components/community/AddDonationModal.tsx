"use client";

import { useState } from "react";
import { X, User, Phone, MapPin, Home, Calendar, FileText, Search, Building2 } from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/api";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LOCATIONS = ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"];

export interface DonorMember {
  _id: string;
  fullName: string;
  bloodGroup: string;
  phone: string;
  profileImageUrl?: string;
}

interface Props {
  onClose: () => void;
  onSaved: () => void;
  members?: DonorMember[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function AddDonationModal({ onClose, onSaved, members = [] }: Props) {
  const { lang } = useLang();
  const t = translations[lang].addDonation;

  const [loading, setLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<DonorMember | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const [form, setForm] = useState({
    donorName: "",
    donorBloodGroup: "",
    donorPhone: "",
    donorProfileImageUrl: "",
    patientName: "",
    patientPhone: "",
    hospitalName: "",
    location: "",
    address: "",
    donatedAt: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.includes(memberSearch) ||
      m.bloodGroup.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const selectMember = (m: DonorMember) => {
    setSelectedMember(m);
    setForm((p) => ({
      ...p,
      donorName: m.fullName,
      donorBloodGroup: m.bloodGroup,
      donorPhone: m.phone,
      donorProfileImageUrl: m.profileImageUrl ?? "",
    }));
    setMemberSearch(m.fullName);
    setShowMemberDropdown(false);
  };

  const clearMember = () => {
    setSelectedMember(null);
    setMemberSearch("");
    setForm((p) => ({
      ...p,
      donorName: "",
      donorBloodGroup: "",
      donorPhone: "",
      donorProfileImageUrl: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, string> = { ...form };
      if (!body.donorProfileImageUrl) delete body.donorProfileImageUrl;
      if (!body.hospitalName) delete body.hospitalName;
      if (!body.notes) delete body.notes;

      const res = await authFetch(`${BASE}/api/v1/communities/my/donations`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record donation");
      toast.success(t.donationRecorded);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 font-body";

  const prefilledMsg = lang === "bn"
    ? `${selectedMember?.fullName} ${t.quickFillPrefilledSuffix}`
    : `${t.quickFillPrefilledPrefix} ${selectedMember?.fullName} ${t.quickFillPrefilledSuffix}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ animation: "slideUp 0.25s ease forwards" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-heading">{t.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Member quick-select */}
          <div className="bg-blood-50/60 border border-blood-100 rounded-xl p-3">
            <label className={labelClass + " text-blood-700 mb-2"}>
              {t.quickFill}
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <input
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setShowMemberDropdown(true);
                  if (selectedMember) clearMember();
                }}
                onFocus={() => setShowMemberDropdown(true)}
                onBlur={() => setTimeout(() => setShowMemberDropdown(false), 150)}
                type="text"
                className="input-field pl-10 pr-10 bg-white"
                placeholder={members.length > 0 ? t.quickFillPlaceholder : t.noMembersPlaceholder}
                disabled={members.length === 0}
              />
              {selectedMember && (
                <button
                  type="button"
                  onClick={clearMember}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}

              {showMemberDropdown && members.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4 font-body">{t.noMembersMatch}</p>
                  ) : (
                    filteredMembers.slice(0, 10).map((m) => (
                      <button
                        key={m._id}
                        type="button"
                        onMouseDown={() => selectMember(m)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blood-50 overflow-hidden flex items-center justify-center shrink-0">
                          {m.profileImageUrl ? (
                            <img src={m.profileImageUrl} alt={m.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blood-600 font-bold text-xs">{m.fullName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{m.fullName}</p>
                          <p className="text-xs text-gray-400">{m.phone}</p>
                        </div>
                        <span className="badge-blood w-7 h-7 text-[10px] shrink-0">{m.bloodGroup}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedMember ? (
              <p className="text-xs text-green-600 font-semibold mt-1.5 font-body">
                ✓ {prefilledMsg}
              </p>
            ) : (
              <p className="text-xs text-blood-500/70 mt-1.5 font-body">
                {members.length > 0 ? t.quickFillHint : t.quickFillNoMemberHint}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500 font-body border-b pb-3">{t.donorInfo}</p>

          <div>
            <label className={labelClass}>{t.donorName}</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.donorName} onChange={(e) => set("donorName", e.target.value)} type="text" className="input-field pl-10" placeholder={t.donorNamePlaceholder} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.bloodGroup}</label>
              <select value={form.donorBloodGroup} onChange={(e) => set("donorBloodGroup", e.target.value)} className="input-field" required>
                <option value="">{t.select}</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t.donorPhone}</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.donorPhone} onChange={(e) => set("donorPhone", e.target.value)} type="tel" className="input-field pl-10" placeholder="01XXXXXXXXX" required />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-body border-b pb-3 pt-2">{t.patientHospital}</p>

          <div>
            <label className={labelClass}>{t.patientName}</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.patientName} onChange={(e) => set("patientName", e.target.value)} type="text" className="input-field pl-10" placeholder={t.patientNamePlaceholder} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.patientPhone}</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.patientPhone} onChange={(e) => set("patientPhone", e.target.value)} type="tel" className="input-field pl-10" placeholder="01XXXXXXXXX" required />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t.hospitalName}</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.hospitalName} onChange={(e) => set("hospitalName", e.target.value)} type="text" className="input-field pl-10" placeholder={t.hospitalPlaceholder} />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-body border-b pb-3 pt-2">{t.donationDetails}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.location}</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={form.location} onChange={(e) => set("location", e.target.value)} className="input-field pl-10" required>
                  <option value="">{t.select}</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t.dateTime}</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.donatedAt} onChange={(e) => set("donatedAt", e.target.value)} type="datetime-local" className="input-field pl-10" required />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.address}</label>
            <div className="relative">
              <Home size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.address} onChange={(e) => set("address", e.target.value)} type="text" className="input-field pl-10" placeholder={t.addressPlaceholder} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.notes}</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="input-field pl-10 resize-none" placeholder={t.notesPlaceholder} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 rounded-xl justify-center">{t.cancel}</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 rounded-xl justify-center disabled:opacity-60">
              {loading ? t.saving : t.recordDonation}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
