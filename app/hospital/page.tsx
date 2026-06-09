"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import { useAuth } from "@/components/layout/AuthProvider";
import { authFetch } from "@/lib/api";
import { AlertTriangle, Droplet, FileText, Hospital, MapPin, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LOCATIONS = ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"];
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface CommunityInfo {
  _id: string;
  name: string;
  logoUrl: string;
}

export default function HospitalEmergencyRequestPage() {
  const { lang } = useLang();
  const t = translations[lang].hospital;
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [community, setCommunity] = useState<CommunityInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    authFetch(`${BASE}/api/v1/communities/my`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.status === "APPROVED") {
          setCommunity({ _id: d.data._id, name: d.data.name, logoUrl: d.data.logoUrl });
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const body: Record<string, unknown> = {
      patientName: String(formData.get("patientName") ?? "").trim(),
      hospitalName: String(formData.get("hospitalName") ?? "").trim(),
      bloodGroup: String(formData.get("bloodGroup") ?? ""),
      unitsNeeded: parseInt(String(formData.get("unitsNeeded") ?? "0"), 10),
      urgency: String(formData.get("urgency") ?? ""),
      location: String(formData.get("location") ?? ""),
      address: String(formData.get("address") ?? "").trim(),
      contactNumber: String(formData.get("contactNumber") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    };

    if (community) {
      body.communityId = community._id;
      body.communityName = community.name;
      body.communityLogoUrl = community.logoUrl;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE}/api/v1/blood-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create request");
      form.reset();
      toast.success(t.success);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create emergency request");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 font-body";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blood-50/60 to-white px-4 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-heading">{t.title}</h1>
          <p className="text-sm text-gray-700 mt-2 font-body">{t.subtitle}</p>
        </div>

        {/* Community badge (if community admin) */}
        {community && (
          <div className="flex items-center gap-3 bg-blood-50 border border-blood-100 rounded-xl px-4 py-3 mb-6">
            {community.logoUrl && (
              <img src={community.logoUrl} alt={community.name} className="w-8 h-8 rounded-lg object-cover border border-blood-200" />
            )}
            <div>
              <p className="text-xs text-gray-600 font-body">Posting as</p>
              <p className="text-sm font-semibold text-blood-700 font-heading">{community.name}</p>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className={labelClass}>{t.patientName}</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input name="patientName" type="text" placeholder="Patient name" className="input-field pl-10" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.bloodGroup}</label>
              <select name="bloodGroup" className="input-field" required>
                <option value="">{t.selectGroup}</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t.unitsNeeded}</label>
              <div className="relative">
                <Droplet size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="unitsNeeded" type="number" min="1" max="20" placeholder="2" className="input-field pl-10" required />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.urgency}</label>
            <div className="relative">
              <AlertTriangle size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <select name="urgency" className="input-field pl-10" required>
                <option value="">{t.urgencySelect}</option>
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="NEEDED">NEEDED</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.hospitalName}</label>
            <div className="relative">
              <Hospital size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input name="hospitalName" type="text" placeholder="Feni General Hospital" className="input-field pl-10" required />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.location}</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <select name="location" className="input-field pl-10" required>
                <option value="">{t.locationSelect}</option>
                {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.hospitalAddress}</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input name="address" type="text" placeholder="Hospital address" className="input-field pl-10" required />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.contactNumber}</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input name="contactNumber" type="tel" placeholder="01712345678" className="input-field pl-10" required />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.notes}</label>
            <div className="relative">
              <FileText size={15} className="absolute left-3.5 top-3.5 text-gray-500" />
              <textarea name="notes" placeholder={t.notesPlaceholder} className="input-field pl-10 resize-none" rows={3} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-4 justify-center disabled:opacity-60">
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
