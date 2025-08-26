import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 relative brand-glow">
        <Image
          src="/PerseeLogo.png"
          alt="Persee"
          fill
          sizes="32px"
          className="object-contain"
          priority
        />
      </div>
      <span className="font-semibold tracking-tight">Persee</span>
    </Link>
  );
}
