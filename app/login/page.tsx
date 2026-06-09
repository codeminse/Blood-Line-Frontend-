import LoginContent from "./LoginContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Feni Blood Line to manage your donor profile and help save lives in Feni District.",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginContent />;
}
