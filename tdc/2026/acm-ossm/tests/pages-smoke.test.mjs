import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "out");

test("Pages export includes OSSM home and no painel or CNAME", () => {
  assert.ok(existsSync(join(root, "index.html")), "out/index.html");
  assert.ok(!existsSync(join(root, "painel")), "out/painel must not exist");
  assert.ok(!existsSync(join(root, "CNAME")), "out/CNAME must not exist");
  assert.match(
    readFileSync(join(root, "index.html"), "utf8"),
    /bookinfo-mesh|Service Mesh|istiod/i,
  );
});

test("Pages export includes mTLS primer page", () => {
  const mtls = join(root, "mtls", "index.html");
  assert.ok(existsSync(mtls), "out/mtls/index.html");
  assert.match(readFileSync(mtls, "utf8"), /mTLS|Mutual TLS|Certificate/i);
});
