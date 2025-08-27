// src/lib/email.ts
import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const RESEND_FROM =
  process.env.EMAIL_FROM || "Persee <no-reply@persee.live>";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://persee.live";

export const emailConfigured = !!process.env.RESEND_API_KEY;
