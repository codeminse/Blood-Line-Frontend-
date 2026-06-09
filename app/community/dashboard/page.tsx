"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Droplet,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  Facebook,
  Phone,
  Mail,
  Upload,
} from "lucide-react";
import DashboardStats from "@/components/community/DashboardStats";
import MemberTable, { type Member } from "@/components/community/MemberTable";
import DonationTable from "@/components/community/DonationTable";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

type Tab = "dashboard" | "users" | "donations" | "profile";

interface Community {
  _id: string;
  name: string;
  logoUrl: string;
  phone: string;
  email: string;
  website?: string;
  facebookPage?: string;
  facebookGroup?: string;
  status: string;
}

interface Stats {
  totalMembers: number;
  totalDonations: number;
}

interface TopDonor {
  _id: string;
  donorName: string;
  donorBloodGroup: string;
  donorProfileImageUrl?: string;
  donationCount: number;
}

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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/api/v1/upload/image`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.data.url as string;
}

export default function CommunityDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { lang } = useLang();
  const t = translations[lang].communityDashboard;

  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [community, setCommunity] = useState<Community | null>(null);
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalDonations: 0 });
  const [members, setMembers] = useState<Member[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    website: "",
    facebookPage: "",
    facebookGroup: "",
  });
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState("");

  const loadCommunity = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/api/v1/communities/my`);
      const data = await res.json();
      if (!res.ok || data.data?.status !== "APPROVED") {
        if (data.data?.status === "PENDING") {
          router.push("/?community=pending");
        } else {
          router.push("/community/register");
        }
        return;
      }
      const c: Community = data.data;
      setCommunity(c);
      setProfileForm({
        name: c.name,
        phone: c.phone,
        website: c.website ?? "",
        facebookPage: c.facebookPage ?? "",
        facebookGroup: c.facebookGroup ?? "",
      });
    } catch {
      router.push("/community/register");
    }
  }, [router]);

  const loadStats = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/api/v1/communities/my/stats`);
      const data = await res.json();
      if (res.ok) setStats(data.data);
    } catch {}
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/api/v1/communities/my/members?limit=100`);
      const data = await res.json();
      if (res.ok) setMembers(Array.isArray(data.data) ? data.data : []);
    } catch {}
  }, []);

  const loadDonations = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/api/v1/communities/my/donations?limit=100`);
      const data = await res.json();
      if (res.ok) setDonations(Array.isArray(data.data) ? data.data : []);
    } catch {}
  }, []);

  const loadTopDonors = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/api/v1/communities/my/top-donors`);
      const data = await res.json();
      if (res.ok) setTopDonors(Array.isArray(data.data) ? data.data : []);
    } catch {}
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    const init = async () => {
      setLoadingData(true);
      await loadCommunity();
      await Promise.all([loadStats(), loadMembers(), loadDonations(), loadTopDonors()]);
      setLoadingData(false);
    };
    init();
  }, [user, authLoading, router, loadCommunity, loadStats, loadMembers, loadDonations, loadTopDonors]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setSidebarOpen(false);
    if (newTab === "users") loadMembers();
    if (newTab === "donations") loadDonations();
    if (newTab === "dashboard") { loadStats(); loadTopDonors(); }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const body: Record<string, string> = { ...profileForm };
      if (newLogoFile) {
        toast.info(t.uploadingLogo);
        body.logoUrl = await uploadFile(newLogoFile);
      }
      const res = await authFetch(`${BASE}/api/v1/communities/my`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCommunity(data.data);
      setNewLogoFile(null);
      setNewLogoPreview("");
      toast.success(t.profileUpdated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blood-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "users",     label: t.members,   icon: Users },
    { id: "donations", label: t.donations, icon: Droplet },
    { id: "profile",   label: t.profile,   icon: Settings },
  ];

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 font-body";

  const tabLabel = tab === "users"
    ? t.members
    : tab === "dashboard" ? t.dashboard
    : tab === "donations" ? t.donations
    : t.profile;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {community?.logoUrl && (
              <img
                src={community.logoUrl}
                alt={community.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-200"
              />
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate font-heading">
                {community?.name}
              </p>
              <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full font-body">
                {t.approved}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body transition-colors ${
                tab === item.id
                  ? "bg-blood-50 text-blood-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-body"
          >
            <LogOut size={16} />
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <h1 className="font-bold text-gray-900 font-heading">{tabLabel}</h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {tab === "dashboard" && (
            <div className="space-y-6">
              <DashboardStats
                totalMembers={stats.totalMembers}
                totalDonations={stats.totalDonations}
                communityName={community?.name ?? ""}
              />

              <div className="card-solid p-5">
                <h2 className="font-bold text-gray-900 font-heading text-base mb-4 flex items-center gap-2">
                  <span className="text-blood-600">🏆</span> {t.top10}
                </h2>
                {topDonors.length === 0 ? (
                  <p className="text-sm text-gray-400 font-body text-center py-6">
                    {t.noDonationsYet}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topDonors.map((donor, idx) => (
                      <div
                        key={donor._id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0 ? "bg-yellow-100 text-yellow-700" :
                          idx === 1 ? "bg-gray-200 text-gray-600" :
                          idx === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blood-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {donor.donorProfileImageUrl ? (
                            <img src={donor.donorProfileImageUrl} alt={donor.donorName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blood-600 font-bold text-xs">
                              {donor.donorName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate font-body">{donor.donorName}</p>
                        </div>
                        <span className="badge-blood w-8 h-8 text-xs shrink-0">{donor.donorBloodGroup}</span>
                        <span className="text-xs font-bold text-blood-600 bg-blood-50 border border-blood-100 rounded-full px-2.5 py-1 whitespace-nowrap shrink-0">
                          ❤ {donor.donationCount}×
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "users" && (
            <MemberTable
              members={members}
              loading={false}
              onRefresh={() => { loadMembers(); loadStats(); }}
              communityName={community?.name}
              communityLogoUrl={community?.logoUrl}
            />
          )}

          {tab === "donations" && (
            <DonationTable
              donations={donations}
              loading={false}
              onRefresh={() => { loadDonations(); loadStats(); }}
              members={members}
            />
          )}

          {tab === "profile" && community && (
            <div className="max-w-lg space-y-6">
              <form onSubmit={handleProfileSave} className="card-solid p-6 space-y-5">
                <h2 className="font-bold text-gray-900 font-heading text-lg">{t.communityProfile}</h2>

                <div>
                  <label className={labelClass}>{t.communityLogo}</label>
                  <div className="flex items-center gap-4">
                    <img
                      src={newLogoPreview || community.logoUrl}
                      alt="Logo"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      className="btn-outline rounded-xl gap-2"
                    >
                      <Upload size={14} />
                      {t.changeLogo}
                    </button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setNewLogoFile(f); setNewLogoPreview(URL.createObjectURL(f)); }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t.communityName}</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    type="text"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t.phone}</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                        type="tel"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t.email}</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={community.email} disabled type="email" className="input-field pl-10 opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t.website}</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={profileForm.website}
                      onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))}
                      type="url"
                      className="input-field pl-10"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t.fbPage}</label>
                    <div className="relative">
                      <Facebook size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={profileForm.facebookPage}
                        onChange={(e) => setProfileForm((p) => ({ ...p, facebookPage: e.target.value }))}
                        type="url"
                        className="input-field pl-10"
                        placeholder="https://fb.com/..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t.fbGroup}</label>
                    <div className="relative">
                      <Facebook size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={profileForm.facebookGroup}
                        onChange={(e) => setProfileForm((p) => ({ ...p, facebookGroup: e.target.value }))}
                        type="url"
                        className="input-field pl-10"
                        placeholder="https://fb.com/groups/..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="btn-primary w-full rounded-xl justify-center disabled:opacity-60"
                >
                  {profileSaving ? t.saving : t.saveChanges}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
