import type { ZodTypeAny, infer as ZodInfer } from "zod";

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
  del: <Ctx, T extends any>(handler: (ctx: Ctx & Extras) => T) =>
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
      ...generateBody<{ params: X } & Extras>(),
    };
  },
});
const generateBody = <Extras>() => ({
  body: <Schema extends ZodTypeAny>(schema: Schema) => ({
    ...generateMethods<{ body: ZodInfer<Schema> } & Extras>(),
    ...generateParams<{ body: ZodInfer<Schema> } & Extras>(),
  }),
});

export const generate = <Extras>() => ({
  ...generateMethods<Extras>(),
  ...generateParams<Extras>(),
  ...generateBody<Extras>(),
});

type Methods = "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export const { get, post, put, del, patch, options, head, params, body } =
  generate<Common>();

// Generate user-facing overloads
type CleanOverloads<
  M extends Methods,
  Routes extends {
    [K in keyof Routes]: K extends string
      ?
          | (Routes[K] extends {
              method: M;
              handler: (ctx: infer Ctx) => infer Rtn;
            }[]
              ? {
                  handler: (
                    ctx: Ctx & {
                      rawParams: Merge<ParamsFromRoute<K>>;
                    }
                  ) => Rtn;
                  method: M;
                }[]
              : never)
          | (Routes[K] extends {
              method: M;
              handler: (ctx: infer Ctx) => infer Rtn;
            }
              ? {
                  handler: (
                    ctx: Ctx & {
                      rawParams: Merge<ParamsFromRoute<K>>;
                    }
                  ) => Rtn;
                  method: M;
                }
              : never)
      : never;
  }
> = ConvertFromUnionToOverload<
  | Overloads<{
      [X in keyof Routes]: X extends string
        ? (
            path: X
          ) => Routes[X] extends { handler: (ctx: infer Ctx) => infer Rtn }
            ? Rtn
            : never
        : never;
    }>
  | Overloads<{
      [X in keyof Routes]: X extends string
        ? (
            path: ReplaceDynamicSegments<ParseRoute<X>>
          ) => Routes[X] extends { handler: (ctx: infer Ctx) => infer Rtn }
            ? Rtn
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
  T extends (arg: infer A) => infer R ? (arg: A) => R : never
>;

export const router = <
  Routes extends {
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
                    }
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
                    }
                  ) => Rtn;
                  method: M;
                }
              : never)
      : never;
  }
>(
  routes: Routes
) => {
  return routes as unknown as {
    [K in Methods]: CleanOverloads<K, Routes>;
  };
};

// Tests

type TypeAssert<T, Expected> = T extends Expected ? true : false;
type TypeFail<T, Expected> = T extends Expected ? false : true;

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
