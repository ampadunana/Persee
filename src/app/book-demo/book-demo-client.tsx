"use client";

import { useState } from "react";

export default function BookDemoClient() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thanks! We’ll reach out at ${email}.`);
  };

  return (
    <section className="container py-16">
      <h1 className="text-4xl font-bold tracking-tight">Book a demo</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">
        See how Persee keeps visitors on track.
      </p>

      <form onSubmit={submit} className="mt-8 max-w-md space-y-4">
        <div>
          <label className="block text-sm mb-1">Work email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
          />
        </div>
        <button className="btn btn-primary rounded-xl">Request demo</button>
      </form>
    </section>
  );
}
