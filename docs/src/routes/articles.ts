import {
	faArrowUpRightFromSquare,
	faArrowsSpin,
	faBarsStaggered,
	faBezierCurve,
	faBinoculars,
	faBook,
	faBorderNone,
	faBrush,
	faBurst,
	faCircleNodes,
	faCode,
	faCompassDrafting,
	faCropSimple,
	faCube,
	faDatabase,
	faEllipsis,
	faFillDrip,
	faHeartPulse,
	faHome,
	faInfinity,
	faKeyboard,
	faLaptop,
	faLayerGroup,
	faLightbulb,
	faListCheck,
	faLock,
	faMaximize,
	faMicrochip,
	faObjectGroup,
	faPaintBrush,
	faPalette,
	faPenRuler,
	faPlay,
	faRainbow,
	faSatelliteDish,
	faScroll,
	faShapes,
	faShare,
	faSquareRootVariable,
	faTag,
	faTerminal,
	faToggleOn,
	faVolcano,
	faWaveSquare,
	faRoute,
	faBox,
	faQuestion,
	faTableList,
	faTriangleExclamation,
	faImage,
	faDownload,
	faFolder,
	faComputer,
	faShield
} from '@fortawesome/free-solid-svg-icons';

export const Articles = {
	landing: {
		$icon: faHome,
		$name: 'Getting Started'
	},
	routing: {
		$icon: faRoute,
		organization: {
			$icon: faFolder
		},
		params: {
			$iconHtml: `<svg class="svelte-fa svelte-fa-base mr-3" viewBox="0 0 187 98" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 47C6.95833 47 4.77083 46.1042 2.9375 44.3125C1.14583 42.4792 0.25 40.2917 0.25 37.75C0.25 35.1667 1.14583 32.9792 2.9375 31.1875C4.77083 29.3958 6.95833 28.5 9.5 28.5C12.0833 28.5 14.2708 29.3958 16.0625 31.1875C17.8542 32.9792 18.75 35.1667 18.75 37.75C18.75 40.2917 17.8542 42.4792 16.0625 44.3125C14.2708 46.1042 12.0833 47 9.5 47ZM9.5 97.25C6.95833 97.25 4.77083 96.3542 2.9375 94.5625C1.14583 92.7292 0.25 90.5417 0.25 88C0.25 85.4167 1.14583 83.2292 2.9375 81.4375C4.77083 79.6458 6.95833 78.75 9.5 78.75C12.0833 78.75 14.2708 79.6458 16.0625 81.4375C17.8542 83.2292 18.75 85.4167 18.75 88C18.75 90.5417 17.8542 92.7292 16.0625 94.5625C14.2708 96.3542 12.0833 97.25 9.5 97.25ZM82.25 96V33.5H95.5V96H82.25ZM57 96V85.125H83.5V96H57ZM94.25 96V85.125H115.875V96H94.25ZM60.75 40.625V29.75H95.5V40.625H60.75ZM88.4375 19.25C85.8958 19.25 83.7083 18.3542 81.875 16.5625C80.0833 14.7292 79.1875 12.5417 79.1875 10C79.1875 7.41667 80.0833 5.22917 81.875 3.4375C83.7083 1.64583 85.8958 0.75 88.4375 0.75C91.0208 0.75 93.2083 1.64583 95 3.4375C96.7917 5.22917 97.6875 7.41667 97.6875 10C97.6875 12.5417 96.7917 14.7292 95 16.5625C93.2083 18.3542 91.0208 19.25 88.4375 19.25ZM154.438 97.25C145.771 97.25 139.188 94.3958 134.688 88.6875C130.229 82.9792 128 74.5833 128 63.5C128 52 130.229 43.2917 134.688 37.375C139.188 31.4583 145.771 28.5 154.438 28.5C159.396 28.5 163.417 29.6667 166.5 32C169.625 34.3333 171.458 37.5833 172 41.75H177.125L173.25 60.625C173.25 53.7917 171.896 48.6042 169.188 45.0625C166.521 41.5208 162.583 39.75 157.375 39.75C152.042 39.75 148 41.75 145.25 45.75C142.5 49.75 141.125 55.6667 141.125 63.5C141.125 70.9167 142.5 76.5208 145.25 80.3125C148 84.1042 152.042 86 157.375 86C162.583 86 166.521 84.2292 169.188 80.6875C171.896 77.1458 173.25 71.9583 173.25 65.125L177.75 84H172C171.583 88.1667 169.812 91.4167 166.688 93.75C163.604 96.0833 159.521 97.25 154.438 97.25ZM174.625 96.625L173.25 83.625V2.25H186.5V96L174.625 96.625Z" fill="currentColor"/></svg>`,
			$name: 'Parameters'
		},
		catchall: {
			$icon: faEllipsis
		},
		methods: {
			$icon: faToggleOn
		},
		'server-side-routing': {
			$icon: faComputer
		}
	},
	payloads: {
		$icon: faBox,
		body: {
			$icon: faTableList
		},
		'non-json-body': {
			$icon: faImage
		},
		'request-data': {
			$icon: faDatabase
		},
		searchParams: {
			$icon: faQuestion
		},
		guards: {
			$icon: faShield
		},
		'custom-context': {
			$icon: faObjectGroup
		}
	},
	responses: {
		$icon: faDownload,
		errors: {
			$icon: faTriangleExclamation
		},
		'custom-response': {
			$icon: faShare
		},
		'returning-js-types': {
			$icon: faMicrochip
		}
	},
	examples: {
		$icon: faCode,
		'cloudflare-workers': {
			$iconHtml: `<svg class="svelte-fa svelte-fa-base mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 231"><defs><linearGradient id="logosCloudflareWorkersIcon0" x1="50%" x2="25.7%" y1="100%" y2="8.7%"><stop offset="0%" stop-color="#eb6f07"/><stop offset="100%" stop-color="#fab743"/></linearGradient><linearGradient id="logosCloudflareWorkersIcon1" x1="81%" x2="40.5%" y1="83.7%" y2="29.5%"><stop offset="0%" stop-color="#d96504"/><stop offset="100%" stop-color="#d96504" stop-opacity="0"/></linearGradient><linearGradient id="logosCloudflareWorkersIcon2" x1="42%" x2="84%" y1="8.7%" y2="79.9%"><stop offset="0%" stop-color="#eb6f07"/><stop offset="100%" stop-color="#eb720a" stop-opacity="0"/></linearGradient><linearGradient id="logosCloudflareWorkersIcon3" x1="50%" x2="25.7%" y1="100%" y2="8.7%"><stop offset="0%" stop-color="#ee6f05"/><stop offset="100%" stop-color="#fab743"/></linearGradient><linearGradient id="logosCloudflareWorkersIcon4" x1="-33.2%" x2="91.7%" y1="100%" y2="0%"><stop offset="0%" stop-color="#d96504" stop-opacity="0.8"/><stop offset="49.8%" stop-color="#d96504" stop-opacity="0.2"/><stop offset="100%" stop-color="#d96504" stop-opacity="0"/></linearGradient><linearGradient id="logosCloudflareWorkersIcon5" x1="50%" x2="25.7%" y1="100%" y2="8.7%"><stop offset="0%" stop-color="#ffa95f"/><stop offset="100%" stop-color="#ffebc8"/></linearGradient><linearGradient id="logosCloudflareWorkersIcon6" x1="8.1%" x2="96.5%" y1="1.1%" y2="48.8%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff" stop-opacity="0.1"/></linearGradient><linearGradient id="logosCloudflareWorkersIcon7" x1="-13.7%" x2="100%" y1="104.2%" y2="46.2%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff" stop-opacity="0.1"/></linearGradient></defs><path fill="url(#logosCloudflareWorkersIcon0)" d="m65.82 3.324l30.161 54.411l-27.698 49.857a16 16 0 0 0 0 15.573l27.698 49.98l-30.16 54.411a32 32 0 0 1-13.542-12.74L4.27 131.412a32.13 32.13 0 0 1 0-32.007l48.01-83.403a32 32 0 0 1 13.542-12.68"/><path fill="url(#logosCloudflareWorkersIcon1)" d="M68.283 107.654a16 16 0 0 0 0 15.51l27.698 49.98l-30.16 54.412a32 32 0 0 1-13.542-12.74L4.27 131.412c-3.816-6.586 17.542-14.465 64.014-23.698z" opacity="0.7"/><path fill="url(#logosCloudflareWorkersIcon2)" d="m68.898 8.802l27.083 48.933l-4.493 7.818l-23.882-40.44c-6.894-11.264-17.42-5.416-30.591 17.358l1.97-3.386l13.294-23.082a32 32 0 0 1 13.419-12.68l3.139 5.479z" opacity="0.5"/><path fill="url(#logosCloudflareWorkersIcon3)" d="m203.696 16.003l48.01 83.403c5.725 9.848 5.725 22.159 0 32.007l-48.01 83.402a32.01 32.01 0 0 1-27.698 16.004h-48.01l59.705-107.654a16 16 0 0 0 0-15.511L127.988 0h48.01a32.01 32.01 0 0 1 27.698 16.003"/><path fill="url(#logosCloudflareWorkersIcon4)" d="m173.536 230.45l-47.395.43l57.367-108.208a16.62 16.62 0 0 0 0-15.634L126.14 0h10.834l60.197 106.546a16.62 16.62 0 0 1-.062 16.496a9617 9617 0 0 0-38.592 67.707c-11.695 20.558-6.648 33.791 15.018 39.7"/><path fill="url(#logosCloudflareWorkersIcon5)" d="M79.978 230.819c-4.924 0-9.849-1.17-14.157-3.263l59.212-106.792a11.05 11.05 0 0 0 0-10.71L65.821 3.324A32 32 0 0 1 79.978 0h48.01l59.705 107.654a16 16 0 0 1 0 15.51L127.988 230.82z"/><path fill="url(#logosCloudflareWorkersIcon6)" d="M183.508 110.054L122.448 0h5.54l59.705 107.654a16 16 0 0 1 0 15.51L127.988 230.82h-5.54l61.06-110.055a11.05 11.05 0 0 0 0-10.71" opacity="0.6"/><path fill="url(#logosCloudflareWorkersIcon7)" d="M125.033 110.054L65.821 3.324c1.846-.985 4.062-1.724 6.155-2.34c13.049 23.452 32.315 59.029 57.859 106.67a16 16 0 0 1 0 15.51L71.053 229.589c-2.093-.616-3.201-1.047-5.17-1.97l59.089-106.792a11.05 11.05 0 0 0 0-10.71z" opacity="0.6"/></svg>`
		}
	},
	misc: {
		$icon: faArrowsSpin,
		cors: {
			$icon: faTriangleExclamation
		}
	}
} as const;
