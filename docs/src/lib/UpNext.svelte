<script lang="ts">
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let title: string;
	export let slug: string;
</script>

<div class="border-b my-16 border-gray-700 mx-16" />
<div class="flex flex-col items-end">
	<a class="no-underline" style="text-decoration: none" href={slug}>
		<div
			class="mr-16 text-2xl text-white text-opacity-50 no-underline mb-2 text-right flex flex-row justify-end items-center"
		>
			Up next
			<Fa class="ml-2" icon={faArrowRight} />
		</div>
		<div
			class="mr-16 text-2xl font-bold text-gray-200 mb-4 flex flex-row items-center no-underline capitalize"
		>
			{title.replace(/-/g, ' ')}
		</div>
	</a>
</div>
