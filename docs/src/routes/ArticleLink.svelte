<script lang="ts">
	import { faCaretDown, faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	type Item = { [key: string]: Item };
	export let path: string = '';
	export let name: string = '';
	export let item: Item = {};

	$: normalizedRoute = $page.route.id?.replaceAll('/(app)', '') ?? '';
	$: itemPath = `${path}/${item?.$slug ?? name}`.replaceAll('//', '/').replace(/\/$/, '');
	function itemActive(childName: string, childItem: string) {
		return normalizedRoute.startsWith(
			`${itemPath}/${item?.$slug ?? childName}`.replaceAll('//', '/').replace(/\/$/, '')
		);
	}
	$: active =
		normalizedRoute == '/docs' ? itemPath == '/docs/landing' : normalizedRoute.startsWith(itemPath);
	$: exactActive = normalizedRoute == itemPath;

	$: realChildren = Object.keys(item).filter((key) => !key.startsWith('$'));

	export let open = false;
	let baseEl: HTMLElement;

	onMount(() => {
		if (active) open = true;

		if (exactActive) {
			const scrollParent = document.querySelector('.sidebar-scroll-container');
			if (scrollParent) {
				scrollParent.scrollTo(0, baseEl.offsetTop - scrollParent.offsetTop);
			}
		}
	});
</script>

<div class="article-list" bind:this={baseEl}>
	{#if realChildren.length > 0}
		<div
			class="selected-bg -mx-3 flex flex-row items-center rounded-lg px-3 hover:bg-gray-800"
			class:article-item-active={exactActive}
		>
			{#if name}
				<a
					class="flex w-full flex-row items-center py-2 capitalize no-underline"
					class:article-item-active={active}
					href={itemPath}
					>{#if item['$icon']}
						<Fa class="mr-3" icon={item.$icon} />
					{/if}
					{#if item['$iconHtml']}
						{@html item.$iconHtml}
					{/if}
					{(item.$name ?? name).replace(/-/g, ' ')}</a
				>{/if}
			<button
				class="-mr-1.5 ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-[#080808] text-white hover:bg-gray-700"
				on:click={() => (open = !open)}
			>
				{#if open}
					<Fa icon={faCaretDown} />
				{:else}
					<Fa icon={faCaretLeft} />
				{/if}
			</button>
		</div>
		{#if open}
			<ul class="" transition:slide>
				{#each realChildren as child}
					{#key normalizedRoute}
						<li
							class="ml-2 pl-2 text-gray-300 hover:border-white hover:text-white"
							class:article-item-active={itemActive(child, item[child])}
						>
							<svelte:self path={itemPath} name={child} item={item[child]} />
						</li>
					{/key}
				{/each}
			</ul>
		{/if}
		<div class:mb-2={itemPath.split('/').length == 3} />
	{:else if name}
		<a
			class="selected-bg -mx-3 flex w-full flex-row items-center justify-start rounded-lg py-2 pl-3 capitalize no-underline hover:bg-gray-800"
			class:mb-2={itemPath.split('/').length == 3}
			class:article-item-active={active}
			href={itemPath == '/docs/landing' ? '/docs' : itemPath}
		>
			{#if item['$icon']}
				<Fa class="mr-2" icon={item.$icon} />
			{/if}
			{#if item['$iconHtml']}
				{@html item.$iconHtml}
			{/if}
			{(item.$name ?? name).replace(/-/g, ' ')}
			{#if item['$new']}
				<span class="ml-2 rounded-md bg-blue-500 px-1 text-xs text-white">New</span>
			{/if}
		</a>
	{/if}
</div>

<style lang="scss">
	:global(.article-item-active) {
		border-color: #3392ea !important;
		color: #79d4f8 !important;
	}

	:global(.article-item-active.selected-bg) {
		@apply bg-gray-700;
	}
</style>
