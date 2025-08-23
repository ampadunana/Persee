"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [8, -8]);
  const rotateY = useTransform(x, [-150, 150], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx); y.set(dy);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 dark:dark-grid light-grid opacity-40" />
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl opacity-40"
           style={{background: "radial-gradient(circle, rgba(0,229,168,0.7), rgba(29,78,216,0.4) 60%, transparent 70%)"}}/>
      <div className="absolute -bottom-44 -right-44 h-[520px] w-[520px] rounded-full blur-3xl opacity-40"
           style={{background: "radial-gradient(circle, rgba(29,78,216,0.5), rgba(0,229,168,0.25) 60%, transparent 70%)"}}/>

      <div className="container pt-20 pb-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-500">
              New • Interactive dashboard & dark mode
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Don’t let good traffic vanish on broken pages.
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Guide visitors, avoid dead ends, and protect your revenue — all from an elegant, real-time dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/start" className="btn btn-primary rounded-xl">
                Start for free
              </Link>
              <Link href="/book-demo" className="btn btn-ghost rounded-xl">
                Book a demo
              </Link>
            </div>
            <p className="text-xs text-neutral-500">No credit card required. Light & Dark mode supported.</p>
          </div>

          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            style={{ rotateX, rotateY }}
            className="relative aspect-[4/3] rounded-2xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-4 brand-glow"
          >
            <Image
              src="/rev404_logo_transparent.png"
              alt=""
              width={260}
              height={260}
              className="absolute right-2 bottom-2 opacity-30 pointer-events-none"
            />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="absolute left-6 top-6 rounded-xl bg-white/70 dark:bg-neutral-900/70 p-4 shadow-lg border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">Today</p>
              <p className="font-semibold">Live issues detected: 3</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="absolute right-6 top-16 rounded-xl bg-white/70 dark:bg-neutral-900/70 p-4 shadow-lg border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">Visitors assisted</p>
              <p className="font-semibold">+94 this week</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="absolute left-10 bottom-10 rounded-xl bg-white/70 dark:bg-neutral-900/70 p-4 shadow-lg border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">Top referrer</p>
              <p className="font-semibold">/blog → /old-post</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
