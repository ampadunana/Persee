import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="h-7 w-7 relative brand-glow">
        <Image
          src="/rev404_logo_transparent.png"
          alt="Revenue404"
          fill
          sizes="28px"
          className="object-contain"
          priority
        />
      </div>
      <span className="font-semibold tracking-tight">Revenue404</span>
    </Link>
  );
}
