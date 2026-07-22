#!/usr/bin/env node
/**
 * Build TDC Next apps (unless SKIP_BUILD=1) and assemble the Pages artifact.
 * Usage: node scripts/assemble-site.mjs [_site]
 */
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const site = resolve(process.argv[2] || join(repoRoot, "_site"));
const skipBuild = process.env.SKIP_BUILD === "1";

function runNpm(args, cwd) {
  console.log(`$ (${cwd}) npm ${args.join(" ")}`);
  execFileSync("npm", args, { cwd, stdio: "inherit" });
}

function buildApp(rel) {
  const cwd = join(repoRoot, rel);
  if (!skipBuild) {
    runNpm(["ci"], cwd);
    runNpm(["run", "build:pages"], cwd);
  }
  assertOut(join(cwd, "out"), rel);
}

function assertOut(outDir, label) {
  if (!existsSync(join(outDir, "index.html"))) {
    throw new Error(`${label}: missing out/index.html (run build or unset SKIP_BUILD)`);
  }
}

buildApp("tdc/2026/acm-ossm");
buildApp("tdc/2026/painel-cloud");

rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });

cpSync(join(repoRoot, "index.html"), join(site, "index.html"));
cpSync(join(repoRoot, "CNAME"), join(site, "CNAME"));
cpSync(join(repoRoot, "ai"), join(site, "ai"), { recursive: true });

const ossmDest = join(site, "tdc/2026/acm-ossm");
const painelDest = join(site, "tdc/2026/painel-cloud");
mkdirSync(ossmDest, { recursive: true });
mkdirSync(painelDest, { recursive: true });
cpSync(join(repoRoot, "tdc/2026/acm-ossm/out"), ossmDest, { recursive: true });
cpSync(join(repoRoot, "tdc/2026/painel-cloud/out"), painelDest, { recursive: true });

execFileSync(
  process.execPath,
  [join(repoRoot, "scripts/check-site-assemble.mjs"), site],
  { stdio: "inherit" },
);
console.log(`assembled → ${site}`);
