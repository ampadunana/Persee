"use client";

import { useState } from "react";

export default function StartClient() {
  const [domain, setDomain] = useState("");
  const [aov, setAov] = useState("45");   // Avg order value ($)
  const [cr, setCr] = useState("2.0");    // Conversion rate (%)

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Saved site: ${domain}\nAOV: $${aov}\nCR: ${cr}%`);
  };

  return (
    <section className="container py-16">
      <h1 className="text-4xl font-bold tracking-tight">Start free</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-2xl">
        Add your site details. You can edit assumptions anytime.
      </p>

      <form onSubmit={submit} className="mt-8 max-w-xl space-y-4">
        <div>
          <label className="block text-sm mb-1">Website domain</label>
          <input
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Avg order value ($)</label>
            <input
              value={aov}
              onChange={(e) => setAov(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Conversion rate (%)</label>
            <input
              value={cr}
              onChange={(e) => setCr(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
            />
          </div>
        </div>
        <button className="btn btn-primary rounded-xl">Save & continue</button>
      </form>
    </section>
  );
}
