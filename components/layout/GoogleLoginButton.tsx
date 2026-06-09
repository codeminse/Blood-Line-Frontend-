"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { authFetch } from "@/lib/api";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  mode?: "donor" | "community";
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function GoogleLoginButton({ mode = "donor" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      // Always sync user record first
      const syncRes = await fetch(`${BASE}/api/v1/users/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const syncData = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncData.message || "Login failed");

      if (mode === "community") {
        // Check if this Google account belongs to an approved community
        const commRes = await authFetch(`${BASE}/api/v1/communities/my`);
        const commData = await commRes.json();

        if (commRes.ok && commData.data) {
          const status = commData.data.status;

          if (status === "APPROVED") {
            toast.success(`Welcome back, ${commData.data.name}!`);
            router.push("/community/dashboard");
            return;
          }

          if (status === "PENDING") {
            toast.info("Your community registration is still under review.");
            router.push("/");
            return;
          }

          if (status === "REJECTED") {
            toast.error("Your community registration was rejected. Please contact support.");
            router.push("/");
            return;
          }
        }

        // Logged in but no community found — offer to register
        toast.info("No community found for this account. Please register your community.");
        router.push("/community/register");
        return;
      }

      // Donor mode — normal flow
      if (syncData.data.isProfileComplete) {
        router.push("/");
      } else {
        router.push("/register");
      }
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "auth/popup-closed-by-user"
      ) {
        return;
      }
      const msg = err instanceof Error ? err.message : "Google login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-body shadow-sm disabled:opacity-60"
      aria-label="Continue with Google"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {loading ? "Signing in..." : "Continue with Google"}
    </button>
  );
}
