import { readable } from 'svelte/store';

export const isMobile = readable(false, (set) => {
	if (typeof window === 'undefined') return;

	let isMobileDevice = false;
	const mediaQuery = window.matchMedia('(max-width: 768px)');
	const listener = (ev: MediaQueryListEvent) => {
		watcher();
	};

	const watcher = () => {
		let doesMatch = isMobileDevice;
		if (mediaQuery.matches) {
			doesMatch = true;
		}
		if (window.innerHeight < 550) {
			doesMatch = true;
		}

		set(doesMatch);
	};

	watcher();
	mediaQuery.addEventListener('change', listener);
	window.addEventListener('resize', watcher);

	return () => {
		mediaQuery.removeEventListener('change', listener);
		window.removeEventListener('resize', watcher);
	};
});

export const windowWidth = readable(1920, (set) => {
	if (typeof window === 'undefined') return;

	function resize() {
		set(window.innerWidth);
	}

	resize();

	window.addEventListener('resize', resize);

	return () => {
		window.removeEventListener('resize', resize);
	};
});
