import type { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Dashboard login — Persee",
  description:
    "Use the email you requested a snippet with, your 6-character verification code, and your password to sign in.",
};

export default function Page() {
  return <LoginClient />;
}
