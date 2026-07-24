"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

type Chapter = {
  label: string;
  start: number;
  seek: number;
  headline: string;
  body: string;
};

const chapters: Chapter[] = [
  {label:"Who", start:0, seek:2.2, headline:"Two sides want to talk", body:"A client and a server need to know who is on the other end before they exchange real data."},
  {label:"TLS", start:2.4, seek:5.0, headline:"TLS checks the server", body:"The server presents a certificate. The client verifies it. In regular TLS, the client usually stays anonymous."},
  {label:"mTLS", start:5.2, seek:8.0, headline:"mTLS checks both sides", body:"Both present certificates. Each verifies the other before any application data flows."},
  {label:"CA", start:8.2, seek:10.8, headline:"A trusted CA signs certificates", body:"Both sides trust certificates signed by the same Certificate Authority — no crypto math required to get the idea."},
  {label:"Secure", start:11.0, seek:13.8, headline:"Encrypted channel opens", body:"After both validations succeed: identity verified, traffic encrypted, data integrity protected. Authorization is a separate decision."},
  {label:"Reject", start:14.0, seek:16.4, headline:"Bad certificate → no data", body:"Invalid, expired, missing, or untrusted cert fails validation. The connection stops before application data is sent."},
  {label:"Mesh", start:16.6, seek:19.0, headline:"Same idea between services", body:"Service A ↔ Service B use mTLS inside the mesh. Platforms like Istio can issue, distribute, and rotate workload certificates automatically."},
];

const lastChapter = chapters.length - 1;

function Cert({ x, y, width, label, root = false, className = "" }: { x: number; y: number; width: number; label: string; root?: boolean; className?: string }) {
  return <g className={`trust-node ${root ? "root-ca" : ""} ${className}`.trim()}>
    <rect x={x} y={y} width={width} height="62" rx="16" className="cert-box" />
    <path d={`M ${x+27} ${y+17} L ${x+42} ${y+11} L ${x+57} ${y+17} V ${y+34} C ${x+57} ${y+45}, ${x+48} ${y+51}, ${x+42} ${y+55} C ${x+36} ${y+51}, ${x+27} ${y+45}, ${x+27} ${y+34} Z`} className="shield" />
    <text x={x+75} y={y+40} className="cert-label">{label}</text>
  </g>;
}

function Endpoint({ x, y, title, altTitle, subtitle, altSubtitle, className }: {
  x: number; y: number; title: string; altTitle: string; subtitle: string; altSubtitle: string; className: string;
}) {
  return <g className={`mtls-endpoint ${className}`}>
    <rect x={x} y={y} width="280" height="120" rx="18" className="node-box" filter="url(#shadow)" />
    <rect x={x+22} y={y+32} width="36" height="36" rx="8" className="app-icon" />
    <text x={x+72} y={y+48} className="node-title mtls-name-primary">{title}</text>
    <text x={x+72} y={y+48} className="node-title mtls-name-alt">{altTitle}</text>
    <text x={x+72} y={y+82} className="node-sub mtls-sub-primary">{subtitle}</text>
    <text x={x+72} y={y+82} className="node-sub mtls-sub-alt">{altSubtitle}</text>
  </g>;
}

/** Verify callout in the same column/band as certificates under an endpoint. */
function VerifyUnder({ x, y, className, label }: { x: number; y: number; className: string; label: string }) {
  return <g className={`mtls-validate ${className}`}>
    <rect x={x} y={y} width="280" height="62" rx="16" className="mtls-verify-box" filter="url(#shadow)"/>
    <circle cx={x+28} cy={y+31} r="14" fill="#fff0f0" stroke="#ee0000" strokeWidth="3"/>
    <path d={`M${x+21} ${y+31} L${x+26} ${y+37} L${x+37} ${y+23}`} fill="none" stroke="#ee0000" strokeWidth="3" strokeLinecap="round"/>
    <text x={x+52} y={y+37} className="mtls-verify-label">{label}</text>
  </g>;
}

export default function MtlsPrimerPage() {
  const root = useRef<HTMLDivElement>(null);
  const experience = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const chapterTween = useRef<gsap.core.Tween | null>(null);
  const scrubbing = useRef(false);
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);
  const [active,setActive]=useState(0);
  const [reduced,setReduced]=useState(false);
  const [speed,setSpeed]=useState(1);
  const [fullscreen,setFullscreen]=useState(false);

  useLayoutEffect(()=>{
    if(!root.current) return;
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    const ctx=gsap.context(()=>{
      if(reduce){
        gsap.set(".mtls-title,.mtls-endpoint,.mtls-client-cert,.mtls-server-cert,.mtls-check-client,.mtls-check-server,.mtls-ca,.mtls-tunnel,.mtls-result,.mtls-close,.mtls-mesh-frame,.mtls-link-secure",{autoAlpha:1,y:0,scale:1});
        gsap.set(".mtls-link",{strokeDasharray:1,strokeDashoffset:0});
        gsap.set(".mtls-name-primary,.mtls-sub-primary,.mtls-question,.mtls-tls-note,.mtls-packet,.mtls-reject,.mtls-bad-cert",{autoAlpha:0});
        gsap.set(".mtls-name-alt,.mtls-sub-alt",{autoAlpha:1});
        setProgress(100); setActive(lastChapter); return;
      }

      gsap.set(".mtls-title",{autoAlpha:0,y:-12});
      gsap.set(".mtls-endpoint,.mtls-question,.mtls-cert,.mtls-ca,.mtls-tunnel,.mtls-result,.mtls-reject,.mtls-mesh-frame,.mtls-close,.mtls-authz-note,.mtls-packet,.mtls-tls-note,.mtls-mtls-note,.mtls-ca-note,.mtls-reject-note,.mtls-mesh-note,.mtls-validate",{autoAlpha:0,y:10});
      gsap.set(".mtls-link",{strokeDasharray:1,strokeDashoffset:1,autoAlpha:0});
      gsap.set(".mtls-validate",{autoAlpha:0,scale:.96,transformOrigin:"50% 50%"});
      gsap.set(".mtls-name-alt,.mtls-sub-alt",{autoAlpha:0});

      const tl=gsap.timeline({paused:true,defaults:{ease:"power2.out"},onUpdate:()=>{
        const t=tl.time(); let idx=0;
        chapters.forEach((c,i)=>{if(t>=c.start) idx=i;});
        setActive(a=>a===idx?a:idx);
        if(scrubbing.current) return;
        const p=Number((tl.progress()*100).toFixed(1));
        setProgress(prev=>prev===p?prev:p);
      },onComplete:()=>setPlaying(false)});

      // Who
      tl.to(".mtls-title",{autoAlpha:1,y:0,duration:.4})
        .to(".mtls-client,.mtls-server",{autoAlpha:1,y:0,duration:.45,stagger:.1},.15)
        .to(".mtls-link-plain",{autoAlpha:1,strokeDashoffset:0,duration:.55,ease:"power1.inOut"},.45)
        .to(".mtls-question",{autoAlpha:1,y:0,duration:.35},.9)
        .to({}, {duration:.7})

      // TLS — server cert under server; client verify under client (same y band)
        .to(".mtls-question",{autoAlpha:0,duration:.25},2.4)
        .to(".mtls-server-cert",{autoAlpha:1,y:0,duration:.4},2.5)
        .to(".mtls-check-client-tls",{autoAlpha:1,scale:1,duration:.35},3.1)
        .to(".mtls-server .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.3},3.1)
        .to(".mtls-tls-note",{autoAlpha:1,y:0,duration:.35},3.6)
        .to({}, {duration:.7})

      // mTLS — certs + verifies in two rows; stage note stays in the upper band
        .to(".mtls-tls-note,.mtls-check-client-tls",{autoAlpha:0,duration:.2},5.2)
        .to(".mtls-client-cert",{autoAlpha:1,y:0,duration:.4},5.3)
        .to(".mtls-check-client-mtls,.mtls-check-server",{autoAlpha:1,scale:1,duration:.35},5.9)
        .to(".mtls-client .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.3},5.9)
        .to(".mtls-mtls-note",{autoAlpha:1,y:0,duration:.35},6.3)
        .to({}, {duration:.9})

      // CA
        .to(".mtls-mtls-note",{autoAlpha:0,duration:.2},8.2)
        .to(".mtls-ca",{autoAlpha:1,y:0,scale:1,duration:.45},8.3)
        .to(".mtls-ca-line",{autoAlpha:1,strokeDashoffset:0,duration:.7,stagger:.08,ease:"power1.inOut"},8.5)
        .to(".mtls-ca-note",{autoAlpha:1,y:0,duration:.35},9.3)
        .to(".root-ca-mtls",{scale:1.035,duration:.28,yoyo:true,repeat:1},9.5)
        .to({}, {duration:.7})

      // Secure — clear cert/verify row; results sit below the channel band
        .to(".mtls-ca-note,.mtls-check-client-tls,.mtls-check-client-mtls,.mtls-check-server,.mtls-client-cert,.mtls-server-cert,.mtls-ca,.mtls-ca-line",{autoAlpha:0,duration:.3},11.0)
        .to(".mtls-link-plain",{autoAlpha:0,duration:.2},11.0)
        .to(".mtls-tunnel",{autoAlpha:1,y:0,duration:.4},11.1)
        .to(".mtls-link-secure",{autoAlpha:1,strokeDashoffset:0,duration:.55,ease:"power1.inOut"},11.2)
        .to(".mtls-packet-a",{autoAlpha:1,duration:.01},11.5)
        .to(".mtls-packet-a",{x:560,duration:.7,ease:"none"},11.5)
        .to(".mtls-packet-b",{autoAlpha:1,duration:.01},12.0)
        .to(".mtls-packet-b",{x:-560,duration:.7,ease:"none"},12.0)
        .to(".mtls-result",{autoAlpha:1,y:0,duration:.35,stagger:.08},12.4)
        .to(".mtls-authz-note",{autoAlpha:1,y:0,duration:.3},13.0)
        .to({}, {duration:.4})

      // Reject
        .to(".mtls-tunnel,.mtls-link-secure,.mtls-packet-a,.mtls-packet-b,.mtls-result,.mtls-authz-note",{autoAlpha:0,duration:.3},14.0)
        .to(".mtls-packet-a",{x:0,duration:.01},14.3)
        .to(".mtls-packet-b",{x:0,duration:.01},14.3)
        .to(".mtls-bad-cert",{autoAlpha:1,y:0,duration:.4},14.2)
        .to(".mtls-server-cert",{autoAlpha:1,y:0,duration:.01},14.2)
        .to(".mtls-client .node-box",{stroke:"#c7c7c7",fill:"#fff",strokeWidth:2,duration:.25},14.2)
        .to(".mtls-reject",{autoAlpha:1,scale:1,duration:.4,ease:"back.out(1.4)"},14.7)
        .to(".mtls-reject-note",{autoAlpha:1,y:0,duration:.35},15.2)
        .to(".mtls-link-plain",{autoAlpha:.35,strokeDashoffset:0,duration:.3},14.7)
        .to({}, {duration:.7})

      // Mesh + close
        .to(".mtls-bad-cert,.mtls-reject,.mtls-reject-note,.mtls-server-cert",{autoAlpha:0,duration:.3},16.6)
        .to(".mtls-name-primary,.mtls-sub-primary",{autoAlpha:0,duration:.2},16.7)
        .to(".mtls-name-alt,.mtls-sub-alt",{autoAlpha:1,duration:.2},16.7)
        .to(".mtls-mesh-frame",{autoAlpha:1,y:0,duration:.4},16.75)
        .to(".mtls-client-cert,.mtls-server-cert",{autoAlpha:1,y:0,duration:.35},17.0)
        .to(".mtls-client .node-box,.mtls-server .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.3},17.0)
        .to(".mtls-link-secure",{autoAlpha:1,strokeDashoffset:0,duration:.45},17.1)
        .to(".mtls-mesh-note",{autoAlpha:1,y:0,duration:.35},17.4)
        .to(".mtls-close",{autoAlpha:1,y:0,duration:.45},17.9)
        .to({}, {duration:.7});

      timeline.current=tl;
      tl.time(chapters[0].seek,false);
      setActive(0);
      setProgress(Number((tl.progress()*100).toFixed(1)));
      setPlaying(false);
    },root);
    return()=>{chapterTween.current?.kill();timeline.current=null;ctx.revert();};
  },[]);

  const chapterIndexAt=(t:number)=>{let idx=0;chapters.forEach((c,i)=>{if(t>=c.start) idx=i;});return idx;};
  const playTo=(time:number)=>{
    const tl=timeline.current;if(!tl||reduced)return;
    chapterTween.current?.kill();
    setPlaying(true);
    chapterTween.current=tl.tweenTo(time,{onComplete:()=>{
      setPlaying(false);
      setProgress(Number((tl.progress()*100).toFixed(1)));
      setActive(chapterIndexAt(tl.time()));
    }});
  };
  const toggle=()=>{
    const tl=timeline.current;if(!tl||reduced)return;
    if(playing||!tl.paused()){chapterTween.current?.kill();tl.pause();setPlaying(false);return;}
    const t=tl.time();
    const idx=chapterIndexAt(t);
    const atEnd=t>=chapters[idx].seek-0.05;
    let next=atEnd?idx+1:idx;
    if(next>lastChapter||tl.progress()>=.999){tl.time(0,false);next=0;}
    playTo(chapters[next].seek);
  };
  const replay=()=>{const tl=timeline.current;if(!tl||reduced)return;tl.pause();tl.time(0,false);playTo(chapters[0].seek);};
  const go=(i:number)=>{const tl=timeline.current;if(!tl||reduced)return;chapterTween.current?.kill();tl.pause();tl.time(chapters[i].seek,false);setProgress(Number((tl.progress()*100).toFixed(1)));setActive(i);setPlaying(false);};
  const scrub=(v:number)=>{const tl=timeline.current;if(!tl||reduced)return;chapterTween.current?.kill();tl.pause().progress(v/100);setProgress(v);setPlaying(false);};
  const beginScrub=()=>{if(reduced)return;scrubbing.current=true;timeline.current?.pause();setPlaying(false);};
  const endScrub=()=>{scrubbing.current=false;};
  const changeSpeed=(s:number)=>{setSpeed(s);timeline.current?.timeScale(s);};
  const toggleFullscreen=()=>{
    const el=experience.current;
    if(!el) return;
    if(document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
  };

  useEffect(()=>{
    const sync=()=>setFullscreen(document.fullscreenElement===experience.current);
    document.addEventListener("fullscreenchange",sync);
    return()=>document.removeEventListener("fullscreenchange",sync);
  },[]);

  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.matches("button,input,textarea,select,a"))return;if(e.code==="Space"){e.preventDefault();toggle();}if(e.key==="ArrowRight")go(Math.min(lastChapter,active+1));if(e.key==="ArrowLeft")go(Math.max(0,active-1));if(e.key.toLowerCase()==="r")replay();if(e.key.toLowerCase()==="f"){e.preventDefault();toggleFullscreen();}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);});

  const chapter=chapters[active];
  const chapterTotal=String(chapters.length).padStart(2,"0");
  const onLast=active===lastChapter;

  return <main className="page" ref={root}>
    <header className="header">
      <div><p>OpenShift Service Mesh 3</p><h1>mTLS primer</h1></div>
      <div className="tags">
        <span>Step 00</span><span>mTLS</span>
        <Link className="tag-link" href="/">← Hub</Link>
        <Link className="tag-link" href="/flow/">Multi-cluster flow →</Link>
      </div>
    </header>

    <section ref={experience} className="experience" aria-label="Interactive mTLS primer animation">
      <div className="stage">
        <svg viewBox="0 0 1600 960" className="diagram" role="img" aria-labelledby="mtls-title mtls-desc">
          <title id="mtls-title">Mutual TLS primer</title>
          <desc id="mtls-desc">Progressive explanation of TLS, mTLS, certificate authorities, and service-mesh workloads.</desc>
          <defs>
            <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="9" floodColor="#000" floodOpacity=".11" /></filter>
            <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L12 6L0 12Z" fill="#ee0000"/></marker>
          </defs>
          <rect width="1600" height="960" rx="30" fill="#fbfbfb"/><rect width="1600" height="10" rx="5" fill="#ee0000"/>

          <g className="mtls-title">
            <text x="55" y="65" className="svg-kicker">STEP 00 · MUTUAL TLS</text>
            <text x="55" y="110" className="svg-title">Who is on the other side?</text>
            <text x="1545" y="68" textAnchor="end" className="svg-meta">NO PRIOR TLS KNOWLEDGE NEEDED</text>
          </g>

          <g className="mtls-mesh-frame">
            <rect x="120" y="140" width="1360" height="700" rx="28" className="cluster-box"/>
            <text x="150" y="185" className="cluster-title">Kubernetes · service mesh</text>
            <text x="150" y="218" className="cluster-sub">Workload certificates issued and rotated by the platform (e.g. Istio)</text>
          </g>

          <Cert x={650} y={145} width={300} label="Certificate Authority" root className="mtls-ca root-ca-mtls"/>
          <path pathLength="1" d="M720 207H340V340" className="draw mtls-link mtls-ca-line"/>
          <path pathLength="1" d="M880 207H1260V340" className="draw mtls-link mtls-ca-line"/>

          {/* Stage notes sit in the band above endpoints — never over cert/verify row */}
          <text x="800" y="280" textAnchor="middle" className="mtls-question mtls-callout">Do we know who we are talking to?</text>
          <text x="800" y="280" textAnchor="middle" className="mtls-tls-note mtls-callout">TLS: server identity checked · client usually not</text>
          <text x="800" y="280" textAnchor="middle" className="mtls-mtls-note mtls-callout">mTLS: both identities verified before app data</text>
          <text x="800" y="280" textAnchor="middle" className="mtls-ca-note mtls-callout">CA signature = shared reason to trust these certificates</text>

          <Endpoint x={200} y={320} title="Client" altTitle="Service A" subtitle="wants to connect" altSubtitle="workload" className="mtls-client"/>
          <Endpoint x={1120} y={320} title="Server" altTitle="Service B" subtitle="receives requests" altSubtitle="workload" className="mtls-server"/>

          <path pathLength="1" d="M480 380H1120" className="draw mtls-link mtls-link-plain" markerEnd="url(#arrow)"/>
          <path pathLength="1" d="M480 380H1120" className="draw mtls-link mtls-link-secure" markerEnd="url(#arrow)"/>

          {/* Channel band — label above packets so traffic does not cover the words */}
          <g className="mtls-tunnel">
            <text x="800" y="355" textAnchor="middle" className="mtls-tunnel-label">Encrypted channel</text>
            <rect x="500" y="365" width="600" height="40" rx="20" className="mtls-tunnel-box"/>
          </g>
          <circle cx="520" cy="385" r="9" className="packet mtls-packet mtls-packet-a"/>
          <circle cx="1080" cy="385" r="9" className="packet response-packet mtls-packet mtls-packet-b"/>

          {/* Cert row — aligned under Client (x=200) and Server (x=1120) */}
          <Cert x={200} y={500} width={280} label="Client certificate" className="mtls-cert mtls-client-cert"/>
          <Cert x={1120} y={500} width={280} label="Server certificate" className="mtls-cert mtls-server-cert"/>
          <Cert x={200} y={500} width={280} label="Untrusted / expired" className="mtls-cert mtls-bad-cert"/>

          {/* TLS: verify under client at same y as server certificate */}
          <VerifyUnder x={200} y={500} className="mtls-check-client-tls" label="Client verifies server"/>
          {/* mTLS: verifies under each cert */}
          <VerifyUnder x={200} y={580} className="mtls-check-client-mtls" label="Client verifies server"/>
          <VerifyUnder x={1120} y={580} className="mtls-check-server" label="Server verifies client"/>

          {/* Secure results — well below the encrypted-channel band */}
          <g className="mtls-result"><rect x="250" y="500" width="240" height="48" rx="24" className="mtls-pill"/><text x="370" y="530" textAnchor="middle" className="mtls-pill-label">Identity verified</text></g>
          <g className="mtls-result"><rect x="680" y="500" width="240" height="48" rx="24" className="mtls-pill"/><text x="800" y="530" textAnchor="middle" className="mtls-pill-label">Encrypted</text></g>
          <g className="mtls-result"><rect x="1110" y="500" width="240" height="48" rx="24" className="mtls-pill"/><text x="1230" y="530" textAnchor="middle" className="mtls-pill-label">Integrity protected</text></g>
          <text x="800" y="590" textAnchor="middle" className="mtls-authz-note mtls-callout">mTLS authenticates and protects data — it does not decide authorization</text>

          <text x="800" y="660" textAnchor="middle" className="mtls-reject-note mtls-callout">Validation failed — no application data sent</text>
          <text x="800" y="660" textAnchor="middle" className="mtls-mesh-note mtls-callout">Istio can issue, distribute, and rotate these certs for you</text>

          <g className="mtls-reject">
            <circle cx="800" cy="380" r="44" fill="#fff0f0" stroke="#ee0000" strokeWidth="5"/>
            <path d="M782 362 L818 398 M818 362 L782 398" stroke="#ee0000" strokeWidth="6" strokeLinecap="round"/>
          </g>

          <g className="mtls-close">
            <rect x="200" y="780" width="1200" height="56" rx="28" fill="#151515" filter="url(#shadow)"/>
            <text x="800" y="815" textAnchor="middle" className="summary-label mtls-close-label">mTLS creates an encrypted connection in which both sides verify each other’s identity.</text>
          </g>
        </svg>
      </div>

      <div className="controls">
        <div className="transport">
          <button className="primary" onClick={toggle} disabled={reduced}>{playing?"Ⅱ  Pause":"▶  Play"}</button>
          <button onClick={replay} disabled={reduced}>↻ Replay</button>
          {[.5,1,2].map(s=><button key={s} onClick={()=>changeSpeed(s)} disabled={reduced} style={s===speed?{borderColor:"var(--red)",background:"var(--soft)",color:"var(--dark-red)"}:{}}>{s===1?"1":s<1?"½":"2"}×</button>)}
          <button onClick={toggleFullscreen} aria-pressed={fullscreen} title={fullscreen?"Exit fullscreen (F)":"Fullscreen (F)"}>{fullscreen?"⛶ Exit":"⛶ Full"}</button>
        </div>
        <div className="chapter-copy" aria-live="polite">
          <p>00 · {String(active+1).padStart(2,"0")} / {chapterTotal}</p>
          <h2>{chapter.headline}</h2>
          <span>{chapter.body}</span>
          {onLast && <Link className="flow-cta" href="/flow/">Continue to multi-cluster flow →</Link>}
        </div>
        <div className="timeline">
          <label htmlFor="mtls-progress">Timeline <span>{Math.round(progress)}%</span></label>
          <input id="mtls-progress" type="range" min="0" max="100" step=".1" value={progress} onPointerDown={beginScrub} onPointerUp={endScrub} onPointerCancel={endScrub} onChange={e=>scrub(Number(e.target.value))} disabled={reduced}/>
          <div className="chapter-buttons chapter-buttons-mtls">{chapters.map((c,i)=><button key={c.label} onClick={()=>go(i)} className={i===active?"active":""} disabled={reduced} aria-current={i===active?"step":undefined}><b>{String(i+1).padStart(2,"0")}</b>{c.label}</button>)}</div>
        </div>
      </div>
    </section>
    <footer>
      <span>{reduced?"Reduced-motion mode: final mTLS summary shown.":"Keyboard: Space next step / pause • ←/→ chapters • R replay • F fullscreen"}</span>
      <span><Link href="/">Hub</Link> · <Link href="/flow/">Multi-cluster flow</Link> · <a href="/">Talks</a></span>
    </footer>
  </main>;
}
