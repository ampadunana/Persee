import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-100 dark:border-neutral-900 mt-24">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-2">
          <Logo />
          <p className="text-neutral-500">
            Stop losing visitors to broken pages. Keep sessions on track.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Product</h3>
          <ul className="space-y-2">
            <li><Link href="/features" className="hover:underline">Features</Link></li>
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link href="/start" className="hover:underline">Get Started</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:underline">About</Link></li>
            <li><Link href="/resources" className="hover:underline">Resources</Link></li>
            <li><Link href="/book-demo" className="hover:underline">Book Demo</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Terms</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-100 dark:border-neutral-900 py-6">
        <div className="container flex items-center justify-between text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
}
