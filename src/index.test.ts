globalThis.console = new console.Console({
  inspectOptions: {
    depth: null,
  },
  stdout: process.stdout,
  stderr: process.stderr,
});

import test from "node:test";
import assert from "node:assert";
import { client, get, post, router } from ".";

test("router", (t) => {
  const r = router({
    "/test": [get((ctx) => "test"), post((ctx) => "test")],
    "/test/hello/:id": [get((ctx) => "test"), post((ctx) => "test")],
    "/abc": get(() => true),
    "/": get(() => true),
  });
  // r.listen({ port: 8080 });

  assert(r.get("/test"), "test");
});
