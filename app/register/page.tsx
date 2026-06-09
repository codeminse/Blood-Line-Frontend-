"use client";

import { translations } from "@/lib/translations";
import { useLang } from "@/components/layout/LangContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AlertCircle, ArrowRight, Heart, Mail, MapPin, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const locations = ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"];

export default function RegisterPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang].register;

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/login"); return; }
      setEmail(user.email || "");
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) { router.push("/login"); return; }

    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      await fetch(`${baseUrl}/api/v1/users/sync`, { method: "POST", headers });

      const homeAddress = String(formData.get("homeAddress") ?? "").trim();
      const body: Record<string, string | boolean> = {
        fullName: String(formData.get("fullName") ?? "").trim(),
        phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
        bloodGroup: String(formData.get("bloodGroup") ?? ""),
        location: String(formData.get("location") ?? ""),
      };
      if (homeAddress) body.homeAddress = homeAddress;

      const res = await fetch(`${baseUrl}/api/v1/users/me/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Profile update failed");
      router.push("/profile");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 font-body";

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blood-50/40 to-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md page-enter">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            {photoURL ? (
              <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-4 shadow-md border border-gray-100">
                <img src={photoURL} alt="Profile photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blood-50 mb-4">
                <Image src="/favicon-16x16.png" alt="Feni Blood Line Logo" width={20} height={20} />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-sm text-gray-500 font-body">{t.subtitle}</p>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-5 text-xs font-body">
              <AlertCircle size={14} className="shrink-0" />
              {submitError}
            </div>
          )}

          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className={labelClass}>{t.fullName}</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="fullName" name="fullName" type="text" placeholder="Nazmul Khan" defaultValue={displayName} className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>{t.email}</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="email" name="email" type="email" value={email} disabled className="input-field pl-10 bg-gray-50 cursor-not-allowed" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phoneNumber" className={labelClass}>{t.phoneNumber}</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="phoneNumber" name="phoneNumber" type="tel" placeholder="01XXXXXXXXX" className="input-field pl-10" required />
                </div>
              </div>
              <div>
                <label htmlFor="bloodGroup" className={labelClass}>{t.bloodGroup}</label>
                <select id="bloodGroup" name="bloodGroup" className="input-field cursor-pointer" required>
                  <option value="">{t.selectGroup}</option>
                  {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className={labelClass}>{t.location}</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select id="location" name="location" className="input-field pl-10 cursor-pointer" required>
                  <option value="">{t.selectArea}</option>
                  {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="homeAddress" className={labelClass}>{t.homeAddress}</label>
              <input id="homeAddress" name="homeAddress" type="text" placeholder="Chanua Bazar, Feni" className="input-field" />
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Heart size={15} className="text-blood-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 font-body">{t.readyToDonate}</p>
                  <p className="text-xs text-gray-400 font-body">{t.readySubtext}</p>
                </div>
              </div>
              <label className="toggle-switch" htmlFor="isAvailableToDonate">
                <input type="checkbox" id="isAvailableToDonate" name="isAvailableToDonate" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-4 text-base justify-center disabled:opacity-60">
              {loading ? t.submitting : t.submit}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed font-body">
            {t.privacyText}{" "}
            <Link href="/privacy" className="text-blood-600 hover:underline">{t.privacyLink}</Link>
            {" "}{t.and}{" "}
            <Link href="/terms" className="text-blood-600 hover:underline">{t.termsLink}</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
