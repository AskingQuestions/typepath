globalThis.console = new console.Console({
  inspectOptions: {
    depth: null,
  },
  stdout: process.stdout,
  stderr: process.stderr,
});

import test from "node:test";
import { equal, throws } from "node:assert";
import {
  body,
  client,
  get,
  makeGuard,
  params,
  post,
  router,
  searchParams,
} from "./index";
import { z } from "zod";

test("router", (t) => {
  const r = router({
    "/test": [get((ctx) => "test"), post((ctx) => "test")],
    "/test/hello/:id": [get((ctx) => "test"), post((ctx) => "test")],
    "/abc": get(() => true),
    "/": get(() => true),

    "/:id": get((ctx) => ctx.rawParams.id),
    "/:id/:name": get((ctx) => ctx.rawParams.id + ctx.rawParams.name),
    "/:id/:name/:age": get(
      (ctx) => ctx.rawParams.id + ctx.rawParams.name + ctx.rawParams.age
    ),
    "/:id/test/:age/abc": get((ctx) => ctx.rawParams.id + ctx.rawParams.age),
    "/...rest": get((ctx) => "rest(" + ctx.rawParams.rest + ")"),
  });

  equal(r.get("/test"), "test");
  equal(r.post("/test"), "test");
  equal(r.get("/test/hello/123"), "test");
  equal(r.post("/test/hello/123"), "test");
  equal(r.get("/abc"), true);
  equal(r.get("/"), true);
  equal(r.get("/123"), "123");
  equal(r.get("/123/abc"), "123abc");
  equal(r.get("/123/abc/456"), "123abc456");
  equal(r.get("/123/test/456/abc"), "123456");
  equal(r.get("/a/b/c"), "abc");
  equal(r.get("/a/b/c/d"), "rest(a/b/c/d)");
  equal(r.get("/a/b/c/d/e"), "rest(a/b/c/d/e)");
  equal(r.get("/a/b/c/d/e/f"), "rest(a/b/c/d/e/f)");
  equal(r.get("/a/b/c/d/e/f/g"), "rest(a/b/c/d/e/f/g)");
});

test("body", (t) => {
  const r = router({
    "/create": body(
      z.object({
        name: z.string(),
      })
    ).post((ctx) => ctx.body.name),
  });

  equal(r.post("/create", { name: "test" }), "test");
});

test("params", (t) => {
  const r = router({
    "/create/:name": params({
      name: z.string().min(3),
    }).post((ctx) => ctx.params.name),
  });

  equal(r.post("/create/test"), "test");
  throws(() => r.post("/create/te"));
});

test("search", (t) => {
  const r = router({
    "/search": searchParams({
      q: z.string(),
    }).get((ctx) => ctx.search.q),
  });

  equal(r.get("/search?q=test"), "test");
});

test("guard", async (t) => {
  const guard = makeGuard((ctx) => {
    if (ctx.params.id !== "123") {
      throw new Error("Not found");
    }
  });
  const guardPromise = makeGuard(async (ctx) => {
    if (ctx.params.id !== "123") {
      throw new Error("Not found");
    }
  });
  const guardValue = makeGuard((ctx) => ({ guarded: true }));

  const multiGuard1 = makeGuard((ctx) => {
    return { a: 1 };
  });

  const multiGuard2 = makeGuard((ctx) => {
    return { b: 2 };
  });

  const r = router({
    "/user/:id": params({ id: z.string() }).get(
      guard((ctx) => "test" as const)
    ),
    "/promise/:id": params({ id: z.string() }).get(
      guardPromise((ctx) => "test" as const)
    ),
    "/value/:id": params({ id: z.string() }).get(
      guardValue((ctx) => ctx.guarded)
    ),
    "/multi": get(
      multiGuard1(
        multiGuard2((ctx) => {
          return ctx.a + ctx.b;
        })
      )
    ),
  });

  equal(r.get("/user/123"), "test");
  throws(() => r.get("/user/124"));
  const res = r.get("/promise/123");
  equal(res instanceof Promise, true);
  equal(await res, "test");
  equal(r.get("/value/123"), true);
  equal(r.get("/multi"), 3);
});

test("client", async (t) => {
  const app = router({
    "/": get((ctx) => "hello"),
    "/time": get((ctx) => new Date()),
    "/body": body(z.string()).post((ctx) => ctx.body),
    "/params/:id": params({ id: z.string() }).get((ctx) => ctx.params.id),
    "/search": searchParams({ q: z.string() }).get((ctx) => ctx.search.q),
  });

  const server = await app.listen({ port: 8081 });
  try {
    const c = client<typeof app>({
      baseUrl: "http://localhost:8081",
    });

    equal(await c.get("/"), "hello");
    equal((await c.get("/time")) instanceof Date, true);
    equal(await c.post("/body", "test"), "test");

    equal(await c.get("/params/123"), "123");
    equal(await c.get("/search?q=abc"), "abc");
  } catch (e) {
    throw e;
  } finally {
    await server.close();
  }
});

test("binary", async (t) => {
  const app = router({
    "/": post((ctx) => {
      if (ctx.rawBody instanceof ArrayBuffer) {
        return new Uint8Array(ctx.rawBody)[0] === 1;
      }

      return false;
    }),
  });

  const server = await app.listen({ port: 8082 });
  try {
    const c = client<typeof app>({
      baseUrl: "http://localhost:8082",
    });

    equal(await c.post("/", new Uint8Array([1])), true);
    equal(app.post("/", new Uint8Array([1]).buffer), true);
  } catch (e) {
    throw e;
  } finally {
    await server.close();
  }
});
