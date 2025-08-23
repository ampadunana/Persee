"use client";

import { motion } from "framer-motion";
import { ShieldCheck, LineChart, Route, Mail } from "lucide-react";

const features = [
  { icon: <LineChart className="h-5 w-5" />, title: "Real-time insights", desc: "See broken pages and where visitors drop." },
  { icon: <Route className="h-5 w-5" />, title: "Smart routing", desc: "Send lost visitors to the right destinations." },
  { icon: <Mail className="h-5 w-5" />, title: "Lead capture", desc: "Collect emails when a hit occurs." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Privacy-first", desc: "Respectful tracking with clear controls." },
];

export default function FeatureGrid() {
  return (
    <section className="container py-16">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Interact. Assist. Recover.</h2>
        <p className="text-neutral-600 dark:text-neutral-300">A modern toolkit to keep visitors moving — not bouncing.</p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg hover:-translate-y-1 transition bg-white/70 dark:bg-neutral-900/70"
          >
            <div className="inline-flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 p-3 mb-4 group-hover:scale-105 transition">
              {f.icon}
            </div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
