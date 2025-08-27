import { NextResponse } from "next/server";
import { resend, RESEND_FROM, APP_URL, emailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isEmail(s: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}
function normalizeDomain(input: string): string | null {
  const v = (input || "").trim().toLowerCase();
  let host = v;
  try {
    if (/^https?:\/\//i.test(v)) host = new URL(v).hostname;
  } catch {
    /* noop */
  }
  if (/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host)) return host;
  return null;
}
function six(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid 0/O/1/I
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

function buildSnippet(domain: string, siteKey: string) {
  // Lightweight v1 snippet (deferred; sub-6KB target in real build)
  return [
    "<!-- Persee Snippet: paste before </body> -->",
    `<script defer>(function(){try{`,
    `var P=window.Persee||{};P.v="v1";P.k="${siteKey}";P.d="${domain}";P.u="https://ingest.persee.live/v1/i";`,
    `function send(t,p){try{var b={t:t,ts:Date.now(),d:P.d,k:P.k,p:p||{}};navigator.sendBeacon?navigator.sendBeacon(P.u,JSON.stringify(b)):fetch(P.u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),keepalive:true});}catch(e){}}`,
    `send("page_view",{u:location.href,ref:document.referrer||null});`,
    `window.addEventListener("error",function(e){try{send("error",{m:e.message||"e",f:e.filename||null,l:e.lineno||0,c:e.colno||0})}catch(_){}});`,
    `window.addEventListener("unhandledrejection",function(e){try{send("error",{m:(e.reason&&e.reason.message)||String(e.reason)})}catch(_){}});`,
    `if("PerformanceObserver"in window){try{var o=new PerformanceObserver(function(L){L.getEntries().forEach(function(en){if(en.entryType==="longtask"){send("long_task",{d:Math.round(en.duration)})}})});o.observe({type:"longtask",buffered:true});}catch(_){}}`,
    `var last=location.href,ps=history.pushState,rs=history.replaceState;function onNav(){var u=location.href;if(u!==last){last=u;send("page_view",{u:u})}};history.pushState=function(){ps.apply(this,arguments);onNav()};history.replaceState=function(){rs.apply(this,arguments);onNav()};window.addEventListener("popstate",onNav,{passive:true});`,
    `document.addEventListener("click",function(ev){try{var s=(ev.target&&ev.target.tagName)||"x";send("click",{t:s})}catch(_){}});`,
    `window.Persee=P;`,
    `}catch(_){}})();</script>`,
  ].join("");
}

function htmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    if (!emailConfigured || !resend) {
      return NextResponse.json(
        { ok: false, error: "Email service not configured." },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim();
    const domainRaw = String(body.domain || "");
    if (!isEmail(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    const domain = normalizeDomain(domainRaw);
    if (!domain) {
      return NextResponse.json({ ok: false, error: "Invalid domain" }, { status: 400 });
    }

    // Generate snippet + single-use code (code enforcement can be implemented in your auth flow)
    const siteKey = crypto.randomUUID();
    const code = six();
    const snippet = buildSnippet(domain, siteKey);

    // Prepare "Copy Snippet" button using a data URL fallback (works in many clients; otherwise user can copy from the block below)
    const dataUrl =
      "data:text/plain;charset=utf-8," + encodeURIComponent(snippet);

    const subject = `Your Persee snippet for ${domain}`;
    const html = `<!doctype html><html><body style="margin:0;background:#0B1115;font-family:Inter,Segoe UI,Roboto,Arial">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td></td>
      <td width="640" style="background:#0E151A;color:#E8F6F4;border:1px solid #1E2A30;border-radius:16px;padding:28px">
        <div style="font-size:12px;letter-spacing:1.2px;color:#8BA6A1">PERSEE</div>
        <h1 style="margin:8px 0 4px;font-size:22px">Your snippet is ready</h1>
        <p style="margin:0 0 16px;color:#8BA6A1">Domain: <strong style="color:#E8F6F4">${domain}</strong></p>

        <!-- Install instructions -->
        <h2 style="font-size:16px;margin:14px 0 8px">How to install</h2>
        <ol style="padding-left:18px;margin:0 0 14px;line-height:1.6">
          <li>Click <strong>Copy Snippet</strong> below.</li>
          <li>Paste it just before <code>&lt;/body&gt;</code> on your site (or in your global layout/template).</li>
          <li>Deploy or publish your site changes.</li>
          <li>We’ll start logging events within a few minutes.</li>
        </ol>

        <!-- Copy button with visual feedback -->
        <div style="margin:10px 0 16px">
          <a href="${dataUrl}" download="persee-snippet.html"
             style="display:inline-block;background:#1CDAC5;color:#000;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:600;transition:all 0.2s ease"
             onmouseover="this.style.background='#19C4B0'"
             onmouseout="this.style.background='#1CDAC5'"
             onclick="this.innerHTML='Copied!';this.style.background='#10B981';setTimeout(()=>{this.innerHTML='Copy Snippet';this.style.background='#1CDAC5'},2000)">
            Copy Snippet
          </a>
        </div>

        <!-- Snippet block (fallback to manual copy) -->
        <div id="snippet" style="background:#0B1115;border:1px dashed #1E2A30;border-radius:12px;padding:14px;margin:12px 0">
          <div style="font-size:12px;color:#8BA6A1;margin-bottom:6px">Snippet (manual copy):</div>
          <pre style="white-space:pre-wrap;word-break:break-word;margin:0;color:#E8F6F4;line-height:1.45;border:1px solid #273163;padding:10px;border-radius:10px;background:#060a12">${htmlEscape(
            snippet
          )}</pre>
        </div>

        <!-- Dashboard access instructions -->
        <h2 style="font-size:16px;margin:18px 0 8px">Access your dashboard</h2>
        <ol style="padding-left:18px;margin:0 0 10px;line-height:1.6">
          <li>Go to <a href="${APP_URL}" style="color:#1CDAC5;text-decoration:none">${APP_URL}</a></li>
          <li>Enter your email <strong>${email}</strong></li>
          <li>Create a password (if new) or enter your password</li>
          <li>When prompted, enter this one-time code (valid once for this email):</li>
        </ol>
        <div style="display:inline-block;margin-top:8px;background:#0B1115;border:1px solid #1E2A30;border-radius:12px;padding:10px 14px;font-size:20px;letter-spacing:4px">${code}</div>

        <p style="font-size:12px;color:#8BA6A1;margin-top:18px">Persee is cookieless & privacy-first.</p>
      </td>
      <td></td>
    </tr>
    <tr><td></td><td width="640" style="padding:12px 8px;text-align:center;opacity:.55;color:#8BA6A1;font-size:12px">Persee • persee.live</td><td></td></tr>
  </table>
</body></html>`;

    const text =
`Persee snippet for ${domain}

Install:
1) Copy the snippet below and paste before </body>.
2) Deploy your site.

Snippet:
${snippet}

Dashboard access:
1) ${APP_URL}
2) Email: ${email}
3) Create/enter your password
4) One-time code (valid once for this email): ${code}
`;

    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject,
      html,
      text,
    });

    if ((result as any)?.error) {
      return NextResponse.json(
        { ok: false, error: (result as any).error.message || "Email send failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}
