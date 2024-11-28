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
type VarChar = ":" | "...";
type ParseRoute<T extends string> =
  T extends `${infer Static}${VarChar}${infer Param}/${infer Rest}`
    ? `${Static}\${${Param}}/${ParseRoute<Rest>}`
    : T extends `${infer Static}${VarChar}${infer Param}`
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
  T extends `${string}${VarChar}${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ParamsFromRoute<`/${Rest}`>
    : T extends `${string}${VarChar}${infer Param}`
    ? { [K in Param]: string }
    : {};

/**
 * Shared context for all routes
 */
export type Common = {
  request: Request;
};

const generateMethods = <Extras>(inject: {}) => ({
  get: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "get",
    } as const),
  post: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "post",
    } as const),
  put: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "put",
    } as const),
  delete: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "delete",
    } as const),
  patch: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "patch",
    } as const),
  options: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "options",
    } as const),
  head: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "head",
    } as const),
});

const generateParams = <Extras>(inject: {}) => ({
  params: <
    Schema extends Record<string, ZodTypeAny>,
    X extends { [K in keyof Schema]: ZodInfer<Schema[K]> }
  >(
    schema: Schema
  ) => {
    inject = {
      ...inject,
      params: schema,
    };
    return {
      ...generateMethods<{ params: X } & Extras>(inject),
      ...generateSearchParams<{ params: X } & Extras>(inject),
      ...generateBody<{ params: X } & Extras>(inject),
    };
  },
});
const generateSearchParams = <Extras>(inject: {}) => ({
  searchParams: <
    Schema extends Record<string, ZodTypeAny>,
    X extends { [K in keyof Schema]?: ZodInfer<Schema[K]> }
  >(
    schema: Schema
  ) => {
    inject = {
      ...inject,
      searchParams: schema,
    };
    return {
      ...generateMethods<{ search: X } & Extras>(inject),
      ...generateBody<{ search: X } & Extras>(inject),
    };
  },
});
const generateBody = <Extras>(inject: {}) => ({
  body: <Schema extends ZodTypeAny>(schema: Schema) => {
    inject = {
      ...inject,
      body: schema,
    };
    return {
      ...generateMethods<{ body: ZodInfer<Schema> } & Extras>(inject),
    };
  },
});

export const generate = <Extras>(inject: {}) => ({
  ...generateMethods<Extras>(inject),
  ...generateParams<Extras>(inject),
  ...generateSearchParams<Extras>(inject),
  ...generateBody<Extras>(inject),
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
} = generate<{}>({});

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
  listen(opts?: { port?: number; transformer?: Transformer }): Promise<{
    close: () => void;
  }>;
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
                    rawSearch: Record<string, any>;
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
                    rawSearch: Record<string, any>;
                  } & Context
                ) => Rtn;
                method: M;
              }
            : never)
    : never;
};

interface Transformer {
  stringify: (input: any) => string;
  parse: (input: string) => any;
}

type RequestInitSlim = Omit<RequestInit, "body" | "method" | "headers">;

export function client<
  T extends { routeDefinition: CommonRoutes<Routes, {}> },
  Routes = T["routeDefinition"]
>(opts?: {
  baseUrl?: string;
  headers?:
    | Record<string, string>
    | (() => Promise<Record<string, string>> | Record<string, string>);
  fetch?: typeof fetch;
  fetchOptions?: RequestInitSlim | (() => Promise<RequestInitSlim>);
  transformer?: Transformer;
}) {
  const { transformer = superjson } = opts ?? {};
  const ftch = opts?.fetch ?? fetch;

  const generateMethodHandler = (method: Methods): any => {
    return async (path: string, body?: any, callOpts?: any) => {
      if (method == "get" || method == "head" || method == "options") {
        callOpts = body;
        body = undefined;
      }

      const url = new URL(path, opts?.baseUrl ?? "http://localhost");

      for (let k of Object.keys(callOpts?.search ?? {})) {
        url.searchParams.append(k, callOpts.search[k]);
      }

      let encodedBody = null;
      let contentType = null;

      if (
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        body instanceof ReadableStream
      ) {
        encodedBody = body;

        if (body instanceof FormData) {
          contentType = "multipart/form-data";
        } else if (body instanceof URLSearchParams) {
          contentType = "application/x-www-form-urlencoded";
        } else if (body instanceof Blob) {
          contentType = body.type;
        } else if (body instanceof ArrayBuffer) {
          contentType = "application/octet-stream";
        } else if (body instanceof ReadableStream) {
          contentType = "application/octet-stream";
        } else {
          contentType = "application/octet-stream";
        }
      } else if (body) {
        encodedBody = JSON.stringify(body);
        contentType = "application/json";
      }

      let headers = opts?.headers
        ? typeof opts.headers == "function"
          ? await opts.headers()
          : opts.headers
        : {};

      if (callOpts?.headers) {
        headers = {
          ...headers,
          ...callOpts.headers,
        };
      }

      let fetchOptions = opts?.fetchOptions
        ? typeof opts.fetchOptions == "function"
          ? await opts.fetchOptions()
          : opts.fetchOptions
        : {};

      if (callOpts?.fetchOptions) {
        fetchOptions = {
          ...fetchOptions,
          ...callOpts.fetchOptions,
        };
      }

      return await ftch(url.toString(), {
        ...fetchOptions,
        method: method.toUpperCase(),
        ...(encodedBody ? { body: encodedBody } : {}),
        headers: {
          ...(contentType ? { "Content-Type": contentType } : {}),
          ...headers,
        },
      }).then(async (res) => {
        const data = await res.text();
        return transformer.parse(data);
      });
    };
  };

  const methods = {
    get: generateMethodHandler("get"),
    post: generateMethodHandler("post"),
    put: generateMethodHandler("put"),
    delete: generateMethodHandler("delete"),
    patch: generateMethodHandler("patch"),
    options: generateMethodHandler("options"),
    head: generateMethodHandler("head"),
  };

  return methods as {
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
    const list: {
      path: string;
      body?: ZodTypeAny;
      searchParams?: Record<string, ZodTypeAny>;
      params?: Record<string, ZodTypeAny>;
      handler: (c: any) => any;
    }[] = [];

    const keys = Object.keys(routes);
    for (let k of keys) {
      const v = (routes as any)[k];
      if (Array.isArray(v)) {
        const match = v.find((r) => r.method == m);
        if (match) {
          list.push({
            path: k,
            body: match.body,
            searchParams: match.searchParams,
            params: match.params,
            handler: match.handler,
          });
        }
      } else {
        if (v.method == m) {
          list.push({
            path: k,
            body: v.body,
            searchParams: v.searchParams,
            params: v.params,
            handler: v.handler,
          });
        }
      }
    }

    type Node = {
      handler?: (c: any) => any;
      parsers?: {
        body?: ZodTypeAny;
        searchParams?: Record<string, ZodTypeAny>;
        params?: Record<string, ZodTypeAny>;
      };
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
          subnode.parsers = {};

          if (item.searchParams) {
            subnode.parsers.searchParams = item.searchParams;
          }
          if (item.params) {
            subnode.parsers.params = item.params;
          }
          if (item.body) {
            subnode.parsers.body = item.body;
          }
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
        return {
          handler: rootNode.handler,
          parsers: rootNode.parsers,
          collectedParams: {},
          depth: 0,
          handlerPath: "/",
        };
      }

      throw new Error("Path not found " + path);
    }

    const explore = (
      handlerPath: string,
      node: any,
      depth: number,
      parts: string[],
      collectedParams: {} = {}
    ) => {
      if (depth == parts.length) {
        if (node.handler) {
          return {
            handler: node.handler,
            parsers: node.parsers,
            collectedParams,
            depth: depth,
            handlerPath,
          };
        } else {
          throw new Error("Path not found " + path);
        }
      }

      const part = parts[depth];

      if (node.children[part]) {
        try {
          return explore(
            handlerPath + "/" + part,
            node.children[part],
            depth + 1,
            parts,
            collectedParams
          );
        } catch (e) {}
      }

      for (let c of Object.keys(node.children)) {
        if (c.startsWith(":")) {
          try {
            return explore(
              handlerPath + "/" + c,
              node.children[c],
              depth + 1,
              parts,
              {
                ...collectedParams,
                [c.slice(1)]: part,
              }
            );
          } catch (e) {
            continue;
          }
        }
      }

      // Try to find a ...
      for (let c of Object.keys(node.children)) {
        if (c.startsWith("...")) {
          // Collect all remaining parts and find matching handler
          const remainingParts = parts.slice(depth);
          const remainingPath = remainingParts.join("/");
          return {
            handler: node.children[c].handler,
            parsers: node.children[c].parsers,
            collectedParams: {
              ...collectedParams,
              [c.slice(3)]: remainingPath,
            },
            depth: depth + remainingParts.length,
            handlerPath: handlerPath + "/" + c,
          };
        }
      }

      throw new Error("Path not found " + path);
    };

    let node = rootNode;
    return explore("", node, 0, parts, {});
  };

  const generateMethodHandler = (method: Methods): any => {
    return (path: string, body?: any, opts?: any) => {
      if (method == "get" || method == "head" || method == "options") {
        opts = body;
        body = undefined;
      }

      const url = new URL(path, "http://localhost");
      const pathname = url.pathname;
      const { handler, parsers, collectedParams } = routeMethod(
        method,
        pathname
      );

      const search = {
        ...Object.fromEntries(url.searchParams.entries()),
        ...opts?.search,
      };

      let parsedBody = null;
      if (body && parsers?.body) {
        parsedBody = parsers.body.parse(body);
      }

      let parsedParams: Record<string, any> | null = null;
      if (parsers?.params) {
        parsedParams = {};
        for (let k of Object.keys(parsers.params)) {
          parsedParams[k] = parsers.params[k].parse(
            (collectedParams as any)[k]
          );
        }
      }

      let parsedSearch: Record<string, any> | null = null;
      if (parsers?.searchParams) {
        parsedSearch = {};
        for (let k of Object.keys(parsers.searchParams)) {
          parsedSearch[k] = parsers.searchParams[k].parse(search[k]);
        }
      }

      const ctx = {
        rawParams: collectedParams,
        rawSearch: search,
        ...(opts?.context ?? {}),
        ...(parsedBody ? { body: parsedBody } : {}),
        ...(parsedParams ? { params: parsedParams } : {}),
        ...(parsedSearch ? { search: parsedSearch } : {}),
      };

      return handler(ctx);
    };
  };

  const methods = {
    get: generateMethodHandler("get"),
    post: generateMethodHandler("post"),
    put: generateMethodHandler("put"),
    delete: generateMethodHandler("delete"),
    patch: generateMethodHandler("patch"),
    options: generateMethodHandler("options"),
    head: generateMethodHandler("head"),
  };

  const handle = async (req: Request) => {
    const url = new URL(req.url, "http://localhost");
    const method = req.method.toLowerCase() as Methods;

    if (!methodRoutes[method]) {
      throw new Error("Method not allowed " + method);
    }

    const path = url.pathname;
    const { handler, parsers, collectedParams } = routeMethod(method, path);

    const search = Object.fromEntries(url.searchParams.entries());

    let body = null;
    if (req.body) {
      const bodyBuffer = await req.arrayBuffer();
      const bodyString = new TextDecoder().decode(bodyBuffer);
      body = JSON.parse(bodyString);
    }

    let parsedBody = null;
    if (body && parsers?.body) {
      parsedBody = parsers.body.parse(body);
    }

    let parsedParams: Record<string, any> | null = null;
    if (parsers?.params) {
      parsedParams = {};
      for (let k of Object.keys(parsers.params)) {
        parsedParams[k] = parsers.params[k].parse((collectedParams as any)[k]);
      }
    }

    let parsedSearch: Record<string, any> | null = null;
    if (parsers?.searchParams) {
      parsedSearch = {};
      for (let k of Object.keys(parsers.searchParams)) {
        parsedSearch[k] = parsers.searchParams[k].parse(search[k]);
      }
    }

    const ctx = {
      rawParams: collectedParams,
      rawSearch: search,
      request: req,
      ...(parsedBody ? { body: parsedBody } : {}),
      ...(parsedParams ? { params: parsedParams } : {}),
      ...(parsedSearch ? { search: parsedSearch } : {}),
    };

    return handler(ctx);
  };

  return {
    routeDefinition: routes,
    ...methods,
    handle,
    listen: async (opts?: { port?: number; transformer?: Transformer }) => {
      const { port = 8080, transformer = superjson } = opts ?? {};

      const http = await import("http");
      const server = http.createServer((req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const request = new Request(url, {
          method: req.method,
          headers: req.headers as any,
          body:
            req.method == "GET" ||
            req.method == "HEAD" ||
            req.method == "OPTIONS"
              ? null
              : (req as any),
        });
        handle(request).then((result) => {
          res.end(transformer.stringify(result));
        });
      });

      server.listen(port);

      return {
        close: () => {
          server.close();
        },
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
