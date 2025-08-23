export const metadata = { title: "Resources — Revenue404" };

export default function ResourcesPage() {
  return (
    <section className="container py-16 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Resources</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <article className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/70 dark:bg-neutral-900/70">
          <h3 className="font-semibold">Guides</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
            Best practices for keeping visitors on the path and avoiding exit points.
          </p>
        </article>
        <article className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/70 dark:bg-neutral-900/70">
          <h3 className="font-semibold">Changelog</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
            Track product updates, improvements, and new capabilities.
          </p>
        </article>
      </div>
    </section>
  );
}
