<a href="https://typepath.dev">
  <img src="media/banner.png?v3" width="100%"/>
</a>

<div align="center">
  <h1>TypePath</h1>
  <h3>Think tRPC + REST</h3>
  
  <a href="https://npmcharts.com/compare/@trpc/server?interval=30">
    <img alt="weekly downloads" src="https://img.shields.io/npm/dm/%40typepath/server.svg">
  </a>
  <a href="https://github.com/trpc/trpc/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/AskingQuestions/typepath" />
  </a>
  <a href="https://discord.gg/2cQpXjs4ce">
    <img alt="Discord" src="https://img.shields.io/discord/1310481448062685234
		?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a>
  <br />
  <br />
  
</div>

TypePath is a lightweight, headless router that has full type-safety.

## Sample

Here's a quick sample of what it looks like:

```ts
import { router, get } from "typepath";

const r = router({
  "/welcome/:name": get((ctx) => `Hello, ${ctx.rawParams.name}!`),
});

r.get("/welcome/John"); // Hello, John!
//    ⬆️ this is type-safe and will not compile if the path is incorrect
```

## Features

- 💬 Autocompletion for paths (including dynamic routes and string literals)
- 🚀 Fast and lightweight (~6kb gzipped)
- 📦 Return type-safe `buffers`, `strings`, `JSON`, raw responses, and more
- 🖥️ Run it on any server (Express, Fastify, cloudflare, etc.)
- ✨ Use it for websockets, or any other protocol
- 🧹 No-codegen, no build step, 2 runtime dependencies (zod, superjson)
- 📖 Loads of docs and examples

## Quickstart

## 1. Installation

```sh
$ npm install typepath
```

## 2. Server

```ts
// server.ts

import { router, get } from "typepath";

// Create a router
const r = router({
  "/": get((ctx) => "Hello, World!"),
});

// Listen on port 3000 using the default node:http server
r.listen({ port: 3000 });

export type Router = typeof r;
```

## 3. Client

```ts
// client.ts
import { client } from "typepath";
import type { Router } from "./server";

// Create a client that points to the server
const c = client<Router>({
  baseUrl: "http://localhost:3000",
});

console.log(await c.get("/")); // Hello, World!
```
