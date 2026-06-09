import type { Donor } from "@/components/donor/DonorCard";
import BloodDonor from "@/components/home/BloodDonor";
import CommunitySection from "@/components/home/CommunitySection";
import EmergencyRequests from "@/components/home/EmergencyRequests";
import Hero from "@/components/home/Hero";
import RecentDonations from "@/components/home/RecentDonations";
import type { Emergency } from "@/components/hospital/EmergencyCard";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AboutSection = dynamic(() => import("@/components/home/AboutSection"));

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenibloodline.com"
  ),
  title: "Feni Blood Line — Save Lives Through Blood Donation",
  description:
    "Connect with verified blood donors in Feni District. Find emergency blood, register as a donor, and help save lives today.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Feni Blood Line",
    title: "Feni Blood Line — Every Second Saves a Life",
    description:
      "Connect with verified blood donors in Feni District. Find emergency blood, register as a donor, and help save lives today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Feni Blood Line — Blood donation saves lives",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feni Blood Line — Every Second Saves a Life",
    description:
      "Connect with verified blood donors in Feni District. Find emergency blood, register as a donor, and help save lives today.",
    images: ["/og-image.jpg"],
  },
};

async function fetchBloodRequests(): Promise<{ data: Emergency[]; failed: boolean }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const res = await fetch(`${baseUrl}/api/v1/blood-requests?page=1&limit=6`, {
      next: { revalidate: 300 }, // 5-min stale-while-revalidate
    });
    if (!res.ok) return { data: [], failed: true };
    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    return { data, failed: false };
  } catch {
    return { data: [], failed: true };
  }
}

async function fetchDonors(): Promise<Donor[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const res = await fetch(`${baseUrl}/api/v1/users/search?page=1&limit=6`, {
      next: { revalidate: 300 }, // 5-min stale-while-revalidate
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [{ data: emergencies, failed: emergencyFailed }, donors] = await Promise.all([
    fetchBloodRequests(),
    fetchDonors(),
  ]);

  return (
    <>
      <Hero />
      <EmergencyRequests initialData={emergencies} fetchFailed={emergencyFailed} />
      <BloodDonor initialData={donors} />
      <RecentDonations />
      <CommunitySection />
      <AboutSection />
    </>
  );
}
