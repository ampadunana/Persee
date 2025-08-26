"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Pricing() {
  return (
    <section className="container py-16">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple pricing</h2>
        <p className="text-neutral-600 dark:text-neutral-300">One plan with everything you need.</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 bg-white/70 dark:bg-neutral-900/70 brand-glow"
      >
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-extrabold">$23</span>
          <span className="text-neutral-500">/ month</span>
        </div>
        <ul className="mt-6 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
          <li>✔ Real-time issue tracking</li>
          <li>✔ Custom routing rules</li>
          <li>✔ Lead capture & export</li>
          <li>✔ Weekly summary email</li>
          <li>✔ Light & dark mode dashboard</li>
        </ul>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/start" className="btn btn-primary rounded-xl px-6">Start free</Link>
        </div>
      </motion.div>
    </section>
  );
}
