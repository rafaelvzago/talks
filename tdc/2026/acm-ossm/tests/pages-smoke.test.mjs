import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "out");

test("Pages export includes OSSM hub and no painel or CNAME", () => {
  assert.ok(existsSync(join(root, "index.html")), "out/index.html");
  assert.ok(!existsSync(join(root, "painel")), "out/painel must not exist");
  assert.ok(!existsSync(join(root, "CNAME")), "out/CNAME must not exist");
  assert.match(
    readFileSync(join(root, "index.html"), "utf8"),
    /Choose a view|mTLS primer|Multi-cluster flow/i,
  );
});

test("Pages export includes mTLS primer and multi-cluster flow routes", () => {
  const mtls = join(root, "mtls", "index.html");
  const flow = join(root, "flow", "index.html");
  assert.ok(existsSync(mtls), "out/mtls/index.html");
  assert.ok(existsSync(flow), "out/flow/index.html");
  assert.match(readFileSync(mtls, "utf8"), /mTLS|Mutual TLS|Certificate/i);
  assert.match(readFileSync(flow, "utf8"), /bookinfo-mesh|Service Mesh|istiod/i);
});
