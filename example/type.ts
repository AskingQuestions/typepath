import { any, body, client, get, post, router, searchParams } from "typepath";
import { z } from "zod";

const r = router({
  "/": body(
    z.object({
      name: z.string().min(3),
    })
  ).post((ctx) => {
    console.log(ctx);
    return { message: `Hello, ${ctx.body.name}!` };
  }),
});

r.listen({ port: 3001 });

console.log("Server running at http://localhost:3001/");

// Tests
() => {
  type TypeAssert<T, Expected> = T extends Expected ? true : false;
  type TypeFail<T, Expected> = T extends Expected ? false : true;

  const r = router({
    "/test/:id": searchParams({
      limit: z.number().max(100).min(1).default(10).optional(),
      page: z.number().min(0).optional(),
    }).get((ctx) => "/test/:id" as const),
    "/test2/:id": body(
      z.object({
        name: z.string(),
      })
    ).post((ctx) => "/test2/:id" as const),
    "/hi/:abc": [get((ctx) => "/hi/:abc" as const), post(() => false)],
    "/list": get((ctx) => 1),
    "/any": any((ctx) => 1),
    "/response": get((ctx) => new Response("hi")),
  });

  const c = client<typeof r>();
  let x = c.get("/hi/:abc");
  const res = r.get("/hi/:abc");
  const res2 = r.get("/test/:id");
  const res3 = r.post(`/test2/${1234}`, { name: "a" });
  const res4 = r.post("/hi/:abc");
  const res5 = r.head("/any");
  const res6 = r.get("/response");

  r.get("/list?abc=12q3");

  const testRes: TypeAssert<typeof res, "/hi/:abc"> = true;
  const testRes2: TypeAssert<typeof res2, "/test/:id"> = true;
  const testRes3: TypeAssert<typeof res3, "/test2/:id"> = true;
  const testRes4: TypeAssert<typeof res4, false> = true;
  const testRes5: TypeAssert<typeof res5, number> = true;
  const testX: TypeAssert<typeof x, Promise<"/hi/:abc">> = true;
  const testRes6: TypeAssert<typeof res6, any> = true;
};
