// src/app/api/audit/stream/route.ts
import * as cheerio from "cheerio";
import pLimit from "p-limit";

export const dynamic = "force-dynamic";

type BrokenLink = { url: string; from?: string; status: number };
type SlowPage = { url: string; ms: number; status: number };

function enc(o: any) {
  return new TextEncoder().encode(`data: ${JSON.stringify(o)}\n\n`);
}
function normalizeDomain(input: string) {
  let d = (input || "").trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const firstSlash = d.indexOf("/");
  if (firstSlash > -1) d = d.slice(0, firstSlash);
  return d;
}
function isLikelyDomain(d: string) {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d);
}
function absolutize(href: string, base: string) {
  try { return new URL(href, base).href; } catch { return null; }
}
function sameOrigin(u: string, origin: string) {
  try { return new URL(u).origin === new URL(origin).origin; } catch { return false; }
}
async function tryFetch(url: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Persee-AuditBot/1.0 (+https://persee.com)" },
    });
    const ms = Date.now() - start;
    const text = await res.text();
    return { ok: true, status: res.status, ms, text, headers: res.headers };
  } catch {
    const ms = Date.now() - start;
    return { ok: false, status: 0, ms, text: "", headers: new Headers() };
  } finally { clearTimeout(t); }
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
      const filtered = locs.filter((l) => sameOrigin(l, origin));
      if (filtered.length) return filtered.slice(0, 500);
    }
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("domain") || "";
  const host = normalizeDomain(raw);

  const stream = new ReadableStream({
    async start(controller) {
      const push = (o: any) => controller.enqueue(enc(o));

      // Validate domain format early
      if (!host || !isLikelyDomain(host)) {
        push({ kind: "error", message: "Invalid domain. Enter a valid hostname (e.g., example.com).", progress: 100 });
        controller.close(); return;
      }

      // Stage 1: resolve / reachability
      push({ kind: "stage", stage: "Resolving domain…", progress: 5 });
      const bases = [`https://${host}`, `http://${host}`];
      let base: string | null = null;
      for (const b of bases) {
        push({ kind: "log", message: `Checking ${b}` });
        const r = await tryFetch(b, 7000);
        if (r.ok && r.status >= 200 && r.status < 400) { base = b; break; }
      }
      if (!base) {
        push({ kind: "error", message: "Site can’t be reached or is offline. Please ensure it’s up and try again.", progress: 100 });
        controller.close(); return;
      }
      push({ kind: "stage", stage: `Found site at ${base}`, progress: 10 });

      // Stage 2: sitemap / robots
      push({ kind: "stage", stage: "Looking for sitemap…", progress: 15 });
      const sitemapUrls = await fetchSitemap(base).catch(() => null);
      if (sitemapUrls?.length) {
        push({ kind: "log", message: `Sitemap found with ${sitemapUrls.length} URLs` });
      } else {
        push({ kind: "log", message: "No sitemap found. Falling back to crawl from homepage." });
      }

      // Build initial queue
      const maxPages = 120;
      const queue: string[] = [];
      const seen = new Set<string>();
      const visited: { url: string; status: number; ms: number; html?: string }[] = [];
      const broken: BrokenLink[] = [];
      const slow: SlowPage[] = [];

      // seed
      const seed = sitemapUrls?.length ? sitemapUrls : [base];
      for (const u of seed) {
        if (sameOrigin(u, base) && !seen.has(u)) { seen.add(u); queue.push(u); }
        if (queue.length >= maxPages) break;
      }

      const totalPlanned = Math.min(queue.length || 1, maxPages);
      push({ kind: "stage", stage: `Crawling up to ${totalPlanned} pages…`, progress: 20 });

      const limit = pLimit(6);
      const enqueue = (u: string) => {
        if (seen.has(u)) return;
        if (!sameOrigin(u, base!)) return;
        seen.add(u);
        if (queue.length + visited.length < maxPages) queue.push(u);
      };

      // Stage 3: crawl loop with live updates
      while (queue.length && visited.length < maxPages) {
        const url = queue.shift()!;
        push({ kind: "page", url });
        const r = await tryFetch(url, 10000);
        const contentType = r.headers.get("content-type") || "";
        const isHtml = contentType.includes("text/html") || url.endsWith(".html");
        if (r.ok) {
          visited.push({ url, status: r.status, ms: r.ms, html: isHtml ? r.text : undefined });
          if (r.ms > 2000) slow.push({ url, ms: r.ms, status: r.status });
        } else {
          visited.push({ url, status: 0, ms: r.ms });
          broken.push({ url, status: 0 });
        }

        // Parse links and check a subset
        if (isHtml && r.text) {
          try {
            const $ = cheerio.load(r.text);
            const anchors = $("a[href]").slice(0, 40).toArray();
            const checkTargets: string[] = [];
            for (const a of anchors) {
              const href = $(a).attr("href") || "";
              const abs = absolutize(href, url);
              if (!abs) continue;
              if (sameOrigin(abs, base!)) enqueue(abs);
              if (sameOrigin(abs, base!) && checkTargets.length < 12) checkTargets.push(abs);
            }
            await Promise.all(
              checkTargets.map((t) =>
                limit(async () => {
                  const rr = await tryFetch(t, 8000);
                  if (!(rr.ok && rr.status < 400)) broken.push({ url: t, from: url, status: rr.status || 0 });
                })
              )
            );
          } catch {}
        }

        // Progress based on actual work
        const scanned = visited.length;
        const total = Math.max(totalPlanned, scanned + queue.length);
        const scannedPart = total === 0 ? 0 : scanned / total;
        const progress = Math.min(20 + Math.floor(scannedPart * 80), 99);
        push({ kind: "progress", progress, scanned, discovered: total });

        // Periodic heartbeat log
        if (scanned % 5 === 0) {
          push({ kind: "log", message: `Scanned ${scanned}/${total} pages…` });
        }
      }

      // Deduplicate results
      const brokenUnique = Array.from(
        new Map(broken.map((b) => [b.url, b])).values()
      );
      const slowUnique = Array.from(
        new Map(slow.map((s) => [s.url, s])).values()
      );

      // Estimate (conservative defaults; tweak on client)
      const DEFAULT_AOV = 45;
      const DEFAULT_CR = 0.02;
      const lostClicks = Math.round(brokenUnique.length * 30 + slowUnique.length * 10);
      const estimatedLoss = +(lostClicks * DEFAULT_CR * DEFAULT_AOV).toFixed(2);

      push({
        kind: "result",
        result: {
          ok: true,
          domain: host,
          baseUrl: base,
          scannedPages: visited.length,
          brokenCount: brokenUnique.length,
          slowCount: slowUnique.length,
          samples: {
            broken: brokenUnique.slice(0, 12),
            slow: slowUnique.sort((a, b) => b.ms - a.ms).slice(0, 12),
          },
          estimate: {
            lostClicks,
            estimatedLoss,
            assumptions: { aov: DEFAULT_AOV, cr: DEFAULT_CR },
          },
        },
        progress: 100,
      });

      push({ kind: "done" });
      controller.close();
    },
    cancel() {
      // client disconnected; nothing else to do—stream stops automatically
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // for some proxies
    },
  });
}
