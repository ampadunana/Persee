"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Broken = { url: string; from?: string; status: number };
type Slow = { url: string; ms: number; status: number };
type AuditResult = {
  ok: boolean;
  domain: string;
  baseUrl: string;
  scannedPages: number;
  brokenCount: number;
  slowCount: number;
  samples: { broken: Broken[]; slow: Slow[] };
  estimate: { lostClicks: number; estimatedLoss: number; assumptions: { aov: number; cr: number } };
};

export default function StartClient() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Waiting to start…");
  const [res, setRes] = useState<AuditResult | null>(null);
  const [aov, setAov] = useState<number | null>(null);
  const [cr, setCr] = useState<number | null>(null);
  const [showConv, setShowConv] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const esRef = useRef<EventSource | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const effectiveAov = aov ?? res?.estimate.assumptions.aov ?? 45;
  const effectiveCr = cr ?? res?.estimate.assumptions.cr ?? 0.02;
  const recomputedLoss = useMemo(() => {
    if (!res) return 0;
    return +(res.estimate.lostClicks * effectiveCr * effectiveAov).toFixed(2);
  }, [res, effectiveAov, effectiveCr]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const cancelAudit = () => {
    esRef.current?.close();
    esRef.current = null;
    setLoading(false);
    setStage("Audit canceled.");
    setProgress(0);
    setCurrentUrl("");
  };

  const runAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setRes(null);
    setLog([]);
    setCurrentUrl("");
    setShowConv(false);
    setStage("Resolving domain…");
    setProgress(0);
    setLoading(true);

    const url = `/api/audit/stream?domain=${encodeURIComponent(domain)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (typeof msg.progress === "number") setProgress(msg.progress);

        switch (msg.kind) {
          case "stage":
            setStage(msg.stage || "");
            break;
          case "page":
            setCurrentUrl(msg.url || "");
            setLog((l) => [...l, `Scanning: ${msg.url}`].slice(-300));
            break;
          case "log":
            if (msg.message) setLog((l) => [...l, msg.message].slice(-300));
            break;
          case "result":
            setRes(msg.result);
            setStage("Done");
            break;
          case "error":
            setStage(msg.message || "Site unavailable.");
            break;
          case "done":
            es.close();
            esRef.current = null;
            setLoading(false);
            break;
        }
      } catch {}
    };

    es.onerror = () => {
      setStage("Connection lost. Please try again.");
      setLoading(false);
      es.close();
      esRef.current = null;
    };
  };

  return (
    <section id="audit" className="container py-16">
      <h1 className="text-4xl font-bold tracking-tight">Run a free audit</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-2xl">
        Enter your domain. We’ll scan key pages for broken links and slow responses, then estimate impact.
      </p>

      <form onSubmit={runAudit} className="mt-8 max-w-xl space-y-4">
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
        <div className="flex gap-3">
          <button className="btn btn-primary rounded-xl" disabled={loading}>
            {loading ? "Auditing…" : "Start audit"}
          </button>
          {loading && (
            <button type="button" className="btn btn-ghost rounded-xl" onClick={cancelAudit}>
              Cancel audit
            </button>
          )}
        </div>
      </form>

      {/* Progress + status */}
      {(loading || progress > 0 || stage !== "Waiting to start…") && (
        <div className="mt-8 max-w-2xl">
          <div className="mb-1 text-sm text-neutral-500">{stage}</div>
          {currentUrl && (
            <div className="mb-2 text-xs text-neutral-500 truncate">
              Current: <span className="font-mono">{currentUrl}</span>
            </div>
          )}
          <div className="w-full h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-neutral-900 dark:bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-neutral-500">{progress}%</div>

          {/* Live log */}
          <div
            ref={logRef}
            className="mt-4 h-40 overflow-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/50 dark:bg-neutral-900/50"
          >
            {log.length === 0 ? (
              <div className="text-xs text-neutral-500">Preparing…</div>
            ) : (
              <ul className="space-y-1 text-xs font-mono">
                {log.map((line, idx) => (
                  <li key={idx} className="truncate">{line}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {res && (
        <div className="mt-12 space-y-8">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/70 dark:bg-neutral-900/70">
              <div className="text-xs text-neutral-500">Pages scanned</div>
              <div className="text-2xl font-bold">{res.scannedPages}</div>
            </div>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/70 dark:bg-neutral-900/70">
              <div className="text-xs text-neutral-500">Broken links detected</div>
              <div className="text-2xl font-bold">{res.brokenCount}</div>
            </div>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/70 dark:bg-neutral-900/70">
              <div className="text-xs text-neutral-500">Slow pages (&gt;2s)</div>
              <div className="text-2xl font-bold">{res.slowCount}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/70 dark:bg-neutral-900/70 brand-glow">
            <div className="flex flex-wrap items-baseline gap-3">
              <div className="text-sm text-neutral-500">Estimated at-risk revenue</div>
              <div className="text-3xl font-extrabold">${recomputedLoss.toLocaleString()}</div>
              <button
                className="btn btn-ghost rounded-xl text-sm"
                onClick={() => setShowConv((s) => !s)}
              >
                {showConv ? "Hide conversions" : "Adjust conversions"}
              </button>
            </div>

            {showConv && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1">Average order value ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={effectiveAov}
                    onChange={(e) => setAov(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Conversion rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={(effectiveCr * 100).toFixed(1)}
                    onChange={(e) => setCr((parseFloat(e.target.value) || 0) / 100)}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-700"
                  />
                </div>
                <p className="sm:col-span-2 text-xs text-neutral-500">
                  This is a quick estimate based on detected issues. You can refine it anytime.
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/70 dark:bg-neutral-900/70">
              <h3 className="font-semibold mb-3">Broken link examples</h3>
              {res.samples.broken.length === 0 ? (
                <p className="text-sm text-neutral-500">No broken links found in the sample.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {res.samples.broken.map((b, i) => (
                    <li key={i} className="truncate">
                      <span className="font-medium">{b.status || "ERR"}</span>{" "}
                      <a className="underline break-all" href={b.url} target="_blank" rel="noreferrer">
                        {b.url}
                      </a>
                      {b.from && (
                        <>
                          <span className="text-neutral-500"> ← from </span>
                          <a className="underline break-all" href={b.from} target="_blank" rel="noreferrer">
                            {b.from}
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/70 dark:bg-neutral-900/70">
              <h3 className="font-semibold mb-3">Slow pages (&gt;2s)</h3>
              {res.samples.slow.length === 0 ? (
                <p className="text-sm text-neutral-500">No slow pages detected in the sample.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {res.samples.slow.map((s, i) => (
                    <li key={i} className="truncate">
                      <span className="font-medium">{s.ms}ms</span>{" "}
                      <a className="underline break-all" href={s.url} target="_blank" rel="noreferrer">
                        {s.url}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
