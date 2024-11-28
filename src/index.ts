import { type ZodTypeAny, type infer as ZodInfer, z } from "zod";
import superjson from "superjson";

type ReplaceAllStringsInArray<T extends any[], X> = {
  [K in keyof T]: T[K] extends string ? X : T[K];
};

// Preserve string, number, boolean, null, undefined, object, Date, and Array types
// type BaseTransformer<X> = X extends Date
//   ? Date
//   : X extends Array<any>

//   ?  {
//     [K in keyof X]: BaseTransformer<X[K]>
//   }
//   : X extends object
//   ? { [K in keyof X]: BaseTransformer<X[K]> }
//   : X extends string | number | boolean | null | undefined
//   ? X
//   : string;

type Merge<T> = T extends object ? { [K in keyof T]: Merge<T[K]> } : T;

// Parse route template with dynamic `:xyz` segments
type ParseRoute<T extends string> =
  T extends `${infer Static}:${infer Param}/${infer Rest}`
    ? `${Static}\${${Param}}/${ParseRoute<Rest>}`
    : T extends `${infer Static}:${infer Param}`
    ? `${Static}\${${Param}}`
    : T;

// Convert route into a stricter type for specific values
type ReplaceDynamicSegments<T extends string> =
  T extends `${infer Static}\${${string}}/${infer Rest}`
    ? `${Static}${string}/${ReplaceDynamicSegments<Rest>}`
    : T extends `${infer Static}\${${string}}`
    ? `${Static}${string}`
    : T;

// Convert route params into an object with keys
type ParamsFromRoute<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ParamsFromRoute<`/${Rest}`>
    : T extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : {};

/**
 * Shared context for all routes
 */
export type Common = {
  request: Request;
};

const generateMethods = <Extras>() => ({
  get: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      method: "get",
    } as const),
  post: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      method: "post",
    } as const),
  put: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      method: "put",
    } as const),
  delete: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      method: "delete",
    } as const),
  patch: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      method: "patch",
    } as const),
  options: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      method: "options",
    } as const),
  head: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      method: "head",
    } as const),
});

const generateParams = <Extras>() => ({
  params: <
    Schema extends Record<string, ZodTypeAny>,
    X extends { [K in keyof Schema]: ZodInfer<Schema[K]> }
  >(
    schema: Schema
  ) => {
    return {
      ...generateMethods<{ params: X } & Extras>(),
      ...generateSearchParams<{ params: X } & Extras>(),
      ...generateBody<{ params: X } & Extras>(),
    };
  },
});
const generateSearchParams = <Extras>() => ({
  searchParams: <
    Schema extends Record<string, ZodTypeAny>,
    X extends { [K in keyof Schema]?: ZodInfer<Schema[K]> }
  >(
    schema: Schema
  ) => {
    return {
      ...generateMethods<{ searchParams: X } & Extras>(),
      ...generateBody<{ searchParams: X } & Extras>(),
    };
  },
});
const generateBody = <Extras>() => ({
  body: <Schema extends ZodTypeAny>(schema: Schema) => ({
    ...generateMethods<{ body: ZodInfer<Schema> } & Extras>(),
  }),
});

export const generate = <Extras>() => ({
  ...generateMethods<Extras>(),
  ...generateParams<Extras>(),
  ...generateSearchParams<Extras>(),
  ...generateBody<Extras>(),
});

type Methods = "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export const {
  get,
  post,
  put,
  patch,
  options,
  head,
  params,
  searchParams,
  body,
} = generate<{}>();

type FilterMethods<Route, M extends Methods> = Route extends Array<any>
  ? Route[number] extends {
      method: infer SM;
      handler: (ctx: infer Ctx) => infer Rtn;
    }
    ? SM extends M
      ? Route[number]
      : never
    : never
  : Route extends {
      method: infer SM;
      handler: (ctx: any) => any;
    }
  ? SM extends M
    ? Route
    : never
  : never;

type GenerateCaller<
  M,
  Path extends string,
  Ctx,
  Rtn,
  Context,
  WrapWithPromise,
  IncludeContextOption,
  SearchParamsObject = Ctx extends { searchParams: infer SP }
    ? { search?: SP }
    : {},
  ContextObject = IncludeContextOption extends true ? { context?: Context } : {}
> = M extends "get" | "head" | "options" | "connect"
  ?
      | ((
          path: Path,
          opts?: ContextObject &
            (Ctx extends { body: infer B } ? { body: B } : {}) &
            SearchParamsObject
        ) => WrapWithPromise extends true ? Promise<Rtn> : Rtn)
      | ((
          path: ReplaceDynamicSegments<ParseRoute<Path>>,
          opts?: ContextObject &
            (Ctx extends { body: infer B } ? { body: B } : {}) &
            SearchParamsObject
        ) => WrapWithPromise extends true ? Promise<Rtn> : Rtn)
      | ((
          path: `${ReplaceDynamicSegments<ParseRoute<Path>>}?${string}`,
          opts?: ContextObject &
            (Ctx extends { body: infer B } ? { body: B } : {}) &
            SearchParamsObject
        ) => WrapWithPromise extends true ? Promise<Rtn> : Rtn)
  :
      | ((
          path: Path,
          body?: Ctx extends { body: infer B } ? B : {},
          opts?: ContextObject & SearchParamsObject
        ) => WrapWithPromise extends true ? Promise<Rtn> : Rtn)
      | ((
          path: ReplaceDynamicSegments<ParseRoute<Path>>,
          body?: Ctx extends { body: infer B } ? B : {},
          opts?: ContextObject & SearchParamsObject
        ) => WrapWithPromise extends true ? Promise<Rtn> : Rtn)
      | ((
          path: `${ReplaceDynamicSegments<ParseRoute<Path>>}?${string}`,
          body?: Ctx extends { body: infer B } ? B : {},
          opts?: ContextObject & SearchParamsObject
        ) => WrapWithPromise extends true ? Promise<Rtn> : Rtn);

// Generate user-facing overloads
type CleanOverloads<
  Extras,
  M extends Methods,
  Routes extends CommonRoutes<Routes, Extras>,
  WrapWithPromise = false,
  EnableCallContext = false,
  Filtered = {
    [K in keyof Routes]: FilterMethods<Routes[K], M>;
  }
> = ConvertFromUnionToOverload<
  Overloads<{
    [X in keyof Filtered]: X extends string
      ? Filtered[X] extends {
          method: infer SM;
          handler: infer H;
        }
        ? SM extends M
          ? H extends (ctx: infer Ctx) => infer Rtn
            ? GenerateCaller<
                M,
                X,
                Ctx,
                Rtn,
                Extras,
                WrapWithPromise,
                EnableCallContext
              >
            : never
          : never
        : never
      : never;
  }>
>;
// | Overloads<{
//     [X in keyof Filtered]: X extends string
//       ? Filtered[X] extends {
//           method: infer SM;
//           handler: infer H;
//         }
//         ? SM extends M
//           ? H extends (ctx: infer Ctx) => infer Rtn
//             ? (
//                 path: ReplaceDynamicSegments<ParseRoute<X>>,
//                 payload?: {
//                   body?: Ctx extends { body: infer B } ? B : never;
//                   context?: Extras;
//                 }
//               ) => WrapWithPromise extends true ? Promise<Rtn> : Rtn
//             : never
//           : never
//         : never
//       : never;
//   }>

type SubOverloads<
  T extends { [K in keyof T]: (...args: any[]) => any },
  K extends keyof T
> = T[K];

type Overloads<
  Obj extends {
    [K in keyof Obj]: (...args: any[]) => any;
  }
> = SubOverloads<Obj, keyof Obj>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type ConvertFromUnionToOverload<T> = UnionToIntersection<
  T extends (...arg: infer A) => infer R ? (...arg: A) => R : never
>;

type BaseRouterMethods = {
  handle(req: Request): Promise<Response>;
  listen(opts?: { port?: number; transformer: Transformer }): {
    close: () => void;
  };
};

type CommonRoutes<Routes, Context> = {
  [K in keyof Routes]: K extends string
    ?
        | (Routes[K] extends {
            method: infer M;
            handler: (ctx: infer Ctx) => infer Rtn;
          }[]
            ? {
                handler: (
                  ctx: Ctx & {
                    rawParams: Merge<ParamsFromRoute<K>>;
                  } & Context
                ) => Rtn;
                method: M;
              }[]
            : never)
        | (Routes[K] extends {
            method: infer M;
            handler: (ctx: infer Ctx) => infer Rtn;
          }
            ? {
                handler: (
                  ctx: Ctx & {
                    rawParams: Merge<ParamsFromRoute<K>>;
                  } & Context
                ) => Rtn;
                method: M;
              }
            : never)
    : never;
};

interface Transformer {
  serialize: (input: any) => any;
  deserialize: (input: any) => any;
}

export function client<
  T extends { routeDefinition: CommonRoutes<Routes, {}> },
  Routes = T["routeDefinition"]
>(opts?: { fetch?: typeof fetch; transformer?: Transformer }) {
  const { transformer = superjson } = opts ?? {};
  const ftch = opts?.fetch ?? fetch;

  return null as unknown as {
    [K in Methods]: Routes extends CommonRoutes<Routes, any>
      ? CleanOverloads<{}, K, Routes, true, false>
      : never;
  };
}

function routerInternal<
  Context extends {},
  Routes extends CommonRoutes<Routes, Context>
>(
  routes: Routes,
  context: () => Context
): {
  [K in Methods]: CleanOverloads<Context, K, Routes, false, true>;
} & { routeDefinition: Routes } & BaseRouterMethods {
  const extractRoutes = (m: Methods) => {
    const list: { path: string; handler: (c: any) => any }[] = [];

    const keys = Object.keys(routes);
    for (let k of keys) {
      const v = (routes as any)[k];
      if (Array.isArray(v)) {
        const match = v.find((r) => r.method == m);
        if (match) {
          list.push({
            path: k,
            handler: match.handler,
          });
        }
      } else {
        if (v.method == m) {
          list.push({
            path: k,
            handler: v.handler,
          });
        }
      }
    }

    type Node = {
      handler?: (c: any) => any;
      children: Record<string, Node>;
    };

    const trie: Node = { children: {} };

    for (let item of list) {
      const parts = item.path.split("/");
      if (parts[0] == "") parts.shift();

      let pointer = trie;
      if (item.path == "/" || item.path == "") {
        pointer.handler = item.handler;
        continue;
      }

      for (let i = 0; i < parts.length; i++) {
        const last = i == parts.length - 1;

        let subnode = pointer.children[parts[i]];
        if (!subnode) {
          subnode = pointer.children[parts[i]] = { children: {} };
        }

        if (last) {
          subnode.handler = item.handler;
        }

        pointer = subnode;
      }
    }

    return trie;
  };

  const methodRoutes = {
    get: extractRoutes("get"),
    post: extractRoutes("post"),
    put: extractRoutes("put"),
    delete: extractRoutes("delete"),
    patch: extractRoutes("patch"),
    options: extractRoutes("options"),
    head: extractRoutes("head"),
  };

  const routeMethod = (method: Methods, path: string) => {
    const rootNode = methodRoutes[method];

    const parts = path.split("/");
    if (parts.length > 0 && parts[0] == "") {
      parts.shift();
    }
    if (path == "" || path == "/") {
      if (rootNode.handler) {
        return rootNode.handler;
      }

      throw new Error("Path not found " + path);
    }

    let node = rootNode;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (node.children[part]) {
        node = node.children[part];
        if (i == parts.length - 1) {
          return node.handler;
        }
      } else {
        // let mostSpecific = null;
        // for (let c of Object.keys(node.children)) {
        //   if (c.startsWith(":")) {
        //     try {

        //     }
        //   }

        // }

        throw new Error("Path not found " + path);
      }
    }
  };

  const generateMethodHandler = (method: Methods): any => {};

  const methods = {
    get: generateMethodHandler("get"),
    post: generateMethodHandler("post"),
    put: generateMethodHandler("put"),
    delete: generateMethodHandler("delete"),
    patch: generateMethodHandler("patch"),
    options: generateMethodHandler("options"),
    head: generateMethodHandler("head"),
  };

  console.log(methodRoutes);
  console.log(routeMethod("post", "/test"));

  return {
    routeDefinition: routes,
    ...methods,
    handle: async (req: Request) => {
      const url = new URL(req.url);

      const method = req.method.toLowerCase();

      return new Response("OK");
    },
    listen: (opts?: { port?: number; transformer?: Transformer }) => {
      const { port = 8080, transformer = superjson } = opts ?? {};

      return {
        close: () => {},
      };
    },
  };
}

export const withContext =
  <Context extends {}>() =>
  <Routes extends CommonRoutes<Routes, Context>>(routes: Routes) =>
    routerInternal(routes, (): Context => null as any);

export const router = withContext<{
  request: Request;
}>();

// Tests
() => {
  type TypeAssert<T, Expected> = T extends Expected ? true : false;
  type TypeFail<T, Expected> = T extends Expected ? false : true;

  const testUnionFunction: TypeAssert<
    ConvertFromUnionToOverload<
      ((a: string) => number) | ((a: number) => string)
    >,
    { (a: string): number; (a: number): string }
  > = true;

  const testParams: TypeAssert<
    ParamsFromRoute<"user/:id/post/:postId">,
    { id: string; postId: string }
  > = true;

  const testParseRoute: TypeAssert<
    ParseRoute<"user/:id/post/:postId">,
    "user/${id}/post/${postId}"
  > = true;

  const testReplaceDynamicSegments: TypeAssert<
    ReplaceDynamicSegments<"user/${id}/post/${postId}">,
    `user/${string}/post/${string}`
  > = true;

  const testBadRoute: TypeFail<
    ReplaceDynamicSegments<"user/${id}/post/${postId}">,
    `user/${string}/post2/${number}`
  > = true;

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
  });

  const c = client<typeof r>();
  let x = c.get("/hi/:abc");
  const res = r.get("/hi/:abc");
  const res2 = r.get("/test/:id");
  const res3 = r.post(`/test2/${1234}`, { name: "a" });
  const res4 = r.post("/hi/:abc");
  r.get("/list?abc=12q3");

  const testRes: TypeAssert<typeof res, "/hi/:abc"> = true;
  const testRes2: TypeAssert<typeof res2, "/test/:id"> = true;
  const testRes3: TypeAssert<typeof res3, "/test2/:id"> = true;
  const testRes4: TypeAssert<typeof res4, false> = true;
  const testX: TypeAssert<typeof x, Promise<"/hi/:abc">> = true;
};
