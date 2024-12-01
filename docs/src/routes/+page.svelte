<script lang="ts">
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	hljs.registerLanguage('javascript', javascript);

	const light = (c: string) => {
		let x = hljs.highlight(c.replaceAll('\t', '  '), { language: 'javascript' }).value;
		console.log(x);
		return x.replaceAll(
			'<span class="hljs-string">&quot;/users/123/abc&quot;</span>',
			'<span style="text-decoration: underline wavy red;" class="hljs-string">"/users/123/abc"</span>'
		);
	};
</script>

<svelte:head>
	<title>TypePath</title>
</svelte:head>

<div class="min-h-[100dvh] bg-[#00090B] pb-24">
	<div class="relative flex min-h-[100dvh] flex-col bg-[#111111] pt-16">
		<div class="pointer-events-none absolute left-0 right-0 top-0 h-[500px] overflow-clip blur-lg">
			<div
				class="absolute left-3/4 top-0 h-[500px] w-[1000px] -translate-x-1/2 -translate-y-1/2 opacity-40"
				style="background-image: radial-gradient(#606f8d, transparent 60%)"
			/>
			<div
				class="absolute -right-[1300px] top-0 h-[800px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-40"
				style="background-image: radial-gradient(#a3d1f0, transparent 60%)"
			/>
		</div>
		<div class="grid-bg absolute inset-0 opacity-25"></div>
		<div class="mx-auto w-full max-w-2xl p-4 md:p-0">
			<h1 class="mt-16 text-[72px] font-light">
				Type<span class="font-bold text-[#BFDBFE]">Path</span>
			</h1>
			<p class="text-[56px] opacity-65">
				<span class="text-[#F6D188]">ergonomic</span>
				<span class="text-[#75F4F9]">headless</span>
				<span class="text-[#4B81FF]">typesafe</span>
				<span class="text-[#91DB89]">router</span>
			</p>
			<div
				class="group mt-4 inline-flex flex-row items-center gap-4 rounded-2xl bg-[#7F7F7F] bg-opacity-20 p-2 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-1"
			>
				<div
					class="font-code rounded-xl bg-[#7F7F7F] bg-opacity-20 p-3 px-4 text-2xl text-[#EAEAEA] text-opacity-60 backdrop-blur-md transition-all group-hover:-translate-y-1 group-hover:shadow-xl"
				>
					<span class="text-[#98CAFF] opacity-60">$</span>
					npm i typepath
				</div>
				<a
					href="/docs"
					aria-label="Continue"
					class="transition-transform group-hover:translate-x-2"
				>
					<svg
						width="34"
						height="16"
						viewBox="0 0 34 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						class="mr-3"
					>
						<path
							d="M33.7071 8.70711C34.0976 8.31658 34.0976 7.68342 33.7071 7.29289L27.3431 0.928932C26.9526 0.538408 26.3195 0.538408 25.9289 0.928932C25.5384 1.31946 25.5384 1.95262 25.9289 2.34315L31.5858 8L25.9289 13.6569C25.5384 14.0474 25.5384 14.6805 25.9289 15.0711C26.3195 15.4616 26.9526 15.4616 27.3431 15.0711L33.7071 8.70711ZM0 9H33V7H0V9Z"
							fill="white"
							fill-opacity="0.57"
						/>
					</svg>
				</a>
			</div>
		</div>

		<div class="mt-auto bg-gradient-to-t from-black to-transparent py-10">
			<div
				class="font-code flex flex-row justify-center text-[36px] sm:text-[56px] md:text-[72px] lg:text-[96px] xl:text-[128px]"
			>
				<span class="text-[#FEEFAE]">get</span>
				<span class="text-[#b0dbee]">(</span>
				<span class="text-[#ffa36e]">"/users/</span>
				<span class="animate-blink my-5 w-2 bg-white"></span>
				<span class="relative text-[#818181] text-opacity-60"
					>:id
					<div
						class="font-code absolute bottom-full flex flex-col-reverse gap-2 rounded-xl bg-[#7F7F7F] bg-opacity-20 p-2 text-[0.5em] italic text-[#EAEAEA] text-opacity-60 backdrop-blur-[1px] lg:min-w-64"
					>
						<span class="rounded-lg bg-white bg-opacity-15 pl-2 pr-5">:id</span>
						<span class="rounded-lg pl-2 pr-5 hover:bg-white hover:bg-opacity-15">me</span>
					</div>
				</span>
				<span class="text-[#ffa36e]">"</span>
				<span class="text-[#b0dbee]">)</span>
			</div>
		</div>
	</div>

	<div class="mx-auto mt-32 grid w-full max-w-[75vw] grid-cols-1 gap-8 lg:grid-cols-2">
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// Think<br />&nbsp;&nbsp;&nbsp;<b class="text-blue-400">tRPC</b> +
				<b class="text-green-300">REST</b>
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const r = router({
	"/users/:id": get((ctx) => {
		const { id } = ctx.rawParams;
		return { name: "John Doe", id };
	})
});

router.get("/users/xyz"); // { name: "John Doe", id: "xyz" }`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">// fits anywhere</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const r = router({ ... });

// Cloudflare Worker (or other edge server)
export default {
	fetch(req) {
		return r.handle(req);
	}
}

// Directly callable
r.get("/me");
`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// use with fetch,<br />&nbsp;&nbsp;&nbsp;ws, etc
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const c = client({ fetch: myFetch });

const ws = new WebSocket("ws://localhost:3000");
const cWs = client({
	send: (payload) => ws.send(payload.wire())
});`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// zod validation
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const r = router({
	'/users': body(
		z.object({
			name: z.string()
		})
	).post((ctx) => {
		return { name: ctx.body.name };
	})
});`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// validate params
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const r = router({
	"/list/:id": params({ id: z.string().min(3) })
		.get((ctx) => {
			return { id: ctx.params.id };
		})
});`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">// easy merging</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const users = {
	"/users/:id": // ...
	"/users/me": // ...
};

const common = {
	"/version": // ...
};

const r = router({
	...users,
	...common
});`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// typesafe paths
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const c = client<typeof r>();
c.get("/users/123"); // ✅
c.get(\`/users/\${user.id\}\`); // ✅
c.get("/users/123?limit=10"); // ✅

c.get("/users/123/abc"); // ❌



`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// multiple<br />&nbsp;&nbsp;&nbsp;methods
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const r = router({
	"/users/:id": [
		get((ctx) => {
			const { id } = ctx.rawParams;
			return { name: "John Doe", id };
		}),
		post((ctx) => {
			const { id } = ctx.rawParams;
			return { name: "John Doe", id };
		})
	]
});

`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// throw HTTP<br />&nbsp;&nbsp;&nbsp;status errors
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`
const r = router({
	"/route": any((ctx) => {
		if (ctx.request.method === "PUT") {
			throw status(405, "Method Not Allowed");
		}
		
		return { name: "John Doe" };
	})
});

`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// no hidden<br />&nbsp;&nbsp;&nbsp;calls
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`// Context loading (auth, data) is done on a per-route basis
const withAuth = makeGuard((ctx) => {
	if (!ctx.request.headers.authorization) {
		throw status(401, "Unauthorized");
	}
	
	return { user: ... };
});

const r = router({
	"/me": get(withAuth((ctx) => {
		// ctx.user is available and typesafe
		return { firstName: ctx.user.firstName };
	}))
});

`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">// catch all</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const r = router({
	"/article/...rest": get((ctx) => {
		const { rest } = ctx.rawParams;
		return subRouter.get(rest);
	})
});

`)}
			</div>
		</div>
		<div
			class="font-code flex flex-col whitespace-pre-wrap rounded-xl bg-gray-900 p-4 shadow-xl backdrop-blur-sm"
		>
			<h2 class="font-code mb-4 text-5xl opacity-50" style="line-height: 1em;">
				// any type of payload
			</h2>
			<div class="p-4 backdrop-blur-sm">
				{@html light(`const r = router({
	"/image": put((ctx) => {
		if (ctx.request.headers["content-type"] !== "image/png") {
			throw status(400, "Bad Request");
		}
		
		return sharp(ctx.body).resize(200, 200).toBuffer();
	})
});

`)}
			</div>
		</div>
	</div>
</div>
<div class="flex flex-row justify-center bg-black p-4">
	<span class="block text-center text-sm text-gray-400"
		>Est 2024. Built with ❤️ by
		<a class="text-blue-400" target="_blank" href="https://jrmy.dev">jrmy</a>
	</span>
</div>

<style>
	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	.animate-blink {
		animation: pulse 1.5s infinite;
	}
</style>
