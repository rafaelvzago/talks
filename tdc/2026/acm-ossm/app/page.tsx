"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

type Chapter = {
  label: string;
  start: number;
  seek: number;
  headline: string;
  body?: string;
  bullets?: readonly string[];
};

/** Mesh architecture timeline starts after the mTLS primer. */
const M = 19;

const chapters: Chapter[] = [
  {label:"Who", start:0, seek:2.2, headline:"Two sides want to talk", body:"A client and a server need to know who is on the other end before they exchange real data."},
  {label:"TLS", start:2.4, seek:5.0, headline:"TLS checks the server", body:"The server presents a certificate. The client verifies it. In regular TLS, the client usually stays anonymous."},
  {label:"mTLS", start:5.2, seek:8.0, headline:"mTLS checks both sides", body:"Both present certificates. Each verifies the other before any application data flows."},
  {label:"CA", start:8.2, seek:10.8, headline:"A trusted CA signs certificates", body:"Both sides trust certificates signed by the same Certificate Authority — no crypto math required to get the idea."},
  {label:"Secure", start:11.0, seek:13.8, headline:"Encrypted channel opens", body:"After both validations succeed: identity verified, traffic encrypted, data integrity protected. Authorization is a separate decision."},
  {label:"Reject", start:14.0, seek:16.4, headline:"Bad certificate → no data", body:"Invalid, expired, missing, or untrusted cert fails validation. The connection stops before application data is sent."},
  {label:"Mesh", start:16.6, seek:18.8, headline:"Same idea between services", body:"Service A ↔ Service B use mTLS inside the mesh. Platforms like Istio can issue, distribute, and rotate workload certificates automatically."},
  {label:"Architecture", start:M+0, seek:M+1.8, headline:"Two Sail-managed control planes", body:"Each OpenShift cluster runs its own OSSM 3 control plane and east-west gateway."},
  {label:"Shared trust", start:M+2, seek:M+4.4, headline:"A common root of trust", body:"Cluster intermediate CAs chain to one shared root CA for cross-cluster mTLS."},
  {label:"Discovery", start:M+4.8, seek:M+7.2, headline:"Remote service discovery", body:"Remote secrets allow each istiod instance to discover services in the other cluster."},
  {label:"mTLS request", start:M+7.6, seek:M+11.1, headline:"Request crosses both gateways", body:"Port 15443 uses TLS passthrough, preserving workload mTLS end to end."},
  {label:"Response", start:M+11.6, seek:M+14.8, headline:"Encrypted response returns", body:"The response follows the reverse path without terminating workload mTLS."},
  {label:"One mesh", start:M+15.2, seek:M+17.4, headline:"One logical Istio mesh", body:"Both clusters use the Istio mesh ID bookinfo-mesh with shared trust and discovery."},
  {label:"Comm flow", start:M+17.5, seek:M+20.2, headline:"Multi-cluster communication flow", bullets:[
    "Client in the source cluster (e.g. East) starts the request",
    "Local control plane (istiod) resolves the remote service via Remote Secrets",
    "Traffic exits securely through the East-West Gateway (LoadBalancer) on port 15443",
    "Destination service (e.g. West) responds, keeping the response under mTLS",
  ]},
  {label:"Protection", start:M+20.5, seek:M+23.2, headline:"Inter-cluster connection protection", bullets:[
    "Shared trust: Shared Root CA + Intermediate CAs across clusters",
    "End-to-end mTLS: service-to-service auth and encryption",
    "Gateway security: East-West Gateway TLS AUTO_PASSTHROUGH (no mid-path decrypt)",
    "Remote Secrets: secure discovery (kubeconfig for remote auth)",
  ]},
];

const lastChapter = chapters.length - 1;

function Cert({ x, y, width, label, root = false, className = "" }: { x: number; y: number; width: number; label: string; root?: boolean; className?: string }) {
  return <g className={`trust-node ${root ? "root-ca" : ""} ${className}`.trim()}>
    <rect x={x} y={y} width={width} height="62" rx="16" className="cert-box" />
    <path d={`M ${x+27} ${y+17} L ${x+42} ${y+11} L ${x+57} ${y+17} V ${y+34} C ${x+57} ${y+45}, ${x+48} ${y+51}, ${x+42} ${y+55} C ${x+36} ${y+51}, ${x+27} ${y+45}, ${x+27} ${y+34} Z`} className="shield" />
    <text x={x+75} y={y+40} className="cert-label">{label}</text>
  </g>;
}

function OssmMark({ x, y, size = 50 }: { x: number; y: number; size?: number }) {
  return <image href="/tdc/2026/acm-ossm/openshift-service-mesh.svg" x={x} y={y} width={size} height={size} className="cluster-mark" />;
}

function Operator({ x, y }: { x: number; y: number }) {
  return <g className="operator">
    <rect x={x} y={y} width="132" height="28" rx="14" fill="#151515" />
    <circle cx={x+17} cy={y+14} r="6.5" fill="#ee0000" />
    <text x={x+31} y={y+19} className="operator-text">Sail operator</text>
  </g>;
}

function Control({ x, y }: { x: number; y: number }) {
  return <g className="node control-node">
    <rect x={x} y={y} width="230" height="110" rx="18" className="node-box" />
    <path d={`M ${x+31} ${y+74} L ${x+45} ${y+35} L ${x+59} ${y+74} Z`} fill="#ee0000" />
    <text x={x+80} y={y+47} className="node-title">Control plane</text>
    <text x={x+80} y={y+77} className="node-sub">istiod</text>
  </g>;
}

function Gateway({ x, y }: { x: number; y: number }) {
  const cx=x+39, cy=y+56;
  return <g className="node gateway-node">
    <rect x={x} y={y} width="270" height="110" rx="18" className="node-box" />
    <path d={`M ${cx} ${cy-18} L ${cx-18} ${cy+17} M ${cx} ${cy-18} L ${cx+18} ${cy+17} M ${cx-18} ${cy+17} L ${cx+18} ${cy+17}`} className="gateway-icon" />
    {[{x:cx,y:cy-18},{x:cx-18,y:cy+17},{x:cx+18,y:cy+17}].map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="6" className="gateway-dot" />)}
    <text x={x+77} y={y+47} className="node-title gateway-title">East-west gateway</text>
    <text x={x+77} y={y+77} className="node-sub">LoadBalancer :15443</text>
  </g>;
}

function App({ x, y, label, className="" }: { x:number; y:number; label:string; className?:string }) {
  return <g className={`app-node ${className}`}>
    <rect x={x} y={y} width="210" height="48" rx="11" className="app-box" />
    <rect x={x+16} y={y+14} width="18" height="18" rx="4" className="app-icon" />
    <text x={x+46} y={y+32} className="app-label">{label}</text>
  </g>;
}

function Endpoint({ x, y, title, altTitle, subtitle, altSubtitle, className }: {
  x: number; y: number; title: string; altTitle: string; subtitle: string; altSubtitle: string; className: string;
}) {
  return <g className={`mtls-endpoint ${className}`}>
    <rect x={x} y={y} width="280" height="130" rx="18" className="node-box" filter="url(#shadow)" />
    <rect x={x+22} y={y+36} width="36" height="36" rx="8" className="app-icon" />
    <text x={x+72} y={y+52} className="node-title mtls-name-primary">{title}</text>
    <text x={x+72} y={y+52} className="node-title mtls-name-alt">{altTitle}</text>
    <text x={x+72} y={y+86} className="node-sub mtls-sub-primary">{subtitle}</text>
    <text x={x+72} y={y+86} className="node-sub mtls-sub-alt">{altSubtitle}</text>
  </g>;
}

export default function Home() {
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
        gsap.set(".scene-mtls",{autoAlpha:0});
        gsap.set(".scene-mesh,.anim,.trust-node,.remote,.summary,.request-line,.response-line,.gateway-caption",{autoAlpha:1,y:0,scale:1});
        gsap.set(".draw",{strokeDasharray:1,strokeDashoffset:0});
        gsap.set(".packet",{autoAlpha:0});
        setProgress(100); setActive(lastChapter); return;
      }

      gsap.set(".scene-mesh",{autoAlpha:0});
      gsap.set(".mtls-title",{autoAlpha:0,y:-12});
      gsap.set(".mtls-endpoint,.mtls-question,.mtls-cert,.mtls-ca,.mtls-check,.mtls-tunnel,.mtls-result,.mtls-reject,.mtls-mesh-frame,.mtls-close,.mtls-authz-note,.mtls-packet,.mtls-tls-note,.mtls-mtls-note,.mtls-ca-note,.mtls-reject-note,.mtls-mesh-note",{autoAlpha:0,y:10});
      gsap.set(".mtls-link",{strokeDasharray:1,strokeDashoffset:1,autoAlpha:0});
      gsap.set(".mtls-validate",{autoAlpha:0,scale:.9,transformOrigin:"50% 50%"});
      gsap.set(".mtls-name-alt,.mtls-sub-alt",{autoAlpha:0});

      gsap.set(".title-group",{autoAlpha:0,y:-12});
      gsap.set(".cluster",{autoAlpha:0,y:18,scale:.97,transformOrigin:"50% 50%"});
      gsap.set(".node,.operator,.apps,.app-node,.mesh-badge",{autoAlpha:0,y:14});
      gsap.set(".trust-node,.summary",{autoAlpha:0,y:12,scale:.97,transformOrigin:"50% 50%"});
      gsap.set(".draw",{strokeDasharray:1,strokeDashoffset:1});
      gsap.set(".request-line,.response-line,.gateway-caption",{autoAlpha:0});
      gsap.set(".packet",{autoAlpha:0,x:0,y:0});
      gsap.set(".mesh-link",{autoAlpha:0});

      const tl=gsap.timeline({paused:true,defaults:{ease:"power2.out"},onUpdate:()=>{
        const t=tl.time(); let idx=0;
        chapters.forEach((c,i)=>{if(t>=c.start) idx=i;});
        setActive(a=>a===idx?a:idx);
        if(scrubbing.current) return;
        const p=Number((tl.progress()*100).toFixed(1));
        setProgress(prev=>prev===p?prev:p);
      },onComplete:()=>setPlaying(false)});

      // —— 00 primer: Who
      tl.to(".mtls-title",{autoAlpha:1,y:0,duration:.4})
        .to(".mtls-client,.mtls-server",{autoAlpha:1,y:0,duration:.45,stagger:.1},.15)
        .to(".mtls-link-plain",{autoAlpha:1,strokeDashoffset:0,duration:.55,ease:"power1.inOut"},.45)
        .to(".mtls-question",{autoAlpha:1,y:0,duration:.35},.9)
        .to({}, {duration:.7})

      // —— TLS
        .to(".mtls-question",{autoAlpha:0,duration:.25},2.4)
        .to(".mtls-server-cert",{autoAlpha:1,y:0,duration:.4},2.5)
        .to(".mtls-check-client",{autoAlpha:1,scale:1,duration:.35},3.1)
        .to(".mtls-tls-note",{autoAlpha:1,y:0,duration:.35},3.5)
        .to(".mtls-client .node-box",{stroke:"#c7c7c7",duration:.2},3.5)
        .to(".mtls-server .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.3},3.1)
        .to({}, {duration:.8})

      // —— mTLS
        .to(".mtls-tls-note",{autoAlpha:0,duration:.2},5.2)
        .to(".mtls-client-cert",{autoAlpha:1,y:0,duration:.4},5.3)
        .to(".mtls-check-server",{autoAlpha:1,scale:1,duration:.35},5.9)
        .to(".mtls-client .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.3},5.9)
        .to(".mtls-mtls-note",{autoAlpha:1,y:0,duration:.35},6.3)
        .to({}, {duration:.9})

      // —— CA
        .to(".mtls-mtls-note",{autoAlpha:0,duration:.2},8.2)
        .to(".mtls-ca",{autoAlpha:1,y:0,scale:1,duration:.45},8.3)
        .to(".mtls-ca-line",{autoAlpha:1,strokeDashoffset:0,duration:.7,stagger:.08,ease:"power1.inOut"},8.5)
        .to(".mtls-ca-note",{autoAlpha:1,y:0,duration:.35},9.3)
        .to(".root-ca-mtls",{scale:1.035,duration:.28,yoyo:true,repeat:1},9.5)
        .to({}, {duration:.7})

      // —— Secure
        .to(".mtls-ca-note,.mtls-check-client,.mtls-check-server",{autoAlpha:0,duration:.25},11.0)
        .to(".mtls-link-plain",{autoAlpha:0,duration:.2},11.0)
        .to(".mtls-tunnel",{autoAlpha:1,y:0,duration:.4},11.1)
        .to(".mtls-link-secure",{autoAlpha:1,strokeDashoffset:0,duration:.55,ease:"power1.inOut"},11.2)
        .to(".mtls-packet-a",{autoAlpha:1,duration:.01},11.5)
        .to(".mtls-packet-a",{x:520,duration:.7,ease:"none"},11.5)
        .to(".mtls-packet-b",{autoAlpha:1,duration:.01},12.0)
        .to(".mtls-packet-b",{x:-520,duration:.7,ease:"none"},12.0)
        .to(".mtls-result",{autoAlpha:1,y:0,duration:.35,stagger:.08},12.3)
        .to(".mtls-authz-note",{autoAlpha:1,y:0,duration:.3},12.9)
        .to({}, {duration:.5})

      // —— Reject
        .to(".mtls-tunnel,.mtls-link-secure,.mtls-packet-a,.mtls-packet-b,.mtls-result,.mtls-authz-note,.mtls-client-cert",{autoAlpha:0,duration:.3},14.0)
        .to(".mtls-packet-a",{x:0,duration:.01},14.3)
        .to(".mtls-packet-b",{x:0,duration:.01},14.3)
        .to(".mtls-bad-cert",{autoAlpha:1,y:0,duration:.4},14.2)
        .to(".mtls-client .node-box",{stroke:"#c7c7c7",fill:"#fff",strokeWidth:2,duration:.25},14.2)
        .to(".mtls-reject",{autoAlpha:1,scale:1,duration:.4,ease:"back.out(1.4)"},14.7)
        .to(".mtls-reject-note",{autoAlpha:1,y:0,duration:.35},15.2)
        .to(".mtls-link-plain",{autoAlpha:.35,strokeDashoffset:0,duration:.3},14.7)
        .to({}, {duration:.7})

      // —— Mesh example + close
        .to(".mtls-bad-cert,.mtls-reject,.mtls-reject-note,.mtls-server-cert,.mtls-ca,.mtls-ca-line,.mtls-tls-note",{autoAlpha:0,duration:.3},16.6)
        .to(".mtls-name-primary,.mtls-sub-primary",{autoAlpha:0,duration:.2},16.7)
        .to(".mtls-name-alt,.mtls-sub-alt",{autoAlpha:1,duration:.2},16.7)
        .to(".mtls-mesh-frame",{autoAlpha:1,y:0,duration:.4},16.75)
        .to(".mtls-client-cert,.mtls-server-cert",{autoAlpha:1,y:0,duration:.35},17.0)
        .to(".mtls-client .node-box,.mtls-server .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.3},17.0)
        .to(".mtls-link-secure",{autoAlpha:1,strokeDashoffset:0,duration:.45},17.1)
        .to(".mtls-mesh-note",{autoAlpha:1,y:0,duration:.35},17.4)
        .to(".mtls-close",{autoAlpha:1,y:0,duration:.45},17.9)
        .to({}, {duration:.5})

      // —— Crossfade into mesh architecture
        .to(".scene-mtls",{autoAlpha:0,duration:.45},M)
        .to(".scene-mesh",{autoAlpha:1,duration:.45},M)
        .to(".title-group",{autoAlpha:1,y:0,duration:.45},M)
        .to(".cluster",{autoAlpha:1,y:0,scale:1,duration:.7,stagger:.12},M+.15)
        .to(".operator",{autoAlpha:1,y:0,duration:.35,stagger:.08},M+.7)
        .to(".node",{autoAlpha:1,y:0,duration:.48,stagger:.07},M+.78)
        .to(".apps",{autoAlpha:1,y:0,duration:.4,stagger:.08},M+.95)
        .to(".app-node",{autoAlpha:1,y:0,duration:.38,stagger:.05},M+1.08)
        .to(".mesh-badge",{autoAlpha:1,y:0,duration:.42,stagger:.08},M+1.38)
        .to(".node,.operator,.apps,.app-node,.mesh-badge,.remote",{opacity:.35,duration:.3},M+2)
        .to(".trust-node",{autoAlpha:1,y:0,scale:1,duration:.55,stagger:.1},M+2)
        .to(".trust-line",{strokeDashoffset:0,duration:1,stagger:.08,ease:"power1.inOut"},M+2.25)
        .to(".root-ca",{scale:1.035,duration:.28,yoyo:true,repeat:1},M+3.35)
        .to(".cluster-box",{stroke:"#ee0000",duration:.3,stagger:.08},M+3.55)
        .to(".cluster-box",{stroke:"#d8d8d8",duration:.5,stagger:.08},M+3.95)
        .to(".trust-node",{opacity:.35,duration:.3},M+4.8)
        .to(".control-node,.remote",{opacity:1,duration:.3},M+4.8)
        .to(".discovery-line",{strokeDashoffset:0,duration:1.05,stagger:.1,ease:"power1.inOut"},M+5.05)
        .to(".control-node .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3.5,duration:.35,stagger:.08},M+5.35)
        .to(".discovery-line",{strokeDashoffset:-.18,duration:.7,ease:"none"},M+6.35)
        .to(".control-node .node-box",{stroke:"#c7c7c7",fill:"#fff",strokeWidth:2,duration:.4,stagger:.08},M+6.85)
        .to(".control-node,.remote",{opacity:.35,duration:.3},M+7.6)
        .to(".gateway-node,.apps,.east-sleep,.west-product",{opacity:1,duration:.3},M+7.6)
        .to(".gateway-caption",{autoAlpha:1,duration:.3},M+7.6)
        .to(".req-1",{autoAlpha:1,duration:.01},M+7.6)
        .to(".req-1",{strokeDashoffset:0,duration:.35,ease:"power1.inOut"},M+7.6)
        .to(".req-2",{autoAlpha:1,duration:.01},M+8.0)
        .to(".req-2",{strokeDashoffset:0,duration:.5,ease:"power1.inOut"},M+8.0)
        .to(".req-3",{autoAlpha:1,duration:.01},M+8.55)
        .to(".req-3",{strokeDashoffset:0,duration:.45,ease:"power1.inOut"},M+8.55)
        .to(".east-sleep .app-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.25},M+7.6)
        .to(".request-packet",{autoAlpha:1,duration:.01},M+7.7)
        .to(".request-packet",{x:10,y:-72,duration:.3},M+7.7)
        .to(".gateway-node .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3.5,duration:.28,stagger:.08},M+8.0)
        .to(".request-packet",{x:10,y:-127,duration:.18},M+8.05)
        .to(".request-packet",{x:-415,y:-127,duration:.45,ease:"none"},M+8.25)
        .to(".request-packet",{x:-550,y:-127,duration:.15},M+8.7)
        .to(".request-packet",{x:-550,y:-72,duration:.15},M+8.85)
        .to(".request-packet",{x:-840,y:0,duration:.25},M+9.0)
        .to(".west-product .app-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.25},M+9.0)
        .to(".request-packet",{autoAlpha:0,duration:.18},M+10.85)
        .to(".res-1",{autoAlpha:1,duration:.01},M+11.6)
        .to(".res-1",{strokeDashoffset:0,duration:.4,ease:"power1.inOut"},M+11.6)
        .to(".res-2",{autoAlpha:1,duration:.01},M+12.05)
        .to(".res-2",{strokeDashoffset:0,duration:.5,ease:"power1.inOut"},M+12.05)
        .to(".res-3",{autoAlpha:1,duration:.01},M+12.6)
        .to(".res-3",{strokeDashoffset:0,duration:.35,ease:"power1.inOut"},M+12.6)
        .to(".response-packet",{autoAlpha:1,duration:.01},M+11.7)
        .to(".response-packet",{y:-123,duration:.25},M+11.7)
        .to(".response-packet",{x:320,y:-123,duration:.3,ease:"none"},M+11.95)
        .to(".response-packet",{x:610,y:-123,duration:.45,ease:"none"},M+12.25)
        .to(".response-packet",{x:610,y:0,duration:.25},M+12.7)
        .to(".response-packet",{x:630,y:0,duration:.15},M+12.95)
        .to(".response-packet",{autoAlpha:0,duration:.18},M+14.55)
        .to(".node,.trust-node,.operator,.apps,.app-node,.mesh-badge,.remote,.gateway-caption",{opacity:1,duration:.4},M+15.2)
        .to(".req-1,.req-2,.req-3,.res-1,.res-2,.res-3,.discovery-line",{opacity:.16,duration:.4},M+15.2)
        .to(".mesh-link",{autoAlpha:1,strokeDashoffset:0,duration:.8,ease:"power1.inOut"},M+15.3)
        .to(".mesh-box",{fill:"#fff0f0",stroke:"#ee0000",strokeWidth:2.5,duration:.35,stagger:.08},M+15.45)
        .to(".summary",{autoAlpha:1,y:0,scale:1,duration:.55,ease:"back.out(1.5)"},M+15.75)
        .to(".cluster",{scale:1.008,duration:.28,stagger:.08,yoyo:true,repeat:1},M+16.35)
        .to(".trust-node,.trust-line,.operator,.mesh-badge,.summary,.mesh-link,.west-reviews,.east-bookinfo,.discovery-line",{opacity:.35,duration:.3},M+17.5)
        .to(".control-node,.remote,.gateway-node,.gateway-caption,.apps,.east-sleep,.west-product",{opacity:1,duration:.3},M+17.5)
        .to(".req-1,.req-2,.req-3,.res-1,.res-2,.res-3",{opacity:.85,duration:.3},M+17.5)
        .to(".east-sleep .app-box,.west-product .app-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.25},M+17.5)
        .to(".gateway-node .node-box,.control-node .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3.5,duration:.25},M+17.5)
        .to(".operator,.apps,.app-node,.mesh-badge,.summary,.mesh-link,.control-node,.discovery-line",{opacity:.35,duration:.3},M+20.5)
        .to(".trust-node,.trust-line,.remote,.gateway-node,.gateway-caption",{opacity:1,duration:.3},M+20.5)
        .to(".req-1,.req-2,.req-3,.res-1,.res-2,.res-3",{opacity:.28,duration:.3},M+20.5)
        .to(".east-sleep .app-box,.west-product .app-box,.control-node .node-box",{stroke:"#c7c7c7",fill:"#fff",strokeWidth:2,duration:.25},M+20.5)
        .to(".gateway-node .node-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3.5,duration:.25},M+20.5)
        .to(".remote-box",{stroke:"#ee0000",fill:"#fff0f0",strokeWidth:3,duration:.25},M+20.5)
        .to(".root-ca",{scale:1.035,duration:.28,yoyo:true,repeat:1},M+20.7)
        .to({}, {duration:2.3});

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

  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.matches("button,input,textarea,select"))return;if(e.code==="Space"){e.preventDefault();toggle();}if(e.key==="ArrowRight")go(Math.min(lastChapter,active+1));if(e.key==="ArrowLeft")go(Math.max(0,active-1));if(e.key.toLowerCase()==="r")replay();if(e.key.toLowerCase()==="f"){e.preventDefault();toggleFullscreen();}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);});

  const chapter=chapters[active];
  const chapterTotal=String(chapters.length).padStart(2,"0");
  return <main className="page" ref={root}>
    <header className="header">
      <div><p>OpenShift Service Mesh 3</p><h1>mTLS primer → Istio mesh architecture</h1></div>
      <div className="tags"><span>mTLS</span><span>OSSM 3</span><span>Sail operator</span><span>Istio</span></div>
    </header>

    <section ref={experience} className="experience" aria-label="Interactive mTLS primer and Istio mesh architecture animation">
      <div className="stage">
        <svg viewBox="0 0 1600 960" className="diagram" role="img" aria-labelledby="svg-title svg-desc">
          <title id="svg-title">mTLS primer and OpenShift Service Mesh multi-cluster architecture</title>
          <desc id="svg-desc">Progressive mTLS explanation, then two OpenShift clusters with shared trust, discovery, and east-west gateways.</desc>
          <defs>
            <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="9" floodColor="#000" floodOpacity=".11" /></filter>
            <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L12 6L0 12Z" fill="#ee0000"/></marker>
            <marker id="arrow-dark" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L12 6L0 12Z" fill="#0066cc"/></marker>
          </defs>
          <rect width="1600" height="960" rx="30" fill="#fbfbfb"/><rect width="1600" height="10" rx="5" fill="#ee0000"/>

          {/* —— Scene 00: mTLS primer —— */}
          <g className="scene-mtls">
            <g className="mtls-title">
              <text x="55" y="65" className="svg-kicker">STEP 00 · MUTUAL TLS</text>
              <text x="55" y="110" className="svg-title">Who is on the other side?</text>
              <text x="1545" y="68" textAnchor="end" className="svg-meta">NO PRIOR TLS KNOWLEDGE NEEDED</text>
            </g>

            <g className="mtls-mesh-frame">
              <rect x="80" y="150" width="1440" height="620" rx="28" className="cluster-box"/>
              <text x="110" y="195" className="cluster-title">Kubernetes · service mesh</text>
              <text x="110" y="228" className="cluster-sub">Workload certificates issued and rotated by the platform (e.g. Istio)</text>
            </g>

            <Cert x={650} y={155} width={300} label="Certificate Authority" root className="mtls-ca root-ca-mtls"/>
            <path pathLength="1" d="M720 217H340V420" className="draw mtls-link mtls-ca-line"/>
            <path pathLength="1" d="M880 217H1260V420" className="draw mtls-link mtls-ca-line"/>

            <Endpoint x={180} y={400} title="Client" altTitle="Service A" subtitle="wants to connect" altSubtitle="workload" className="mtls-client"/>
            <Endpoint x={1140} y={400} title="Server" altTitle="Service B" subtitle="receives requests" altSubtitle="workload" className="mtls-server"/>

            <path pathLength="1" d="M460 465H1140" className="draw mtls-link mtls-link-plain" markerEnd="url(#arrow)"/>
            <path pathLength="1" d="M460 465H1140" className="draw mtls-link mtls-link-secure" markerEnd="url(#arrow)"/>
            <g className="mtls-tunnel">
              <rect x="470" y="430" width="660" height="70" rx="35" className="mtls-tunnel-box"/>
              <text x="800" y="472" textAnchor="middle" className="mtls-tunnel-label">Encrypted channel</text>
            </g>
            <circle cx="500" cy="465" r="10" className="packet mtls-packet mtls-packet-a"/>
            <circle cx="1100" cy="490" r="10" className="packet response-packet mtls-packet mtls-packet-b"/>

            <Cert x={200} y={560} width={300} label="Client certificate" className="mtls-cert mtls-client-cert"/>
            <Cert x={1100} y={560} width={300} label="Server certificate" className="mtls-cert mtls-server-cert"/>
            <Cert x={200} y={560} width={300} label="Untrusted / expired" className="mtls-cert mtls-bad-cert"/>

            <g className="mtls-validate mtls-check-client">
              <circle cx="520" cy="590" r="22" fill="#fff0f0" stroke="#ee0000" strokeWidth="3"/>
              <path d="M508 590 L517 599 L534 580" fill="none" stroke="#ee0000" strokeWidth="4" strokeLinecap="round"/>
              <text x="555" y="597" className="mtls-callout">Client verifies server</text>
            </g>
            <g className="mtls-validate mtls-check-server">
              <circle cx="1080" cy="590" r="22" fill="#fff0f0" stroke="#ee0000" strokeWidth="3"/>
              <path d="M1068 590 L1077 599 L1094 580" fill="none" stroke="#ee0000" strokeWidth="4" strokeLinecap="round"/>
              <text x="900" y="597" textAnchor="end" className="mtls-callout">Server verifies client</text>
            </g>

            <text x="800" y="320" textAnchor="middle" className="mtls-question mtls-callout">Do we know who we are talking to?</text>
            <text x="800" y="720" textAnchor="middle" className="mtls-tls-note mtls-callout">TLS: server identity checked · client usually not</text>
            <text x="800" y="720" textAnchor="middle" className="mtls-mtls-note mtls-callout">mTLS: both identities verified before app data</text>
            <text x="800" y="300" textAnchor="middle" className="mtls-ca-note mtls-callout">CA signature = shared reason to trust these certificates</text>
            <text x="800" y="780" textAnchor="middle" className="mtls-reject-note mtls-callout">Validation failed — no application data sent</text>
            <text x="800" y="780" textAnchor="middle" className="mtls-mesh-note mtls-callout">Istio can issue, distribute, and rotate these certs for you</text>

            <g className="mtls-result"><rect x="200" y="780" width="220" height="44" rx="22" className="mtls-pill"/><text x="310" y="808" textAnchor="middle" className="mtls-pill-label">Identity verified</text></g>
            <g className="mtls-result"><rect x="690" y="780" width="220" height="44" rx="22" className="mtls-pill"/><text x="800" y="808" textAnchor="middle" className="mtls-pill-label">Encrypted</text></g>
            <g className="mtls-result"><rect x="1180" y="780" width="220" height="44" rx="22" className="mtls-pill"/><text x="1290" y="808" textAnchor="middle" className="mtls-pill-label">Integrity protected</text></g>
            <text x="800" y="860" textAnchor="middle" className="mtls-authz-note mtls-callout">mTLS authenticates and protects data — it does not decide authorization</text>

            <g className="mtls-reject">
              <circle cx="800" cy="465" r="48" fill="#fff0f0" stroke="#ee0000" strokeWidth="5"/>
              <path d="M780 445 L820 485 M820 445 L780 485" stroke="#ee0000" strokeWidth="6" strokeLinecap="round"/>
            </g>

            <g className="mtls-close">
              <rect x="280" y="880" width="1040" height="52" rx="26" fill="#151515" filter="url(#shadow)"/>
              <text x="800" y="913" textAnchor="middle" className="summary-label mtls-close-label">mTLS creates an encrypted connection in which both sides verify each other’s identity.</text>
            </g>
          </g>

          {/* —— Scene: OSSM multi-cluster mesh —— */}
          <g className="scene-mesh">
            <g className="title-group"><text x="55" y="65" className="svg-kicker">OPENSHIFT SERVICE MESH 3</text><text x="55" y="110" className="svg-title">Multi-Cluster Request Flow</text><text x="1545" y="68" textAnchor="end" className="svg-meta">OSSM 3 • SAIL OPERATOR • ISTIO</text></g>

            <g className="layer-trust-lines">
              <path pathLength="1" d="M800 199V220H340V245" className="draw trust-line"/>
              <path pathLength="1" d="M800 220H1260V245" className="draw trust-line"/>
            </g>
            <Cert x={650} y={137} width={300} label="Shared Root CA" root/><Cert x={150} y={245} width={380} label="Intermediate CA — west"/><Cert x={1070} y={245} width={380} label="Intermediate CA — east"/>
            <text x="800" y="327" textAnchor="middle" className="trust-caption trust-node">Shared trust enables mTLS between clusters</text>

            <g className="cluster west"><rect x="55" y="345" width="650" height="500" rx="28" className="cluster-box"/><OssmMark x={80} y={372}/><text x="147" y="397" className="cluster-title">Cluster West</text><text x="147" y="429" className="cluster-sub">west-network</text></g>
            <g className="cluster east"><rect x="895" y="345" width="650" height="500" rx="28" className="cluster-box"/><OssmMark x={920} y={372}/><text x="987" y="397" className="cluster-title">Cluster East</text><text x="987" y="429" className="cluster-sub">east-network</text></g>
            <g className="apps"><rect x="105" y="607" width="550" height="125" rx="18" className="apps-box"/><text x="380" y="638" textAnchor="middle" className="apps-title">Applications</text></g>
            <g className="apps"><rect x="945" y="607" width="550" height="125" rx="18" className="apps-box"/><text x="1220" y="638" textAnchor="middle" className="apps-title">Applications</text></g>

            <g className="layer-lines">
              <path d="M230 654V618H220V582" className="sidecar-line"/>
              <path d="M470 654V618H220V582" className="sidecar-line"/>
              <path d="M1070 654V618H1405V582" className="sidecar-line"/>
              <path d="M1310 654V618H1405V582" className="sidecar-line"/>
              <path d="M230 654V618H520V582" className="datapath-line"/>
              <path d="M470 654V618H520V582" className="datapath-line"/>
              <path d="M1070 654V618H1080V582" className="datapath-line"/>
              <path d="M1310 654V618H1080V582" className="datapath-line"/>
              <path pathLength="1" d="M1405 582V794H950" className="draw discovery-line" markerEnd="url(#arrow)"/>
              <path pathLength="1" d="M650 794H220V582" className="draw discovery-line" markerEnd="url(#arrow)"/>
              <path pathLength="1" d="M1070 654V582H1080" className="draw request-line req-1"/>
              <path pathLength="1" d="M1080 582V527H655" className="draw request-line req-2" markerEnd="url(#arrow)"/>
              <path pathLength="1" d="M655 527H520V582H230V654" className="draw request-line req-3" markerEnd="url(#arrow)"/>
              <path pathLength="1" d="M335 678V555H655" className="draw response-line res-1"/>
              <path pathLength="1" d="M655 555H945" className="draw response-line res-2" markerEnd="url(#arrow-dark)"/>
              <path pathLength="1" d="M945 555V678H965" className="draw response-line res-3" markerEnd="url(#arrow-dark)"/>
              <path pathLength="1" d="M540 879H1060" className="draw mesh-link"/>
            </g>

            <g className="layer-nodes">
              <Operator x={154} y={444}/><Operator x={1339} y={444}/><Control x={105} y={472}/><Gateway x={385} y={472}/><Gateway x={945} y={472}/><Control x={1290} y={472}/>
              <App x={125} y={654} label="productpage" className="west-product"/><App x={365} y={654} label="reviews" className="west-reviews"/><App x={965} y={654} label="sleep" className="east-sleep"/><App x={1205} y={654} label="bookinfo" className="east-bookinfo"/>
              <g className="remote"><rect x="650" y="740" width="300" height="108" rx="18" className="node-box remote-box"/><rect x="674" y="785" width="30" height="27" rx="4" className="lock"/><path d="M679 785V776A10 10 0 0 1 699 776V785" className="shackle"/><text x="722" y="787" className="node-title">Remote secrets</text><text x="722" y="817" className="node-sub">service discovery</text></g>
              <g className="gateway-caption">
                <rect x="684" y="458" width="232" height="48" rx="14" className="gateway-caption-box" filter="url(#shadow)"/>
                <text x="800" y="478" textAnchor="middle" className="gateway-caption-text">15443 • TLS passthrough</text>
                <text x="800" y="496" textAnchor="middle" className="gateway-caption-text">workload mTLS preserved</text>
              </g>
              <g className="mesh-badge"><rect x="220" y="862" width="320" height="34" rx="17" className="mesh-box"/><text x="380" y="885" textAnchor="middle" className="mesh-label">Istio mesh ID: bookinfo-mesh</text></g>
              <g className="mesh-badge"><rect x="1060" y="862" width="320" height="34" rx="17" className="mesh-box"/><text x="1220" y="885" textAnchor="middle" className="mesh-label">Istio mesh ID: bookinfo-mesh</text></g>
              <g className="summary"><rect x="610" y="906" width="380" height="44" rx="22" fill="#151515" filter="url(#shadow)"/><circle cx="649" cy="928" r="7" fill="#ee0000"/><text x="800" y="935" textAnchor="middle" className="summary-label">ONE LOGICAL ISTIO MESH</text></g>
            </g>

            <g className="layer-packets">
              <circle cx="1070" cy="654" r="11" className="packet request-packet"/>
              <circle cx="335" cy="678" r="11" className="packet response-packet"/>
            </g>
          </g>
        </svg>
      </div>

      <div className="controls">
        <div className="transport"><button className="primary" onClick={toggle} disabled={reduced}>{playing?"Ⅱ  Pause":"▶  Play"}</button><button onClick={replay} disabled={reduced}>↻ Replay</button>{[.5,1,2].map(s=><button key={s} onClick={()=>changeSpeed(s)} disabled={reduced} style={s===speed?{borderColor:"var(--red)",background:"var(--soft)",color:"var(--dark-red)"}:{}}>{s===1?"1":s<1?"½":"2"}×</button>)}<button onClick={toggleFullscreen} aria-pressed={fullscreen} title={fullscreen?"Exit fullscreen (F)":"Fullscreen (F)"}>{fullscreen?"⛶ Exit":"⛶ Full"}</button></div>
        <div className="chapter-copy" aria-live="polite">
          <p>{String(active+1).padStart(2,"0")} / {chapterTotal}{active<7?" · primer":""}</p>
          <h2>{chapter.headline}</h2>
          {chapter.bullets
            ? <ol className="chapter-bullets">{chapter.bullets.map(b=><li key={b}>{b}</li>)}</ol>
            : <span>{chapter.body}</span>}
        </div>
        <div className="timeline"><label htmlFor="progress">Timeline <span>{Math.round(progress)}%</span></label><input id="progress" type="range" min="0" max="100" step=".1" value={progress} onPointerDown={beginScrub} onPointerUp={endScrub} onPointerCancel={endScrub} onChange={e=>scrub(Number(e.target.value))} disabled={reduced}/><div className="chapter-buttons">{chapters.map((c,i)=><button key={c.label} onClick={()=>go(i)} className={i===active?"active":""} disabled={reduced} aria-current={i===active?"step":undefined}><b>{i<7?"00":String(i-6).padStart(2,"0")}</b>{c.label}</button>)}</div></div>
      </div>
    </section>
    <footer><span>{reduced?"Reduced-motion mode: complete architecture shown.":"Keyboard: Space next step / pause • ←/→ chapters • R replay • F fullscreen"}</span><span>Editable SVG • GSAP timeline • <a href="/">Talks</a></span></footer>
  </main>;
}
