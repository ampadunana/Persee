// src/app/api/sys/status/route.ts
import { NextResponse } from "next/server";
import { emailConfigured, RESEND_FROM } from "@/lib/email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    ok: true,
    emailConfigured,
    from: RESEND_FROM,
  });
}
