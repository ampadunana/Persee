"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // UI-only placeholder submit for now
    alert(
      `Login submitted\nEmail: ${email}\nCode: ${code}\nPassword length: ${password.length}`
    );
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <section className="w-full max-w-xl">
        <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
          <div className="p-8 md:p-10">
            <h1 className="text-3xl font-semibold tracking-tight">
              Dashboard login
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Use the email you requested a snippet with, your{" "}
              <span className="font-medium">6-character</span> verification
              code, and your password.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-200"
                />
              </div>

              {/* Verification code */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="code"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Verification code
                  </label>
                  <span className="text-xs text-neutral-500">
                    From your snippet email
                  </span>
                </div>
                <input
                  id="code"
                  inputMode="text"
                  pattern="[A-Za-z0-9]{6}"
                  title="6 letters or numbers"
                  required
                  placeholder="e.g. F3R6Z7"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full tracking-widest uppercase rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-200"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-sm underline underline-offset-4 hover:opacity-80"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-200"
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-xl px-4 py-3 font-medium bg-black text-white hover:opacity-90"
              >
                Sign in
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 text-neutral-500">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span className="text-xs">or</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>

              {/* Secondary actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href="#"
                  className="text-sm underline underline-offset-4 hover:opacity-80"
                >
                  Continue with email link
                </Link>
                <Link
                  href="#"
                  className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white text-black px-4 py-2 text-sm hover:opacity-90"
                >
                  New to the dashboard? Create an account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
