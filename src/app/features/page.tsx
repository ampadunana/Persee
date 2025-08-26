import FeatureGrid from "@/components/feature-grid";

export const metadata = { title: "Features — Persee" };

export default function FeaturesPage() {
  return (
    <>
      <section className="container pt-16 pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Features</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-2xl">
          Tools that engage visitors and keep sessions on track. Designed for speed, clarity, and control.
        </p>
      </section>
      <FeatureGrid />
      <section className="container pb-16">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/70 dark:bg-neutral-900/70">
          <h2 className="text-xl font-semibold">What’s coming next</h2>
          <ul className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <li>• Pattern-based redirects</li>
            <li>• Deeper journey analytics</li>
            <li>• More email providers</li>
            <li>• Multi-site management</li>
          </ul>
        </div>
      </section>
    </>
  );
}
