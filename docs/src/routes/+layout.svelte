<script lang="ts">
	import { page } from '$app/stores';

	import '../app.scss';
	import 'highlight.js/styles/base16/horizon-dark.min.css';

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
	import { fly } from 'svelte/transition';

	const logoUrl = '/logo.svg';

	$: id = $page?.route?.id ?? '';

	let showHeader = !$isMobile;
</script>

{#if showHeader}
	<header transition:fly={{ y: -64, duration: 300 }} class="fixed z-40 w-full">
		<nav
			class=" border-gray-200 bg-gray-900 py-3.5"
			class:bg-opacity-40={$isMobile}
			class:backdrop-blur-sm={$isMobile}
		>
			<div class="mx-auto flex flex-wrap items-center justify-between px-6">
				{#if !$isMobile}
					<a href="/" class="flex flex-1 items-center" data-sveltekit-reload>
						<img src={logoUrl} class="mr-3 h-6 sm:h-6" alt="TypePath Logo" />
						<span class="font-title self-center whitespace-nowrap text-xl font-thin text-white">
							<span>Type</span><span class="font-bold text-blue-200">Path</span>
						</span>
					</a>
				{:else}
					<div class="flex flex-1 flex-row items-center space-x-2">
						<a href="/" class="rounded-md bg-gray-800 p-2">
							<Fa icon={faHome} />
						</a>

						<a href="/docs" class="rounded-md bg-gray-800 p-2">
							<Fa icon={faBook} />
						</a>
					</div>
				{/if}
				<div
					class="w-full flex-1 items-center justify-center lg:order-1 lg:flex lg:w-auto"
					id="mobile-menu-2"
				>
					<ul class="mt-4 hidden flex-col font-medium lg:mt-0 lg:flex lg:flex-row lg:space-x-8">
						<li>
							<a
								data-sveltekit-reload
								href="/"
								class="flex flex-row items-center gap-x-2 rounded py-2 pl-3 pr-4 lg:bg-transparent lg:p-0 lg:hover:text-blue-400"
								class:text-blue-300={id === '/'}
								class:text-gray-400={id !== '/'}
								aria-current="page"
							>
								<Fa icon={faHome} />
								Home
							</a>
						</li>

						<li>
							<a
								data-sveltekit-reload
								href="/docs"
								class="flex flex-row items-center gap-x-2 border-b border-gray-100 py-2 pl-3 pr-4 hover:bg-gray-50 lg:border-0 lg:p-0 lg:hover:bg-transparent lg:hover:text-blue-400"
								class:text-blue-300={id.startsWith('/docs')}
								class:text-gray-400={!id.startsWith('/docs')}
							>
								<Fa icon={faBook} />
								Docs
							</a>
						</li>
					</ul>
					{#if !$isMobile}
						<div class="flex flex-1 flex-row items-center justify-center space-x-2 lg:hidden">
							<a title="Home" href="/" class="rounded-md bg-gray-800 p-2">
								<Fa icon={faHome} />
							</a>
							<a title="Browse" href="/browse" class="rounded-md bg-gray-800 p-2">
								<Fa icon={faGrip} />
							</a>
							<a title="Docs" href="/docs" class="rounded-md bg-gray-800 p-2">
								<Fa icon={faBook} />
							</a>
						</div>
					{/if}
				</div>
				<div class="flex flex-1 items-center justify-end space-x-2 md:min-w-[351px] lg:order-2">
					<div>
						<a
							data-sveltekit-reload
							href="https://discord.gg/2cQpXjs4ce"
							class="group hidden flex-row items-center py-2 pl-3 pr-4 text-gray-400 sm:flex lg:border-0 lg:p-0 lg:hover:bg-transparent lg:hover:text-blue-400"
							target="_blank"
						>
							<span class="w-0 overflow-hidden transition-all group-hover:w-[64px]">Discord</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width={33.712 / 1.25}
								height={25.685 / 1.25}
								viewBox="0 0 33.712 25.685"
								class="graphic-custom"
								><path
									id="discord-brands"
									d="M54.583,34.169a.086.086,0,0,0-.044-.04A27.811,27.811,0,0,0,47.677,32a.1.1,0,0,0-.11.052,19.348,19.348,0,0,0-.854,1.754,25.676,25.676,0,0,0-7.707,0,17.747,17.747,0,0,0-.868-1.754.108.108,0,0,0-.11-.052,27.731,27.731,0,0,0-6.862,2.127.1.1,0,0,0-.045.039,28.432,28.432,0,0,0-4.98,19.18.116.116,0,0,0,.044.079A27.96,27.96,0,0,0,34.6,57.68a.109.109,0,0,0,.118-.039,19.964,19.964,0,0,0,1.722-2.8.107.107,0,0,0-.058-.148,18.414,18.414,0,0,1-2.63-1.253.108.108,0,0,1-.011-.179c.177-.132.354-.27.522-.409a.1.1,0,0,1,.109-.015,19.943,19.943,0,0,0,16.942,0,.1.1,0,0,1,.11.013c.169.139.346.278.524.411a.108.108,0,0,1-.009.179,17.281,17.281,0,0,1-2.631,1.252.108.108,0,0,0-.057.15,22.421,22.421,0,0,0,1.721,2.8.107.107,0,0,0,.118.04,27.867,27.867,0,0,0,8.432-4.253.108.108,0,0,0,.044-.078A28.244,28.244,0,0,0,54.583,34.169ZM37.266,49.519a3.419,3.419,0,0,1,0-6.793,3.419,3.419,0,0,1,0,6.793Zm11.2,0a3.419,3.419,0,0,1,0-6.793,3.419,3.419,0,0,1,0,6.793Z"
									transform="translate(-26 -31.999)"
									fill="currentColor"
								/></svg
							>
						</a>
					</div>
					<div>
						<a
							data-sveltekit-reload
							href="https://github.com/AskingQuestions/typepath"
							class="group hidden flex-row items-center py-2 pl-3 pr-4 text-gray-400 sm:flex lg:border-0 lg:p-0 lg:hover:bg-transparent lg:hover:text-blue-400"
							target="_blank"
						>
							<span class="w-0 overflow-hidden transition-all group-hover:w-[54px]">Github</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width={30.582 / 1.25}
								height={29.818 / 1.25}
								viewBox="0 0 30.582 29.818"
								class="graphic-custom"
								><path
									id="github-brands"
									d="M10.229,32.01c0,.123-.142.222-.321.222-.2.018-.345-.08-.345-.222,0-.123.142-.222.321-.222C10.069,31.769,10.229,31.868,10.229,32.01Zm-1.918-.277c-.043.123.08.265.265.3a.289.289,0,0,0,.382-.123c.037-.123-.08-.265-.265-.321a.316.316,0,0,0-.382.142Zm2.725-.1c-.179.043-.3.16-.284.3.018.123.179.2.364.16s.3-.16.284-.284S11.216,31.609,11.037,31.627ZM15.094,8A14.785,14.785,0,0,0,0,23.045,15.458,15.458,0,0,0,10.451,37.793c.789.142,1.067-.345,1.067-.746,0-.382-.018-2.491-.018-3.786,0,0-4.316.925-5.222-1.837,0,0-.7-1.794-1.714-2.257,0,0-1.412-.968.1-.95a3.255,3.255,0,0,1,2.38,1.591A3.259,3.259,0,0,0,11.536,31.1a3.427,3.427,0,0,1,.987-2.078C9.076,28.637,5.6,28.137,5.6,22.206a4.673,4.673,0,0,1,1.455-3.632,5.826,5.826,0,0,1,.16-4.187c1.289-.4,4.254,1.665,4.254,1.665a14.566,14.566,0,0,1,7.744,0s2.966-2.072,4.254-1.665a5.823,5.823,0,0,1,.16,4.187,4.793,4.793,0,0,1,1.591,3.632c0,5.95-3.632,6.425-7.078,6.813a3.646,3.646,0,0,1,1.048,2.861c0,2.078-.018,4.649-.018,5.155,0,.4.284.888,1.067.746A15.316,15.316,0,0,0,30.582,23.045C30.582,14.493,23.646,8,15.094,8Zm-9.1,21.266c-.08.062-.062.2.043.321.1.1.24.142.321.062.08-.062.062-.2-.043-.321C6.215,29.229,6.073,29.186,5.993,29.266Zm-.666-.5c-.043.08.018.179.142.24a.183.183,0,0,0,.265-.043c.043-.08-.018-.179-.142-.24C5.469,28.686,5.37,28.7,5.327,28.766Zm2,2.2c-.1.08-.062.265.08.382.142.142.321.16.4.062.08-.08.043-.265-.08-.382C7.59,30.881,7.405,30.863,7.325,30.961Zm-.7-.906c-.1.062-.1.222,0,.364s.265.2.345.142a.281.281,0,0,0,0-.382c-.086-.142-.247-.2-.345-.123Z"
									transform="translate(0 -8)"
									fill="currentColor"
								/></svg
							>
						</a>
					</div>
					<div class="pl-4"></div>
				</div>
			</div>
		</nav>
	</header>
{/if}

{#if $isMobile}
	<button
		on:click={() => {
			showHeader = !showHeader;
		}}
		class="fixed right-0 top-0 z-40 flex items-center rounded-bl-full border border-r-0 border-t-0 border-gray-800 bg-gray-900 bg-opacity-40 pb-4 pl-4 pr-2 pt-2 text-xs backdrop-blur-sm transition-transform duration-300 ease-in-out"
		class:translate-y-[52px]={showHeader}
	>
		{#if showHeader}
			<Fa icon={faArrowUp} />
		{:else}
			<Fa icon={faBars} />
		{/if}
	</button>
{/if}

<slot></slot>

<style>
	header > nav {
		backdrop-filter: blur(4px) !important;
		background-color: rgba(0, 0, 0, 0.1) !important;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
		transition: background-color 0.3s;

		&:hover {
			background-color: rgba(0, 0, 0, 0.8) !important;
		}
	}
</style>
