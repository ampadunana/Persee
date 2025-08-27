// src/app/api/snippet/generate/route.ts
import { NextResponse } from "next/server";
import { domainSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain } = domainSchema.parse(body);

    const siteKey = crypto.randomUUID();
    const code = makeCode();

    const snippet = [
      "<!-- Persee Snippet: paste before </body> -->",
      `<!-- persee:domain=${domain} -->`,
      `<!-- persee:siteKey=${siteKey} -->`,
      `<!-- persee:code=${code} -->`,
      "<script>",
      "(function(){",
      "  var P=window.Persee||{};P.v='1.0.0';",
      `  P.siteKey='${siteKey}';`,
      `  P.domain='${domain}';`,
      "  P.endpoint='https://ingest.persee.live/v1/i';",
      "  P.cfg={dnt:true,batch:1e3,debounce:1200,max:2048};",
      "  function h(s){try{return btoa(unescape(encodeURIComponent(s))).slice(0,24)}catch(e){return 'x'}}",
      "  function selHash(el){try{if(!el||!el.tagName)return 'x';",
      "    var p=el.tagName.toLowerCase();",
      "    if(el.id){p+='#'+h(el.id)}",
      "    if(el.className){p+='.'+h((''+el.className).replace(/\\s+/g,'.'))}",
      "    return p",
      "  }catch(e){return 'x'}}",
      "  function send(t,p){try{",
      "    if(navigator.doNotTrack==='1' && P.cfg.dnt) return;",
      "    var b={t:t,ts:Date.now(),d:P.domain,k:P.siteKey,p:p||{}};",
      "    (P._q=P._q||[]).push(b);",
      "    clearTimeout(P._fl);",
      "    P._fl=setTimeout(flush,P.cfg.debounce);",
      "  }catch(e){}}",
      "  function flush(){try{",
      "    if(!(P._q&&P._q.length))return;",
      "    var q=P._q.splice(0,P.cfg.max);",
      "    var xhr=new XMLHttpRequest();",
      "    xhr.open('POST',P.endpoint,true);",
      "    xhr.setRequestHeader('Content-Type','application/json');",
      "    xhr.send(JSON.stringify({k:P.siteKey,d:P.domain,v:P.v,ev:q}));",
      "  }catch(e){}}",
      "  // Page + route changes",
      "  var last=location.href; send('page_view',{u:last,ref:document.referrer||null});",
      "  var pi=history.pushState, ri=history.replaceState;",
      "  function onNav(){var u=location.href;if(u!==last){last=u;send('page_view',{u:u})}}",
      "  history.pushState=function(){pi.apply(this,arguments);onNav()};",
      "  history.replaceState=function(){ri.apply(this,arguments);onNav()};",
      "  window.addEventListener('popstate',onNav,{passive:true});",
      "  // Vitals (minimal longtask as a proxy; room to extend INP/LCP/CLS summaries)",
      "  try{ if('PerformanceObserver' in window){",
      "    var obs=new PerformanceObserver(function(list){",
      "      list.getEntries().forEach(function(e){",
      "        if(e.entryType==='longtask'){send('long_task',{d:Math.round(e.duration)})}",
      "      });",
      "    });",
      "    // @ts-ignore",
      "    obs.observe({type:'longtask',buffered:true});",
      "  }}catch(e){}",
      "  // Clicks (hashed selector) + quick-click hint (rage heuristic)",
      "  var lastC=0; document.addEventListener('click',function(ev){",
      "    var el=ev.target; var s=selHash(el);",
      "    var now=Date.now(); var fast=(now-lastC)<350; lastC=now;",
      "    send('click',{s:s,fast:fast?1:0});",
      "  }, {passive:true});",
      "  // Errors",
      "  window.addEventListener('error',function(e){",
      "    try{send('error',{m:(e.message||'e'),s:e.filename||null,l:e.lineno||0,c:e.colno||0})}catch(x){}",
      "  });",
      "  window.addEventListener('unhandledrejection',function(e){",
      "    try{send('error',{m:(e.reason&&e.reason.message)||'promise'})}catch(x){}",
      "  });",
      "  // Flush before unload",
      "  ['pagehide','visibilitychange','beforeunload'].forEach(function(n){",
      "    window.addEventListener(n,function(){try{flush()}catch(e){}},{passive:true});",
      "  });",
      "  window.Persee=P;",
      "})();",
      "</script>",
    ].join("");

    return NextResponse.json({ ok: true, siteKey, code, snippet });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Invalid request" }, { status: 400 });
  }
}
