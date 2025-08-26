"use client";

import { useMemo, useState } from "react";

function randomCode(len = 5) {
  const chars = "ABCDEFGHJKMNPQRSTUWXYZ23456789"; // no confusing O/0/I/1
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function SnippetClient() {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [verify, setVerify] = useState<string | null>(null);

  const pubKey = useMemo(() => {
    // mock PUB key for now; will come from backend later
    return "PUB_" + randomCode(8);
  }, []);

  const snippet = verify
    ? `<script defer src="https://cdn.persee.live/v1.js" data-site="${domain}" data-key="${pubKey}" data-verify="${verify}"></script>`
    : "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    setVerify(randomCode(5));
    setTimeout(() => {
      // copy to clipboard once generated
      if (snippet) navigator.clipboard?.writeText(snippet);
    }, 0);
  };

  const mailto = () => {
    if (!verify) return;
    const subject = encodeURIComponent("Your Persee snippet");
    const body = encodeURIComponent(
`Hi,

Here is your Persee snippet for ${domain}:

${snippet}

Keep your verification code handy: ${verify}
Use it on the Dashboard login with your password.

— Persee`
    );
    window.location.href = `mailto:${email || ""}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="container py-16 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Get your snippet</h1>
      <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl">
        Paste this 1-line script site-wide. It includes a short verification code used for Dashboard login.
      </p>

      <form onSubmit={submit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm mb-1">Website domain</label>
          <input
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email (to send snippet)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
          />
        </div>
        <button className="btn btn-primary rounded-xl">Generate snippet</button>
      </form>

      {verify && (
        <div className="mt-6 max-w-3xl rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/70 dark:bg-neutral-900/70">
          <p className="text-sm text-neutral-500 mb-2">Copy & paste site-wide:</p>
          <pre className="text-xs overflow-auto p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
{snippet}
          </pre>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              className="btn btn-ghost rounded-xl"
              onClick={() => navigator.clipboard?.writeText(snippet)}
            >
              Copy to clipboard
            </button>
            <button className="btn btn-ghost rounded-xl" onClick={mailto}>
              Send via email
            </button>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Verification code: <span className="font-semibold">{verify}</span> — you’ll use this with your password to access the Dashboard.
          </p>
        </div>
      )}
    </section>
  );
}
