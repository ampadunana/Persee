import { NextRequest } from "next/server";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // dev/runtime hint

type BrokenLink = { url: string; from?: string; status: number };
type SlowPage = { url: string; ms: number; status: number };

function normalizeDomain(input: string) {
  let d = (input || "").trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  // strip paths if pasted
  const firstSlash = d.indexOf("/");
  if (firstSlash > -1) d = d.slice(0, firstSlash);
  return d;
}

async function tryFetch(url: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Persee-AuditBot/1.0 (+https://persee.live)" },
    });
    const ms = Date.now() - start;
    const text = await res.text(); // we may parse it
    return { ok: true, status: res.status, ms, text, headers: res.headers };
  } catch {
    const ms = Date.now() - start;
    return { ok: false, status: 0, ms, text: "", headers: new Headers() };
  } finally {
    clearTimeout(t);
  }
}

function absolutize(href: string, base: string) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function sameOrigin(u: string, origin: string) {
  try {
    const a = new URL(u);
    const b = new URL(origin);
    return a.origin === b.origin;
  } catch {
    return false;
  }
}

async function fetchSitemap(origin: string) {
  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
  ];
  for (const u of candidates) {
    const r = await tryFetch(u, 8000);
    if (r.ok && r.status >= 200 && r.status < 400 && r.text.includes("<loc>")) {
      const locs = Array.from(r.text.matchAll(/<loc>(.*?)<\/loc>/gi)).map((m) => m[1].trim());
      // keep only same-origin links
      const filtered = locs.filter((l) => sameOrigin(l, origin));
      if (filtered.length) return filtered.slice(0, 500);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { domain } = await req.json().catch(() => ({ domain: "" }));
  const host = normalizeDomain(domain);
  if (!host) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid domain" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Resolve base (prefer https)
  const bases = [`https://${host}`, `http://${host}`];
  let base: string | null = null;
  for (const b of bases) {
    const r = await tryFetch(b, 7000);
    if (r.ok && r.status >= 200 && r.status < 400) {
      base = b;
      break;
    }
  }
  if (!base) base = `https://${host}`; // fallback, some hosts block root GET

  // Collect targets
  const sitemapUrls = await fetchSitemap(base).catch(() => null);
  const maxPages = 120;
  const toVisit: string[] = [];
  const seen = new Set<string>();

  if (sitemapUrls && sitemapUrls.length) {
    for (const u of sitemapUrls) {
      if (sameOrigin(u, base) && !seen.has(u)) {
        seen.add(u);
        toVisit.push(u);
      }
      if (toVisit.length >= maxPages) break;
    }
  } else {
    toVisit.push(base);
  }

  const limit = pLimit(6);
  const visited: { url: string; status: number; ms: number; html?: string }[] = [];
  const broken: BrokenLink[] = [];
  const slow: SlowPage[] = [];

  const queue: string[] = [...toVisit];
  const enqueue = (u: string) => {
    if (seen.has(u)) return;
    if (!sameOrigin(u, base!)) return;
    seen.add(u);
    if (queue.length < maxPages) queue.push(u);
  };

  // Crawl
  while (queue.length && visited.length < maxPages) {
    const batch = queue.splice(0, 10);
    const results = await Promise.all(
      batch.map((u) =>
        limit(async () => {
          const r = await tryFetch(u, 10000);
          const contentType = r.headers.get("content-type") || "";
          const isHtml = contentType.includes("text/html") || u.endsWith(".html");
          if (r.ok) {
            visited.push({ url: u, status: r.status, ms: r.ms, html: isHtml ? r.text : undefined });
            if (r.ms > 2000) slow.push({ url: u, ms: r.ms, status: r.status });
          } else {
            visited.push({ url: u, status: 0, ms: r.ms });
            broken.push({ url: u, status: 0 });
          }
          // Parse links from HTML, check a few for breakage
          if (isHtml && r.text) {
            try {
              const $ = cheerio.load(r.text);
              const anchors = $("a[href]").slice(0, 40).toArray(); // cap per page
              const checkTargets: string[] = [];
              for (const a of anchors) {
                const href = $(a).attr("href") || "";
                const abs = absolutize(href, u);
                if (!abs) continue;
                if (sameOrigin(abs, base!) && !seen.has(abs)) enqueue(abs);
                // pick some same-origin links to check if broken
                if (sameOrigin(abs, base!) && checkTargets.length < 12) checkTargets.push(abs);
              }
              await Promise.all(
                checkTargets.map((t) =>
                  limit(async () => {
                    const rr = await tryFetch(t, 8000);
                    if (!(rr.ok && rr.status < 400)) {
                      broken.push({ url: t, from: u, status: rr.status || 0 });
                    }
                  })
                )
              );
            } catch {}
          }
        })
      )
    );
    if (!results) break;
  }

  const brokenUniqueMap = new Map<string, BrokenLink>();
  for (const b of broken) {
    if (!brokenUniqueMap.has(b.url)) brokenUniqueMap.set(b.url, b);
  }
  const brokenUnique = Array.from(brokenUniqueMap.values());
  const slowUniqueMap = new Map<string, SlowPage>();
  for (const s of slow) {
    const k = s.url;
    if (!slowUniqueMap.has(k) || slowUniqueMap.get(k)!.ms < s.ms) slowUniqueMap.set(k, s);
  }
  const slowUnique = Array.from(slowUniqueMap.values());

  // Quick, conservative estimate (editable on client)
  const DEFAULT_AOV = 45;
  const DEFAULT_CR = 0.02; // 2%
  const lostClicks = Math.round(brokenUnique.length * 30 + slowUnique.length * 10);
  const estimatedLoss = +(lostClicks * DEFAULT_CR * DEFAULT_AOV).toFixed(2);

  const payload = {
    ok: true,
    domain: host,
    baseUrl: base,
    scannedPages: visited.length,
    brokenCount: brokenUnique.length,
    slowCount: slowUnique.length,
    samples: {
      broken: brokenUnique.slice(0, 8),
      slow: slowUnique
        .sort((a, b) => b.ms - a.ms)
        .slice(0, 8),
    },
    estimate: {
      lostClicks,
      estimatedLoss,
      assumptions: { aov: DEFAULT_AOV, cr: DEFAULT_CR },
    },
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
