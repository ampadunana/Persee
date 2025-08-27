// src/app/snippet/send-snippet.tsx
"use client";

import * as React from "react";

type Phase =
  | "enter-domain"
  | "generating"
  | "enter-email"
  | "sending"
  | "sent"
  | "error";

const stepLabels = [
  "Minting keys…",
  "Verifying domain…",
  "Preparing secure snippet…",
  "Packaging email…",
  "Done",
] as const;

function normalizeDomain(input: string): string | null {
  const s = (input || "").trim().toLowerCase();
  let host = s;
  try {
    if (/^https?:\/\//i.test(s)) host = new URL(s).hostname;
  } catch {
    /* noop */
  }
  const ok = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host);
  return ok ? host : null;
}

function isValidEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

async function trySendSnippet(payload: { email: string; domain: string }) {
  const endpoints = ["/api/snippet/send", "/api/snippet"];
  let lastErr: any = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email, domain: payload.domain }),
      });
      if (res.ok) return true;
      lastErr = await res.json().catch(() => ({}));
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    (lastErr && (lastErr.error || lastErr.message)) || "Failed to send email"
  );
}

// ---------- Randomized, smooth 15–20s progress ----------

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function scaleDurationsTo(totalMs: number, bases: number[]) {
  const sum = bases.reduce((a, b) => a + b, 0);
  const scale = totalMs / sum;
  const scaled = bases.map((b) => Math.max(50, Math.round(b * scale)));
  const diff = totalMs - scaled.reduce((a, b) => a + b, 0);
  if (diff !== 0) scaled[scaled.length - 1] += diff;
  return scaled;
}

function computeMilestones(): { pct: number; delay: number }[] {
  // Total time between 15s and 20s
  const totalMs = randInt(15000, 20000);

  // Start at 0, then organic holds/jumps:
  // 0 -> ~15–23% (arrive quickly), HOLD ~3s, then 33%,
  // a couple hops to mid-50s, cruise to 80, then near-final holds, then 100.
  const p1 = randInt(15, 23);

  const percents = [
    0,     // show 0 explicitly
    p1,    // ramp up to ~20%
    p1,    // hold plateau (~3s total with step above)
    33,
    43,
    49,
    55,    // short stop
    68,
    74,
    80,
    86,
    92,
    100,
  ];

  // Base durations roughly sum to ~11.3s; we'll scale to 15–20s.
  const baseDurations = [
    250,   // show 0 briefly
    1000,  // to ~20%
    2000,  // HOLD at ~20%
    900,   // to 33%
    500,   // to 43%
    500,   // to 49%
    300,   // to 55% (short)
    1200,  // to 68%
    800,   // to 74%
    900,   // to 80%
    900,   // to 86%
    1400,  // to 92% (slightly longer)
    700,   // to 100%
  ];

  const scaled = scaleDurationsTo(totalMs, baseDurations);
  return percents.map((pct, i) => ({ pct, delay: scaled[i] }));
}

function stepIndexForPercent(p: number) {
  if (p < 25) return 0;      // Minting keys…
  if (p < 50) return 1;      // Verifying domain…
  if (p < 80) return 2;      // Preparing secure snippet…
  if (p < 100) return 3;     // Packaging email…
  return 4;                  // Done
}

// -------------------------------------------------------

export default function SendSnippet() {
  const [phase, setPhase] = React.useState<Phase>("enter-domain");
  const [domain, setDomain] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [progress, setProgress] = React.useState(0);
  const [animMs, setAnimMs] = React.useState(600); // matches each step for smoothness
  const [error, setError] = React.useState<string | null>(null);

  const heading =
    phase === "enter-email" || phase === "sending" || phase === "sent"
      ? "Your snippet is ready"
      : "Get your snippet";

  const showReadyNote =
    phase === "enter-email" || phase === "sending" || phase === "sent";

  async function startGeneration() {
    setError(null);
    const norm = normalizeDomain(domain);
    if (!norm) {
      setError("Enter a valid domain like example.com");
      return;
    }
    setDomain(norm);
    setPhase("generating");
    setActiveStep(0);
    setProgress(0);
    setAnimMs(600);

    const schedule = computeMilestones();
    try {
      for (const { pct, delay } of schedule) {
        setActiveStep(stepIndexForPercent(pct));
        setAnimMs(Math.max(250, delay - 100)); // smooth width movement matching each step
        setProgress(pct);
        const jitter = Math.max(0, delay + randInt(-100, 100)); // organic feel
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, jitter));
      }
      setPhase("enter-email");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setPhase("error");
    }
  }

  async function sendEmail() {
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    setPhase("sending");
    try {
      await trySendSnippet({ email: email.trim(), domain });
      setPhase("sent");
    } catch (e: any) {
      setError(e?.message || "Failed to send email");
      setPhase("enter-email");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 backdrop-blur p-6 md:p-8">
        <h1 className="text-2xl font-semibold">{heading}</h1>

        {/* Sub note shown only when ready to enter email */}
        {showReadyNote && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Please use your <span className="font-medium">company email</span> if possible
            (personal works too). This email is used for <span className="font-medium">alerts</span>,
            snippet delivery, and <span className="font-medium">account related infomation</span>—choose one you actively monitor.
          </p>
        )}

        {/* Phase 1: enter domain */}
        {phase === "enter-domain" && (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              Enter the domain you want to instrument.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-950 px-4 py-3 outline-none focus:ring-0 focus:border-black"
                placeholder="yourdomain.com or https://yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <button
                onClick={startGeneration}
                className="min-w-[160px] rounded-xl bg-black text-white font-medium px-4 py-3 hover:bg-neutral-900 transition"
              >
                Get snippet
              </button>
            </div>
            {error && (
              <div className="mt-4 rounded-xl border border-red-300/40 bg-red-50/70 px-4 py-3 text-red-900 dark:(bg-red-900/20 text-red-100 border-red-700)">
                {error}
              </div>
            )}
          </>
        )}

        {/* Phase 1.5: generating (randomized 15–20s, smooth animation) */}
        {phase === "generating" && (
          <div className="mt-6">
            {/* Percentage above the bar, right-aligned */}
            <div className="mb-1 flex justify-end text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {progress}%
            </div>
            <div className="relative h-2 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-2 bg-black"
                style={{
                  width: `${progress}%`,
                  transition: `width ${animMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
              />
            </div>
            <div className="mt-3 min-h-[24px] text-sm flex items-center gap-2">
              <span>{stepLabels[activeStep]}</span>
            </div>
          </div>
        )}

        {/* Phase 2: enter email */}
        {phase === "enter-email" && (
          <>
            {/* Full bar (black) as visual confirmation */}
            <div className="mt-5 h-2 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div className="h-2 bg-black w-full" />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-950 px-4 py-3 outline-none focus:ring-0 focus:border-black"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <button
                onClick={sendEmail}
                className="min-w-[180px] rounded-xl bg-black text-white font-medium px-4 py-3 hover:bg-neutral-900 transition"
              >
                Email me the snippet
              </button>
            </div>
            {error && (
              <div className="mt-4 rounded-xl border border-red-300/40 bg-red-50/70 px-4 py-3 text-red-900 dark:(bg-red-900/20 text-red-100 border-red-700)">
                {error}
              </div>
            )}
          </>
        )}

        {/* Sending */}
        {phase === "sending" && (
          <div className="mt-6 text-sm">Sending to {email}…</div>
        )}

        {/* Sent */}
        {phase === "sent" && (
          <div className="mt-6 rounded-2xl border border-neutral-300/40 bg-neutral-50/80 px-4 py-3 text-neutral-900 dark:(bg-neutral-800/40 text-neutral-100 border-neutral-700)">
            Success! Check your inbox for your snippet and instructions.
          </div>
        )}
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6 text-center">
        Persee is cookieless & privacy-first analytics.
      </p>
    </div>
  );
}
