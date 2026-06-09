"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, User, Phone, Mail, Globe, Facebook, FileText, CheckCircle } from "lucide-react";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function uploadFile(file: File, type: "image" | "document"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/api/v1/upload/${type}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.data.url as string;
}

export default function CommunityRegisterPage() {
  const { lang } = useLang();
  const t = translations[lang].communityRegister;

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    website: "",
    facebookPage: "",
    facebookGroup: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) { toast.error(t.logoRequired); return; }

    setLoading(true);
    try {
      setUploadProgress(t.uploadingLogo);
      const logoUrl = await uploadFile(logoFile, "image");

      let documentUrl = "";
      if (docFile) {
        setUploadProgress(t.uploadingDoc);
        documentUrl = await uploadFile(docFile, "document");
      }

      setUploadProgress(t.submittingReg);
      const body: Record<string, string> = { ...form, logoUrl };
      if (documentUrl) body.documentUrl = documentUrl;

      const res = await fetch(`${BASE}/api/v1/communities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setDone(true);
      toast.success(t.registrationSuccess);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 font-body";

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blood-50/60 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center card p-10">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-2">{t.successTitle}</h2>
          <p className="text-gray-500 font-body text-sm">{t.successDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blood-50/60 to-white px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-heading">
            {t.title} <em className="text-blood-600 not-italic">{t.titleHighlight}</em>
          </h1>
          <p className="text-gray-500 font-body text-sm mt-2">{t.subtitle}</p>
        </div>

        <div className="card-solid p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo upload */}
            <div>
              <label className={labelClass}>{t.logo}</label>
              <div
                onClick={() => logoRef.current?.click()}
                className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blood-300 transition-colors"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Upload size={20} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-700 font-body">
                    {logoFile ? logoFile.name : t.logoClick}
                  </p>
                  <p className="text-xs text-gray-400 font-body mt-0.5">{t.logoHint}</p>
                </div>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>

            {/* Community name */}
            <div>
              <label className={labelClass}>{t.name}</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.name} onChange={(e) => set("name", e.target.value)} type="text" className="input-field pl-10" placeholder={t.namePlaceholder} required />
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.phone}</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} type="tel" className="input-field pl-10" placeholder="01XXXXXXXXX" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t.email}</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" className="input-field pl-10" placeholder="community@email.com" required />
                </div>
              </div>
            </div>

            {/* Optional fields */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-body mb-4">{t.optional}</p>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t.website}</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.website} onChange={(e) => set("website", e.target.value)} type="url" className="input-field pl-10" placeholder="https://yourwebsite.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t.facebookPage}</label>
                    <div className="relative">
                      <Facebook size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={form.facebookPage} onChange={(e) => set("facebookPage", e.target.value)} type="url" className="input-field pl-10" placeholder="https://fb.com/page" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t.facebookGroup}</label>
                    <div className="relative">
                      <Facebook size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={form.facebookGroup} onChange={(e) => set("facebookGroup", e.target.value)} type="url" className="input-field pl-10" placeholder="https://fb.com/groups/..." />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t.document}</label>
                  <div
                    onClick={() => docRef.current?.click()}
                    className="flex items-center gap-3 p-3 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blood-300 transition-colors"
                  >
                    <FileText size={16} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 font-body">
                      {docFile ? docFile.name : t.documentHint}
                    </span>
                  </div>
                  <input ref={docRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleDocChange} />
                </div>
              </div>
            </div>

            {uploadProgress && (
              <p className="text-xs text-blood-600 font-body font-semibold text-center animate-pulse">
                {uploadProgress}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-xl py-4 justify-center disabled:opacity-60"
            >
              {loading ? t.submitting : t.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
