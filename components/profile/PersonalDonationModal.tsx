"use client";

import { authFetch } from "@/lib/api";
import { Calendar, FileText, Home, Phone, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LOCATIONS = ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"];
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Prefill {
  donorName: string;
  donorBloodGroup: string;
  donorPhone: string;
  donorProfileImageUrl: string;
  location: string;
}

interface Props {
  prefill: Prefill;
  onClose: () => void;
  onSaved: () => void;
}

const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 font-body";

export default function PersonalDonationModal({ prefill, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    donorName: prefill.donorName,
    donorBloodGroup: prefill.donorBloodGroup,
    donorPhone: prefill.donorPhone,
    patientName: "",
    patientPhone: "",
    hospitalName: "",
    location: prefill.location,
    address: "",
    donatedAt: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        donorProfileImageUrl: prefill.donorProfileImageUrl || undefined,
      };
      const res = await authFetch(`${BASE}/api/v1/donations`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record donation");
      toast.success("Donation recorded!");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
          style={{ animation: "slideUp 0.22s ease-out forwards" }}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 font-heading">Record Donation</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={17} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Donor — pre-filled, still editable */}
            <p className="text-[11px] text-gray-400 font-body uppercase tracking-wider border-b pb-2">Your Info</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Your Name *</label>
                <div className="relative">
                  <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.donorName} onChange={(e) => set("donorName", e.target.value)} type="text" className="input-field pl-10 text-sm" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Blood Group *</label>
                <select value={form.donorBloodGroup} onChange={(e) => set("donorBloodGroup", e.target.value)} className="input-field text-sm" required>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Your Phone *</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.donorPhone} onChange={(e) => set("donorPhone", e.target.value)} type="tel" className="input-field pl-10 text-sm" placeholder="01XXXXXXXXX" required />
              </div>
            </div>

            {/* Patient */}
            <p className="text-[11px] text-gray-400 font-body uppercase tracking-wider border-b pb-2 pt-1">Patient Info</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Patient Name *</label>
                <div className="relative">
                  <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.patientName} onChange={(e) => set("patientName", e.target.value)} type="text" className="input-field pl-10 text-sm" placeholder="Patient name" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Patient Phone *</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.patientPhone} onChange={(e) => set("patientPhone", e.target.value)} type="tel" className="input-field pl-10 text-sm" placeholder="01XXXXXXXXX" required />
                </div>
              </div>
            </div>

            {/* Donation details */}
            <p className="text-[11px] text-gray-400 font-body uppercase tracking-wider border-b pb-2 pt-1">Donation Details</p>

            <div>
              <label className={labelClass}>Hospital Name</label>
              <div className="relative">
                <Home size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.hospitalName} onChange={(e) => set("hospitalName", e.target.value)} type="text" className="input-field pl-10 text-sm" placeholder="Hospital / clinic name" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Location *</label>
                <select value={form.location} onChange={(e) => set("location", e.target.value)} className="input-field text-sm" required>
                  <option value="">Select</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date *</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.donatedAt} onChange={(e) => set("donatedAt", e.target.value)} type="datetime-local" className="input-field pl-10 text-sm" required />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Address *</label>
              <div className="relative">
                <Home size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.address} onChange={(e) => set("address", e.target.value)} type="text" className="input-field pl-10 text-sm" placeholder="Hospital address" required />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <div className="relative">
                <FileText size={13} className="absolute left-3.5 top-3.5 text-gray-400" />
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="input-field pl-10 resize-none text-sm" placeholder="Any notes (optional)" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl font-body transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 rounded-xl py-3 justify-center disabled:opacity-60">
                {loading ? "Saving..." : "Record Donation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
