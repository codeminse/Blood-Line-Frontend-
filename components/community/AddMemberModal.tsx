"use client";

import { useState } from "react";
import { X, User, Phone, Mail, MapPin, Home, Image } from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/api";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LOCATIONS = ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"];

interface Member {
  _id: string;
  fullName: string;
  bloodGroup: string;
  phone: string;
  email: string;
  location: string;
  homeAddress?: string;
  profileImageUrl?: string;
  isAvailableToDonate: boolean;
}

interface Props {
  member?: Member | null;
  onClose: () => void;
  onSaved: () => void;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function AddMemberModal({ member, onClose, onSaved }: Props) {
  const { lang } = useLang();
  const t = translations[lang].addMember;

  const isEdit = !!member;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: member?.fullName ?? "",
    bloodGroup: member?.bloodGroup ?? "",
    phone: member?.phone ?? "",
    email: member?.email ?? "",
    location: member?.location ?? "",
    homeAddress: member?.homeAddress ?? "",
    profileImageUrl: member?.profileImageUrl ?? "",
    isAvailableToDonate: member?.isAvailableToDonate ?? true,
  });

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit
        ? `${BASE}/api/v1/communities/my/members/${member!._id}`
        : `${BASE}/api/v1/communities/my/members`;
      const res = await authFetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save member");
      toast.success(isEdit ? t.memberUpdated : t.memberAdded);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 font-body";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ animation: "slideUp 0.25s ease forwards" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            {isEdit ? t.editTitle : t.addTitle}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>{t.fullName}</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                type="text"
                className="input-field pl-10"
                placeholder={t.fullNamePlaceholder}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.bloodGroup}</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => set("bloodGroup", e.target.value)}
                className="input-field"
                required
              >
                <option value="">{t.select}</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t.location}</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className="input-field pl-10"
                  required
                >
                  <option value="">{t.select}</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.phone}</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                type="tel"
                className="input-field pl-10"
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.email}</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                type="email"
                className="input-field pl-10"
                placeholder={t.emailPlaceholder}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.homeAddress}</label>
            <div className="relative">
              <Home size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={form.homeAddress}
                onChange={(e) => set("homeAddress", e.target.value)}
                type="text"
                className="input-field pl-10"
                placeholder={t.homeAddressPlaceholder}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {t.profileImageUrl}{" "}
              <span className="text-gray-400 normal-case font-normal tracking-normal">{t.profileImageHint}</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Image size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.profileImageUrl}
                  onChange={(e) => set("profileImageUrl", e.target.value)}
                  type="url"
                  className="input-field pl-10"
                  placeholder={t.profileImagePlaceholder}
                />
              </div>
              {form.profileImageUrl && (
                <img
                  src={form.profileImageUrl}
                  alt="preview"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.isAvailableToDonate}
                onChange={(e) => set("isAvailableToDonate", e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <span className="text-sm font-body text-gray-700">{t.availableToDonate}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 rounded-xl justify-center"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 rounded-xl justify-center disabled:opacity-60"
            >
              {loading ? t.saving : isEdit ? t.saveChanges : t.addMemberBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
