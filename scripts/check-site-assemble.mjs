#!/usr/bin/env node
/**
 * Assert the assembled GitHub Pages artifact has the talks catalog layout.
 * Usage: node scripts/check-site-assemble.mjs [_site]
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] || "_site");

function must(path, label = path) {
  assert.ok(existsSync(join(root, path)), `missing ${label} under ${root}`);
}

must("index.html");
must("CNAME");
assert.match(
  readFileSync(join(root, "CNAME"), "utf8").trim(),
  /^talks\.rafaelvzago\.com$/,
  "CNAME must be talks.rafaelvzago.com",
);

must("ai/claude-code/claude-code-open-source.html");
must("ai/claude-code/claude-code-open-source-en.html");

must("tdc/2026/acm-ossm/index.html");
must("tdc/2026/acm-ossm/mtls/index.html");
must("tdc/2026/acm-ossm/flow/index.html");
must("tdc/2026/painel-cloud/index.html");

assert.match(
  readFileSync(join(root, "index.html"), "utf8"),
  /talks\s*~\s*\/presentations|Talks/,
  "index should be the talks catalog",
);

console.log(`site-assemble check OK: ${root}`);
