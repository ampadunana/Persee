"use client";

import { useState } from "react";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [verify, setVerify] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder login. Backend wiring will validate email + verify + password.
    alert(`Login submitted:\nEmail: ${email}\nCode: ${verify}\nPassword: ******`);
  };

  return (
    <section className="container py-16">
      <h1 className="text-4xl font-bold tracking-tight">Dashboard login</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-2xl">
        Use the email you requested a snippet with, your 5-character verification code, and your password.
      </p>

      <form onSubmit={submit} className="mt-8 max-w-md space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Verification code</label>
          <input
            required
            value={verify}
            onChange={(e) => setVerify(e.target.value.toUpperCase())}
            placeholder="e.g., 7KX2M"
            maxLength={5}
            className="w-full uppercase tracking-widest rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
          />
        </div>
        <button className="btn btn-primary rounded-xl">Sign in</button>
      </form>
    </section>
  );
}
