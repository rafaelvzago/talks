import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenShift Service Mesh 3 — Choose a talk view",
  description:
    "Hub for the OSSM talk: mTLS primer and multi-cluster Istio mesh architecture animation.",
};

const options = [
  {
    href: "/mtls/",
    kicker: "Step 00",
    title: "mTLS primer",
    body: "Start here if the audience needs a clear picture of mutual TLS — certificates, CA trust, and what fails when identity is wrong.",
    cta: "Open primer",
  },
  {
    href: "/flow/",
    kicker: "Architecture",
    title: "Multi-cluster flow",
    body: "Interactive OSSM 3 diagram: shared trust, remote discovery, east-west gateways, and one logical Istio mesh.",
    cta: "Open animation",
  },
] as const;

export default function OssmHubPage() {
  return (
    <main className="page hub-page">
      <header className="header">
        <div>
          <p>OpenShift Service Mesh 3</p>
          <h1>Choose a view</h1>
        </div>
        <div className="tags">
          <span>OSSM 3</span>
          <span>Istio</span>
          <a className="tag-link" href="https://talks.rafaelvzago.com/">Talks catalog</a>
        </div>
      </header>

      <section className="hub-panel" aria-label="OSSM talk options">
        <p className="hub-lead">
          Two linked experiences for the same talk. Use the primer first when you need the mTLS foundation, then the multi-cluster animation.
        </p>
        <div className="hub-grid">
          {options.map((opt) => (
            <Link key={opt.href} href={opt.href} className="hub-card">
              <p className="hub-kicker">{opt.kicker}</p>
              <h2>{opt.title}</h2>
              <p>{opt.body}</p>
              <span className="hub-cta">{opt.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      <footer>
        <span>ossm.rafaelvzago.com · talks.rafaelvzago.com/tdc/2026/acm-ossm/</span>
        <span><a href="https://talks.rafaelvzago.com/">Talks</a></span>
      </footer>
    </main>
  );
}
