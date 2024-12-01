import type z from "zod";
import { type ZodTypeAny, ZodError, ZodObject, z as zod } from "zod";
import superjson from "superjson";

const isAnyBuffer = (x: any): boolean => {
  return (
    x instanceof FormData ||
    x instanceof URLSearchParams ||
    x instanceof Blob ||
    x instanceof ArrayBuffer ||
    x instanceof ReadableStream ||
    x instanceof Uint8Array ||
    x instanceof Uint16Array ||
    x instanceof Uint32Array ||
    x instanceof Int8Array ||
    x instanceof Int16Array ||
    x instanceof Int32Array ||
    x instanceof Float32Array ||
    x instanceof Float64Array
  );
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

export const methodCanHaveBody = (method: string) =>
  !["GET", "OPTIONS", "HEAD", "TRACE"].includes(method.toUpperCase());

/**
 * Shared context for all routes
 */
export type Common = {
  request: Request;
};

type MethodEnds<Extras> = {
  [K in Methods | "any"]: <Ctx, T extends any>(
    handler: (ctx: Ctx & Extras) => T
  ) => {
    handler: (ctx: Ctx & Extras) => T;
    method: K;
  };
};

const generateMethods = <Extras>(inject: {}): MethodEnds<Extras> => ({
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
  any: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
    ({
      handler,
      ...inject,
      method: "any",
    } as const),
});

type MethodParams<Extras> = {
  params: <
    Schema extends Record<string, ZodTypeAny>,
    X extends { [K in keyof Schema]: z.infer<Schema[K]> },
    Extended = { params: X } & Extras
  >(
    schema: Schema
  ) => MethodEnds<Extended> &
    MethodBody<Extended> &
    MethodSearchParams<Extended>;
};

const generateParams = <Extras>(inject: {}): MethodParams<Extras> => ({
  params: <
    Schema extends Record<string, ZodTypeAny>,
    X extends { [K in keyof Schema]: z.infer<Schema[K]> }
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

type MethodSearchParams<Extras> = {
  searchParams: <
    Schema extends Record<string, ZodTypeAny>,
    X extends { [K in keyof Schema]: z.infer<Schema[K]> },
    Extended = { search: X } & Extras
  >(
    schema: Schema
  ) => MethodEnds<Extended> & MethodBody<Extended>;
};

const generateSearchParams = <
  Extras
>(inject: {}): MethodSearchParams<Extras> => ({
  searchParams: <
    Schema extends Record<string, ZodTypeAny>,
    X extends z.infer<ZodObject<{ [K in keyof Schema]: Schema[K] }>>
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

type MethodBody<Extras> = {
  body: <Schema extends ZodTypeAny, X extends z.infer<Schema>>(
    schema: Schema
  ) => MethodEnds<{ body: X } & Extras>;
};

const generateBody = <Extras>(inject: {}): MethodBody<Extras> => ({
  body: <Schema extends ZodTypeAny>(schema: Schema) => {
    inject = {
      ...inject,
      body: schema,
    };
    return {
      ...generateMethods<{ body: z.infer<Schema> } & Extras>(inject),
    };
  },
});

export const generate = <Extras>(inject: {}): MethodEnds<Extras> &
  MethodParams<Extras> &
  MethodSearchParams<Extras> &
  MethodBody<Extras> => ({
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
  any,
} = generate<{}>({});

type FilterMethods<Route, M extends Methods> = Route extends Array<any>
  ? Route[number] extends {
      method: infer SM;
      handler: (ctx: infer Ctx) => infer Rtn;
    }
    ? SM extends M
      ? Route[number]
      : SM extends "any"
      ? Route[number]
      : never
    : never
  : Route extends {
      method: infer SM;
      handler: (ctx: any) => any;
    }
  ? SM extends M
    ? Route
    : SM extends "any"
    ? Route
    : never
  : never;

type FilterResponse<Rtn> = Rtn extends Response ? any : Rtn;

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
    : { search?: Record<string, any> },
  ContextObject = IncludeContextOption extends true
    ? { context?: Context }
    : {
        headers?: Record<string, string>;
        fetchOptions?: RequestInitSlim;
      }
> = M extends "get" | "head" | "options" | "connect"
  ?
      | ((
          path: Path,
          opts?: ContextObject &
            (Ctx extends { body: infer B } ? { body: B } : {}) &
            SearchParamsObject
        ) => WrapWithPromise extends true
          ? Promise<FilterResponse<Awaited<Rtn>>>
          : FilterResponse<Rtn>)
      | ((
          path: ReplaceDynamicSegments<ParseRoute<Path>>,
          opts?: ContextObject &
            (Ctx extends { body: infer B } ? { body: B } : {}) &
            SearchParamsObject
        ) => WrapWithPromise extends true
          ? Promise<FilterResponse<Awaited<Rtn>>>
          : FilterResponse<Rtn>)
      | ((
          path: `${ReplaceDynamicSegments<ParseRoute<Path>>}?${string}`,
          opts?: ContextObject &
            (Ctx extends { body: infer B } ? { body: B } : {}) &
            SearchParamsObject
        ) => WrapWithPromise extends true
          ? Promise<FilterResponse<Awaited<Rtn>>>
          : FilterResponse<Rtn>)
  :
      | ((
          path: Path,
          body?: Ctx extends { body: infer B } ? B : {},
          opts?: ContextObject & SearchParamsObject
        ) => WrapWithPromise extends true
          ? Promise<FilterResponse<Awaited<Rtn>>>
          : FilterResponse<Rtn>)
      | ((
          path: ReplaceDynamicSegments<ParseRoute<Path>>,
          body?: Ctx extends { body: infer B } ? B : {},
          opts?: ContextObject & SearchParamsObject
        ) => WrapWithPromise extends true
          ? Promise<FilterResponse<Awaited<Rtn>>>
          : FilterResponse<Rtn>)
      | ((
          path: `${ReplaceDynamicSegments<ParseRoute<Path>>}?${string}`,
          body?: Ctx extends { body: infer B } ? B : {},
          opts?: ContextObject & SearchParamsObject
        ) => WrapWithPromise extends true
          ? Promise<FilterResponse<Awaited<Rtn>>>
          : FilterResponse<Rtn>);

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
        ? SM extends M | "any"
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

type BaseRouterMethods<T> = {
  handle(
    req: Request,
    opts?: {
      context?: T;
    }
  ): Promise<Response>;
  listen(opts?: { port?: number }): Promise<{
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
                    rawBody: any;
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
                    rawBody: any;
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

/**
 * Create a client for a router
 *
 * ```ts
 * const r = router({
 *  "/": get(() => "hello"),
 * });
 *
 * type Routes = typeof r;
 *
 * const c = client<Routes>();
 *
 * await c.get("/"); // "hello"
 * ```
 *
 * ```ts
 * // Passing request options
 *
 * const c = client<Routes>({
 *  baseUrl: "https://api.example.com",
 *  headers: async () => ({ Authorization: await getAuthToken() }),
 *  // fetch: customFetchFunction
 *  // fetchOptions: { mode: "cors" }
 * });
 *
 * await c.get("/", {
 *  headers: { "X-Custom-Header": "value" },
 * });
 *
 * ```
 */
export function client<
  T extends { routeDefinition: CommonRoutes<Routes, {}> },
  Routes = T["routeDefinition"]
>(opts?: {
  baseUrl?: string | (() => Promise<string> | string);
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
      if (!methodCanHaveBody(method)) {
        callOpts = body;
        body = undefined;
      }

      const baseUrl = opts?.baseUrl
        ? typeof opts.baseUrl == "function"
          ? await opts.baseUrl()
          : opts.baseUrl
        : "http://localhost";

      const url = new URL(path, baseUrl);

      for (let k of Object.keys(callOpts?.search ?? {})) {
        url.searchParams.append(k, callOpts.search[k]);
      }

      let headers = opts?.headers
        ? typeof opts.headers == "function"
          ? await opts.headers()
          : opts.headers
        : {};

      let encodedBody = null;
      let contentType = null;

      if (isAnyBuffer(body)) {
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
          "x-superjson": "true",
          ...headers,
        },
      }).then(async (res) => {
        if (res.status >= 400) {
          throw new TypePathStatusError(res.status, await res.text());
        } else {
          if (res.headers.get("content-type") == "application/octet-stream") {
            return await res.arrayBuffer();
          } else if (res.headers.get("content-type") == "application/json") {
            if (res.headers.get("x-superjson") == "true") {
              return superjson.parse(await res.text());
            } else {
              return await res.json();
            }
          } else {
            return await res.arrayBuffer();
          }
        }
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

type RouterOutput<Context, Routes extends CommonRoutes<Routes, Context>> = {
  [K in Methods]: CleanOverloads<Context, K, Routes, false, true>;
} & { routeDefinition: Routes } & BaseRouterMethods<Context>;

function routerInternal<
  Context extends {},
  Routes extends CommonRoutes<Routes, Context>
>(routes: Routes, context: () => Context): RouterOutput<Context, Routes> {
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
        pointer.parsers = {};

        if (item.searchParams) {
          pointer.parsers.searchParams = item.searchParams;
        }
        if (item.params) {
          pointer.parsers.params = item.params;
        }
        if (item.body) {
          pointer.parsers.body = item.body;
        }
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

      throw status(404, "Not found");
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
          throw status(404, "Not found");
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

      throw status(404, "Not found");
    };

    let node = rootNode;
    return explore("", node, 0, parts, {});
  };

  const generateMethodHandler = (method: Methods): any => {
    return (path: string, body?: any, opts?: any) => {
      if (!methodCanHaveBody(method)) {
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
        parsedSearch = zod.object(parsers.searchParams).parse(search);
      }

      const ctx = {
        rawParams: collectedParams,
        rawSearch: search,
        rawBody: body,
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

  const handle = async (
    req: Request,
    opts?: {
      context?: Context;
    }
  ) => {
    const url = new URL(req.url, "http://localhost");
    try {
      const method = req.method.toLowerCase() as Methods;

      if (!methodRoutes[method]) {
        throw status(405, "Method not allowed");
      }

      const path = url.pathname;
      const { handler, parsers, collectedParams } = routeMethod(method, path);

      const search = Object.fromEntries(url.searchParams.entries());

      let body = null;
      let rawBody = null;
      if (req.body && req.headers.get("content-type") == "application/json") {
        const bodyBuffer = await req.arrayBuffer();
        const bodyString = new TextDecoder().decode(bodyBuffer);
        rawBody = bodyString;
        body = JSON.parse(bodyString);
      } else if (req.body) {
        if (req.headers.get("content-type") == "text/plain") {
          const bodyBuffer = await req.arrayBuffer();
          const bodyString = new TextDecoder().decode(bodyBuffer);
          rawBody = bodyString;
        } else {
          rawBody = await req.arrayBuffer();
        }
      }

      let parsedBody = null;
      if (body && parsers?.body) {
        parsedBody = parsers.body.parse(body);
      } else if (parsers?.body && !body) {
        throw status(400, "Body required (application/json)");
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
        parsedSearch = zod.object(parsers.searchParams).parse(search);
      }

      const ctx = {
        rawParams: collectedParams,
        rawSearch: search,
        rawBody,
        request: req,
        ...(opts?.context ?? {}),
        ...(parsedBody ? { body: parsedBody } : {}),
        ...(parsedParams ? { params: parsedParams } : {}),
        ...(parsedSearch ? { search: parsedSearch } : {}),
      };

      const output = await handler(ctx);

      if (output instanceof Response) {
        return output;
      } else if (isAnyBuffer(output)) {
        return new Response(output, {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });
      } else {
        const useSuper = req.headers.get("x-superjson") == "true";
        return new Response(
          useSuper ? superjson.stringify(output) : JSON.stringify(output),
          {
            status: 200,
            headers: {
              ...(useSuper ? { "x-superjson": "true" } : {}),
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (e) {
      if (e instanceof TypePathStatusError) {
        return new Response(e.message, { status: e.status });
      } else if (e instanceof ZodError) {
        return new Response(e.toString(), { status: 400 });
      } else {
        console.error("Received while handling", url.pathname, e);
        return new Response("Internal server error", { status: 500 });
      }
    }

    // Translate the output to a response
  };

  return {
    routeDefinition: routes,
    ...methods,
    handle,
    listen: async (opts?: { port?: number }) => {
      const { port = 8080 } = opts ?? {};

      const importStr = `ht` + `tp`;
      const http = await import(importStr);
      const server = http.createServer(
        async (incomingMessage: any, res: any) => {
          const { method } = incomingMessage;
          const url = new URL(incomingMessage.url ?? "/", "http://localhost");

          // Extract the body if present
          const body = await new Promise((resolve, reject) => {
            let body: any[] = [];
            incomingMessage.on("data", (chunk: any) => body.push(chunk));
            incomingMessage.on("end", () => resolve(Buffer.concat(body)));
            incomingMessage.on("error", reject);
          });
          const headers = new Headers();
          for (const [key, value] of Object.entries(incomingMessage.headers)) {
            headers.set(key, value as string);
          }

          const req = new Request(url, {
            method,
            headers,
            body: methodCanHaveBody(method ?? "GET")
              ? body
              : (undefined as any),
          });
          handle(req)
            .then(async (result) => {
              res.statusCode = result.status;
              res.setHeaders(result.headers);
              // Stream a Response.body to res
              const reader = result.body?.getReader();
              if (reader) {
                const pump = async () => {
                  const { done, value } = await reader.read();
                  if (done) {
                    res.end();
                    return;
                  }
                  res.write(value);
                  await pump();
                };
                await pump();
              } else {
                res.end(await result.text());
              }
            })
            .catch((e) => {
              if (e instanceof TypePathStatusError) {
                res.statusCode = e.status;
                res.end(e.message);
              } else if (e instanceof ZodError) {
                res.statusCode = 400;
                res.end(e.toString());
              } else {
                console.error("Error while handling request", e);
                res.statusCode = 500;
                res.end("Internal server error");
              }
            });
        }
      );

      server.listen(port);

      return {
        close: () => {
          server.close();
        },
      };
    },
  };
}

/**
 * Create a router factory with a context type
 *
 * ```ts
 * // Define a router with a context type
 * const wsRouter = withContext<{ ws: WebSocket }>();
 *
 * // Create a router instance
 * const r = wsRouter({ "/": get(() => true) });
 *
 * // Passing context to the router
 * r.get("/", { context: { ws: ... } });
 */
export const withContext =
  <Context extends {}>() =>
  <Routes extends CommonRoutes<Routes, Context>>(routes: Routes) =>
    routerInternal(routes, (): Context => null as any) as RouterOutput<
      Context,
      Routes
    >;

/**
 * Create a router
 *
 * ```ts
 * import { router, get } from "typepath";
 *
 * const r = router({
 *   "/": get(() => "hello"),
 * });
 *
 * r.get("/");
 * ```
 */
export const router = withContext<{
  request: Request;
}>();

export class TypePathStatusError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
  }
}

/**
 * Create a status error throwable from a handler
 *
 * ```ts
 * router({
 *  "/": get(() => {
 *    throw status(404, "Not found");
 *   })
 * })
 * ```
 */
export const status = (code: number, message: string) => {
  return new TypePathStatusError(code, message);
};

/**
 * Create a guard that can be used to validate the request before it reaches the handler
 *
 * ```ts
 * const authGuard = makeGuard(async (ctx) => {
 *  const user = await auth(ctx.request.headers.get("Authorization"));
 *  if (!user) {
 *   throw status(401, "Unauthorized");
 *  }
 *
 *  return { user };
 * });
 *
 * // Usage
 * const r = router({
 * "/me/name": get(
 *   authGuard((ctx) => ctx.user.firstName)
 *  ),
 * });
 */
export const makeGuard = <
  X extends Promise<Record<string, any> | void> | Record<string, any> | void
>(
  guard: (ctx: {
    rawParams: Record<string, any>;
    rawSearch: Record<string, any>;
    rawBody: any;
    body?: any;
    params?: any;
    search?: any;
    request: Request;
  }) => X
) => {
  return <T, R>(
    fn: (ctx: T & Awaited<X>) => R
  ): ((ctx: T) => X extends Promise<any> ? Promise<R> : R) => {
    return (ctx: T) => {
      let res = guard(ctx as any);
      if (res instanceof Promise) {
        return res.then(() =>
          fn({
            ...ctx,
            ...res,
          } as any)
        ) as any;
      } else {
        return fn({
          ...ctx,
          ...res,
        } as any);
      }
    };
  };
};

export type ExtractRouterRoutes<Router extends RouterOutput<any, any>> =
  Router extends RouterOutput<any, infer R> ? keyof R : never;

export type ExtractRouterRoutesWithMethod<
  Router extends RouterOutput<any, any>,
  Method extends Methods
> = Router extends RouterOutput<any, infer R>
  ? {
      [K in keyof R]: R[K] extends { method: Method } ? K : never;
    }[keyof R]
  : never;

export type ExtractRouterRouteHandler<
  Router extends RouterOutput<any, any>,
  Method extends Methods,
  Path extends ExtractRouterRoutes<Router>,
  Filtered = Router extends RouterOutput<any, infer R>
    ? {
        [K in keyof R]: FilterMethods<R[K], Method>;
      }
    : never
> = Filtered extends { [K in Path]: infer X } ? X : never;

export type ExtractRouteBody<
  Router extends RouterOutput<any, any>,
  Method extends Methods,
  Path extends ExtractRouterRoutes<Router>
> = ExtractRouterRouteHandler<Router, Method, Path> extends {
  ctx: { body: infer B };
}
  ? B
  : never;

export type ExtractRouteParams<
  Router extends RouterOutput<any, any>,
  Method extends Methods,
  Path extends ExtractRouterRoutes<Router>,
  Extracted = ExtractRouterRouteHandler<Router, Method, Path>
> = Extracted extends {
  ctx: { params: infer P };
}
  ? P
  : ParamsFromRoute<ParseRoute<Path>>;

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
      limit: zod.number().max(100).min(1).default(10).optional(),
      page: zod.number().min(0).optional(),
    }).get((ctx) => "/test/:id" as const),
    "/test2/:id": body(
      zod.object({
        name: zod.string(),
      })
    ).post((ctx) => "/test2/:id" as const),
    "/add/:num": params({
      num: zod.coerce.number(),
    }).get((ctx) => "/add/:num" as const),
    "/hi/:abc": [get((ctx) => "/hi/:abc" as const), post(() => false)],
    "/list": get((ctx) => 1),
    "/any": any((ctx) => 1),
    "/response": get((ctx) => new Response("hi")),
  });

  type Ms = ExtractRouterRoutesWithMethod<typeof r, "get">;
  type XX = ExtractRouteParams<typeof r, "get", "/add/:num">;
  type XX2 = ExtractRouterRouteHandler<typeof r, "get", "/hi/:abc">;
  type XX3 = ExtractRouteBody<typeof r, "post", "/test2/:id">;

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
