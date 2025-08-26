export const metadata = { title: "About — Persee" };

export default function AboutPage() {
  return (
    <section className="container py-16 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl">
        We build simple, elegant tools that keep users moving — not bouncing. Our focus is speed,
        transparency, and outcomes that actually matter.
      </p>
    </section>
  );
}
