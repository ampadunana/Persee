"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Brief overlay fade when switching themes.
 * Shows for ~180ms and then disappears.
 */
export default function ThemeFade() {
  const { resolvedTheme } = useTheme();
  const prev = useRef<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (prev.current && prev.current !== resolvedTheme) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 180);
      return () => clearTimeout(t);
    }
    prev.current = resolvedTheme ?? null;
  }, [resolvedTheme]);

  useEffect(() => {
    prev.current = resolvedTheme ?? null;
  }, [resolvedTheme]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] pointer-events-none bg-black dark:bg-white"
        />
      )}
    </AnimatePresence>
  );
}
