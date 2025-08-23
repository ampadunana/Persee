"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import Logo from "./logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="glass shadow-glass">
        <nav className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60",
                  pathname === l.href
                    ? "font-semibold bg-neutral-100/60 dark:bg-neutral-900/60"
                    : "text-neutral-600 dark:text-neutral-300"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">
              Log in
            </Link>
            <Link href="/start" className="btn btn-primary">
              Start free
            </Link>
            <Link href="/book-demo" className="btn btn-ghost hidden sm:inline-flex">
              Book a demo
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
