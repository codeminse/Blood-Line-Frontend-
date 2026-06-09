"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, Plus, Search, Phone, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/api";
import AddMemberModal from "./AddMemberModal";
import IdCard, { type IdCardData } from "@/components/IdCard";
import { useLang } from "@/components/layout/LangContext";
import { translations } from "@/lib/translations";

export interface Member {
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
  members: Member[];
  loading: boolean;
  onRefresh: () => void;
  communityName?: string;
  communityLogoUrl?: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function MemberTable({ members, loading, onRefresh, communityName, communityLogoUrl }: Props) {
  const { lang } = useLang();
  const t = translations[lang].memberTable;

  const [search, setSearch] = useState("");
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [idCardData, setIdCardData] = useState<IdCardData | null>(null);

  const filtered = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.bloodGroup.includes(search),
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your community?`)) return;
    setDeleting(id);
    try {
      const res = await authFetch(`${BASE}/api/v1/communities/my/members/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${name} removed`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setDeleting(null);
    }
  };

  const openIdCard = (m: Member) => {
    setIdCardData({
      name: m.fullName,
      bloodGroup: m.bloodGroup,
      phone: m.phone,
      location: m.location,
      address: m.homeAddress ?? "",
      profileImageUrl: m.profileImageUrl ?? null,
      communityName: communityName ?? null,
      communityLogoUrl: communityLogoUrl ?? null,
      cardType: "member",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder={t.searchPlaceholder}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary rounded-xl justify-center gap-2"
        >
          <Plus size={15} />
          {t.addMember}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-body">
          {members.length === 0 ? t.noMembers : t.noResults}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.memberCol}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t.bloodCol}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">{t.locationCol}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t.statusCol}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blood-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {m.profileImageUrl ? (
                          <img src={m.profileImageUrl} alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-blood-600 font-bold text-xs">
                            {m.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{m.fullName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone size={10} /> {m.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="badge-blood w-8 h-8 text-xs">{m.bloodGroup}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-gray-600">
                      <MapPin size={12} className="text-gray-400" /> {m.location}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.isAvailableToDonate ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {m.isAvailableToDonate ? t.available : t.unavailable}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openIdCard(m)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blood-50 hover:text-blood-600 flex items-center justify-center transition-colors"
                        title="ID Card"
                      >
                        <CreditCard size={13} />
                      </button>
                      <button
                        onClick={() => setEditMember(m)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id, m.fullName)}
                        disabled={deleting === m._id}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); onRefresh(); }}
        />
      )}

      {editMember && (
        <AddMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSaved={() => { setEditMember(null); onRefresh(); }}
        />
      )}

      {idCardData && typeof document !== "undefined" && createPortal(
        <IdCard data={idCardData} onClose={() => setIdCardData(null)} />,
        document.body,
      )}
    </div>
  );
}
