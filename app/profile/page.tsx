"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import { useAuth } from "@/components/layout/AuthProvider";
import { authFetch } from "@/lib/api";
import { Calendar, CheckCircle, CreditCard, Droplet, Edit2, Heart, Home, LayoutDashboard, LogOut, Mail, MapPin, Phone, Plus, User, Users, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import PersonalDonationModal from "@/components/profile/PersonalDonationModal";
import IdCard, { type IdCardData } from "@/components/IdCard";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LOCATIONS = ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"];

type UserProfile = {
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  bloodGroup: string | null;
  location: string | null;
  homeAddress: string | null;
  profileImageUrl: string | null;
  isAvailableToDonate: boolean;
  isProfileComplete: boolean;
  donationCount: number;
};

type DonationEntry = {
  _id: string;
  donorBloodGroup: string;
  patientName: string;
  hospitalName?: string;
  location: string;
  address: string;
  donatedAt: string;
  notes?: string;
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days >= 365) return `${Math.floor(days / 365)}y ago`;
  if (days >= 30) return `${Math.floor(days / 30)}mo ago`;
  if (days >= 1) return `${days}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  return "Just now";
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { lang } = useLang();
  const t = translations[lang].profile;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pageState, setPageState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [communityInfo, setCommunityInfo] = useState<{
    name: string;
    logoUrl: string | null;
    status: "APPROVED" | "PENDING" | "REJECTED";
  } | null>(null);

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donations, setDonations] = useState<DonationEntry[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [idCardData, setIdCardData] = useState<IdCardData | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && editing) setEditing(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editing]);

  useEffect(() => {
    document.body.style.overflow = editing ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [editing]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadProfile = useCallback(async () => {
    setPageState("loading");
    setError("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await authFetch(`${baseUrl}/api/v1/users/me`);
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { router.push("/register"); return; }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      if (!data?.data) throw new Error("Profile data missing in response");
      setProfile(data.data);
      setPageState("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not load profile";
      setError(msg);
      setPageState("error");
      toast.error(msg);
    }
  }, [router]);

  useEffect(() => { if (user) loadProfile(); }, [user, loadProfile]);

  useEffect(() => {
    if (!user) { setCommunityInfo(null); return; }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    authFetch(`${baseUrl}/api/v1/communities/my`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setCommunityInfo({ name: d.data.name, logoUrl: d.data.logoUrl ?? null, status: d.data.status });
        } else {
          setCommunityInfo(null);
        }
      })
      .catch(() => setCommunityInfo(null));
  }, [user]);

  const loadDonations = useCallback(async () => {
    if (!user) return;
    setDonationsLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    authFetch(`${baseUrl}/api/v1/donations/my?limit=20`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.data)) setDonations(d.data); })
      .catch(() => {})
      .finally(() => setDonationsLoading(false));
  }, [user]);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  const handleAvailabilityToggle = async () => {
    if (!profile || availabilityLoading) return;
    const next = !profile.isAvailableToDonate;
    setProfile((p) => p ? { ...p, isAvailableToDonate: next } : p);
    setAvailabilityLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await authFetch(`${baseUrl}/api/v1/users/me/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailableToDonate: next }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data.data);
      toast.success(next ? t.toastAvailableOn : t.toastAvailableOff);
    } catch {
      setProfile((p) => p ? { ...p, isAvailableToDonate: !next } : p);
      toast.error(t.toastAvailabilityFail);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditError("");
    const formData = new FormData(e.currentTarget);
    const homeAddress = String(formData.get("homeAddress") ?? "").trim();
    const body: Record<string, string> = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
      bloodGroup: String(formData.get("bloodGroup") ?? ""),
      location: String(formData.get("location") ?? ""),
    };
    if (homeAddress) body.homeAddress = homeAddress;

    setEditLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const method = profile?.isProfileComplete ? "PUT" : "PATCH";
      const res = await authFetch(`${baseUrl}/api/v1/users/me/profile`, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setProfile(data.data);
      setEditing(false);
      toast.success(t.toastProfileSaved);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setEditError(msg);
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success(t.toastSignOut);
    router.push("/");
  };

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 font-body";

  if (authLoading || pageState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blood-50/40 to-white py-12 px-4">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="h-20 w-20 rounded-full bg-gray-100 animate-pulse mx-auto" />
          <div className="h-6 w-40 rounded-xl bg-gray-100 animate-pulse mx-auto" />
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-700 font-body mb-2 text-sm">{error}</p>
          <button onClick={loadProfile} className="btn-primary rounded-xl mt-2">{t.tryAgain}</button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = getInitials(profile.fullName);
  const avatarUrl = profile.profileImageUrl ?? user?.photoURL ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blood-50/40 to-white py-12 px-4 page-enter">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="card rounded-3xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blood-100">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.fullName ?? "Profile"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    {initials}
                  </div>
                )}
              </div>
              {profile.isAvailableToDonate && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" aria-label="Available to donate" />
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              {profile.fullName ?? "—"}
            </h1>

            {profile.isProfileComplete ? (
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold font-body">
                <CheckCircle size={12} />
                {t.verifiedDonor}
              </div>
            ) : (
              <button onClick={() => router.push("/register")} className="text-xs text-blood-600 font-semibold font-body hover:underline">
                {t.completeProfile}
              </button>
            )}
          </div>

          <div className="space-y-1 mb-6">
            <InfoRow icon={<Mail size={14} className="text-blue-500" />} bg="bg-blue-50" label={t.email}>
              <p className="text-sm text-blue-600 font-body break-all">{profile.email}</p>
            </InfoRow>
            {profile.phoneNumber && (
              <InfoRow icon={<Phone size={14} className="text-green-600" />} bg="bg-green-50" label={t.phone}>
                <p className="text-sm text-gray-900 font-body">{profile.phoneNumber}</p>
              </InfoRow>
            )}
            {profile.location && (
              <InfoRow icon={<MapPin size={14} className="text-orange-500" />} bg="bg-orange-50" label={t.location}>
                <p className="text-sm text-gray-900 font-body">{profile.location}</p>
              </InfoRow>
            )}
            {profile.homeAddress && (
              <InfoRow icon={<Home size={14} className="text-purple-500" />} bg="bg-purple-50" label={t.homeAddress}>
                <p className="text-sm text-gray-900 font-body">{profile.homeAddress}</p>
              </InfoRow>
            )}
            {profile.bloodGroup && (
              <InfoRow icon={<Heart size={14} className="text-blood-600" />} bg="bg-blood-50" label={t.bloodGroup} badge={<span className="badge-blood text-sm">{profile.bloodGroup}</span>}>
                <p className="text-sm text-gray-900 font-body">{profile.bloodGroup}</p>
              </InfoRow>
            )}

            {profile.isProfileComplete && (
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${profile.isAvailableToDonate ? "bg-green-50" : "bg-gray-100"}`}>
                    <CheckCircle size={14} className={profile.isAvailableToDonate ? "text-green-600" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 font-body uppercase tracking-wider">{t.availability}</p>
                    <p className={`text-sm font-semibold font-body ${profile.isAvailableToDonate ? "text-green-600" : "text-gray-700"}`}>
                      {profile.isAvailableToDonate ? t.readyToDonate : t.notAvailable}
                    </p>
                  </div>
                </div>
                <label className="toggle-switch" aria-label="Toggle donation availability">
                  <input type="checkbox" checked={profile.isAvailableToDonate} onChange={handleAvailabilityToggle} disabled={availabilityLoading} />
                  <span className="toggle-slider" />
                </label>
              </div>
            )}
          </div>

          <button onClick={() => { setEditError(""); setEditing(true); }} className="btn-primary w-full rounded-xl py-3.5 justify-center mb-3">
            <Edit2 size={15} />
            {t.editProfile}
          </button>
          {profile.isProfileComplete && (
            <button
              onClick={() => setIdCardData({
                name: profile.fullName ?? "",
                bloodGroup: profile.bloodGroup ?? "",
                phone: profile.phoneNumber ?? "",
                location: profile.location ?? "",
                address: profile.homeAddress ?? "",
                profileImageUrl: profile.profileImageUrl ?? user?.photoURL,
                donationCount: donations.length,
                communityName: communityInfo?.status === "APPROVED" ? communityInfo.name : null,
                communityLogoUrl: communityInfo?.status === "APPROVED" ? communityInfo.logoUrl : null,
                cardType: "donor",
              })}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-blood-600 hover:text-blood-700 font-body font-semibold transition-colors mb-1 border border-blood-100 rounded-xl hover:bg-blood-50"
            >
              <CreditCard size={14} />
              Download ID Card
            </button>
          )}
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-700 hover:text-red-600 font-body transition-colors">
            <LogOut size={14} />
            {t.signOut}
          </button>
        </div>

        {/* Donation section — only for users with a complete profile */}
        {profile.isProfileComplete && (
          <div className="card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blood-50 flex items-center justify-center">
                  <Droplet size={15} className="text-blood-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 font-heading">My Donations</p>
                  <p className="text-[10px] text-gray-600 font-body uppercase tracking-wider">{donations.length} recorded</p>
                </div>
              </div>
              <button
                onClick={() => setShowDonationModal(true)}
                className="btn-primary rounded-xl px-3 py-2 text-xs gap-1.5"
              >
                <Plus size={13} />
                Add Donation
              </button>
            </div>

            {donationsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-full bg-blood-50 flex items-center justify-center mx-auto mb-2">
                  <Droplet size={16} className="text-blood-300" />
                </div>
                <p className="text-xs text-gray-600 font-body">No donations recorded yet.</p>
                <p className="text-xs text-gray-600 font-body">Tap &quot;Add Donation&quot; after donating blood.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {donations.map((d) => (
                  <div key={d._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blood-50/40 transition-colors">
                    <span className="badge-blood shrink-0 text-[11px] mt-0.5">{d.donorBloodGroup}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 font-body truncate">
                        → {d.patientName}
                      </p>
                      {d.hospitalName && (
                        <p className="text-xs text-gray-700 font-body truncate">{d.hospitalName}</p>
                      )}
                      <p className="text-[10px] text-gray-600 font-body flex items-center gap-1 mt-0.5">
                        <MapPin size={9} />
                        {d.location}
                        <span className="mx-1">·</span>
                        <Calendar size={9} />
                        {timeAgo(d.donatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Community section */}
        {communityInfo ? (
          <div className="card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              {communityInfo.logoUrl ? (
                <img src={communityInfo.logoUrl} alt={communityInfo.name} className="w-10 h-10 rounded-full object-cover border-2 border-blood-100" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blood-50 border-2 border-blood-100 flex items-center justify-center">
                  <Users size={18} className="text-blood-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-600 font-body uppercase tracking-wider">Community</p>
                <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: "var(--font-heading)" }}>{communityInfo.name}</p>
              </div>
              {communityInfo.status === "APPROVED" && (
                <span className="text-xs bg-green-50 text-green-600 border border-green-100 rounded-full px-2.5 py-1 font-semibold font-body shrink-0">Active</span>
              )}
              {communityInfo.status === "PENDING" && (
                <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-full px-2.5 py-1 font-semibold font-body shrink-0">Pending</span>
              )}
              {communityInfo.status === "REJECTED" && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-100 rounded-full px-2.5 py-1 font-semibold font-body shrink-0">Rejected</span>
              )}
            </div>

            {communityInfo.status === "APPROVED" && (
              <Link href="/community/dashboard" className="btn-primary w-full rounded-xl py-3 justify-center text-sm">
                <LayoutDashboard size={15} />
                Community Dashboard
              </Link>
            )}
            {communityInfo.status === "PENDING" && (
              <p className="text-xs text-gray-700 font-body text-center leading-relaxed">
                Your registration is under review. You&apos;ll be notified once approved.
              </p>
            )}
            {communityInfo.status === "REJECTED" && (
              <p className="text-xs text-red-500 font-body text-center leading-relaxed">
                Your registration was rejected. Please contact support.
              </p>
            )}
          </div>
        ) : (
          <div className="card rounded-3xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blood-50 border-2 border-blood-100 flex items-center justify-center mx-auto mb-3">
              <Users size={18} className="text-blood-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: "var(--font-heading)" }}>Have a community?</p>
            <p className="text-xs text-gray-700 font-body mb-4">Register your community to manage members and donations.</p>
            <Link href="/community/register" className="btn-primary w-full rounded-xl py-2.5 justify-center text-sm">
              Register Community
            </Link>
          </div>
        )}
      </div>

      {idCardData && createPortal(
        <IdCard data={idCardData} onClose={() => setIdCardData(null)} />,
        document.body
      )}

      {showDonationModal && profile && createPortal(
        <PersonalDonationModal
          prefill={{
            donorName: profile.fullName ?? "",
            donorBloodGroup: profile.bloodGroup ?? "",
            donorPhone: profile.phoneNumber ?? "",
            donorProfileImageUrl: profile.profileImageUrl ?? user?.photoURL ?? "",
            location: profile.location ?? "",
          }}
          onClose={() => setShowDonationModal(false)}
          onSaved={() => { setShowDonationModal(false); loadDonations(); }}
        />,
        document.body
      )}

      {editing && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}
          aria-modal="true"
          role="dialog"
        >
          <div className="min-h-full flex items-center justify-center p-4 py-8 sm:p-6">
            <div ref={modalRef} className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col" style={{ animation: "slideUp 0.22s ease-out forwards" }}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                  {t.modal.title}
                </h2>
                <button onClick={() => setEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors" aria-label="Close">
                  <X size={17} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {editError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-xs font-body">
                    <XCircle size={14} className="shrink-0" />
                    {editError}
                  </div>
                )}

                <form id="edit-profile-form" className="space-y-4" onSubmit={handleEditSubmit}>
                  <div>
                    <label className={labelClass}>{t.modal.fullName}</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="fullName" type="text" defaultValue={profile.fullName ?? ""} className="input-field pl-10" required />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t.modal.phoneNumber}</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="phoneNumber" type="tel" defaultValue={profile.phoneNumber ?? ""} placeholder="01XXXXXXXXX" className="input-field pl-10" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>{t.modal.bloodGroup}</label>
                      <select name="bloodGroup" className="input-field" defaultValue={profile.bloodGroup ?? ""} required>
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t.modal.location}</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select name="location" className="input-field pl-9" defaultValue={profile.location ?? ""} required>
                          <option value="">Select</option>
                          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t.modal.homeAddress}</label>
                    <div className="relative">
                      <Home size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="homeAddress" type="text" defaultValue={profile.homeAddress ?? ""} placeholder="Chanua Bazar, Feni" className="input-field pl-10" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                <button type="submit" form="edit-profile-form" disabled={editLoading} className="btn-primary flex-1 rounded-xl py-3 justify-center disabled:opacity-60">
                  {editLoading ? t.modal.saving : t.modal.save}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl font-body transition-colors">
                  {t.modal.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function InfoRow({ icon, bg, label, badge, children }: { icon: React.ReactNode; bg: string; label: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">{label}</p>
          {children}
        </div>
      </div>
      {badge && <div className="shrink-0 ml-2">{badge}</div>}
    </div>
  );
}
