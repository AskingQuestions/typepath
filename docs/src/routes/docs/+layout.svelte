<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Articles } from '../articles';

	import '../../docs.scss';
	import ArticleLink from '../ArticleLink.svelte';
	import { isMobile, windowWidth } from '$lib/responsive';
	import {
		faArrowUp,
		faBars,
		faBarsStaggered,
		faBook,
		faGrip,
		faHome
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { slide } from 'svelte/transition';
	import UpNext from '$lib/UpNext.svelte';

	const logoUrl = '/logo.svg';

	$: id = $page?.route?.id ?? '';

	let content: HTMLDivElement;
	let toggledMenu = false;
	let toggledMenuMain = false;

	let headings: { active: boolean; title: string; element: Element; level: 2 | 3 | 4 | 5 | 6 }[] =
		[];

	function generateHeadings() {
		headings = [];
		const els = content.querySelectorAll('h2, h3, h4, h5, h6');

		for (const heading of els) {
			const level = parseInt(heading.tagName[1]) as 2 | 3 | 4 | 5 | 6;

			const title = heading.textContent ?? '';
			headings.push({ title, element: heading, level, active: false });
		}

		calculateActiveHeading();
	}

	function calculateActiveHeading() {
		let active = headings[0];

		for (let heading of headings) {
			heading.active = false;
		}
		for (let heading of headings) {
			let rect = heading.element.getBoundingClientRect();
			active = heading;
			if (rect.top > 0) {
				break;
			}
		}
		if (active) {
			active.active = true;
			headings = [...headings];
			return active;
		}
	}

	let nextTitle = '';
	let nextSlug = '';

	function searchNext(mySlug: string, parent: string, children: object) {
		let waitForNext = false;
		for (let key of Object.keys(children)) {
			if (waitForNext) {
				nextTitle = key;
				nextSlug = parent + '/' + key;
				waitForNext = false;
				return;
			}
			if (parent + '/' + key == mySlug) {
				waitForNext = true;
			}
			if (children[key] instanceof Object) searchNext(mySlug, parent + '/' + key, children[key]);
		}
	}

	let showHeader = !$isMobile;

	$: {
		$page.route;
		nextSlug = '';
		nextTitle = '';
		searchNext(($page.route.id ?? '').replace(/^\/\(app\)/, ''), '/docs', Articles);
		if (content) {
			generateHeadings();
		}
	}

	onMount(() => {
		generateHeadings();
	});
</script>

<svelte:window on:scroll={calculateActiveHeading} />

<div class="docs-main -mb-24 flex flex-row bg-[#0d0d0d]" data-sveltekit-reload>
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
	{#if $windowWidth > 1175}
		<div
			class="sidebar-scroll-container docs-scrollbar sticky top-[54px] max-h-[calc(100vh-3.5rem)] w-80 flex-shrink-0 overflow-auto bg-[#080808] px-6 pt-6"
		>
			{#each Object.keys(Articles) as key}
				<ArticleLink open path="/docs" name={key} item={Articles[key]} />
			{/each}
		</div>
	{:else}
		<div class="fixed left-4 top-[121px] z-50 mt-10 h-[calc(100vh-121px-4rem)]">
			<button
				class="absolute left-full ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-transparent backdrop-blur-sm"
				on:click={() => {
					toggledMenuMain = !toggledMenuMain;
				}}><Fa icon={faBarsStaggered} /></button
			>
			{#if toggledMenuMain}
				<div transition:slide={{ axis: 'x', duration: 200 }} class="overflow-hidden">
					<div
						class="sidebar-scroll-container docs-scrollbar max-h-[calc(100dvh-11rem)] w-64 flex-shrink-0 overflow-auto rounded-md border border-gray-700 bg-gray-900 pl-4"
					>
						{#each Object.keys(Articles) as key}
							<ArticleLink open path="/docs" name={key} item={Articles[key]} />
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
	<div class="docs-main-content flex-1" class:ignore-md={$page.route.id?.includes('reference')}>
		<div class="mx-auto mt-20 min-h-[100vh] max-w-4xl" bind:this={content}>
			<slot />
			{#if nextSlug}
				<UpNext slug={nextSlug} title={nextTitle} />
			{/if}
		</div>
	</div>
	{#if $windowWidth > 1450}
		<div class="sticky top-[121px] mt-10 h-[calc(100vh-121px)] w-64 flex-shrink-0">
			{#each headings as { title, active, element, level }}
				<div class="flex items-center">
					<button
						class="heading-link text-sm text-gray-500 hover:text-white"
						style="margin-left: {(level - 2) * 1.5}rem"
						class:active
						on:click={() => {
							element.scrollIntoView({ behavior: 'smooth' });
						}}
					>
						{title}
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<div class="fixed right-4 top-[121px] z-50 mt-10 h-[calc(100vh-121px-4rem)]">
			<button
				class="absolute right-full mr-2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-gray-900 bg-transparent bg-opacity-50 backdrop-blur-sm"
				on:click={() => {
					toggledMenu = !toggledMenu;
				}}><Fa icon={faBarsStaggered} /></button
			>
			{#if toggledMenu}
				<div transition:slide={{ axis: 'x', duration: 200 }} class="overflow-hidden">
					<div
						class="w-64 flex-shrink-0 rounded-md border border-gray-700 bg-black bg-opacity-25 p-4 backdrop-blur-md"
					>
						{#each headings as { title, active, element, level }}
							<div class="flex items-center">
								<button
									class="heading-link text-sm text-gray-500 hover:text-white"
									style="margin-left: {(level - 2) * 1.5}rem"
									class:active
									on:click={() => {
										element.scrollIntoView({ behavior: 'smooth' });
									}}
								>
									{title}
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	:global(.heading-link.active) {
		@apply text-blue-500;
	}
</style>
