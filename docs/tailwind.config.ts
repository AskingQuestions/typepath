const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts,svx}'],
	theme: {
		colors: {
			...colors,
			gray: colors.zinc
		},
		extend: {
			fontFamily: {
				body: ['"Roboto"', 'sans-serif'],
				title: ['"Montserrat"', 'sans-serif'],
				sans: ['"Roboto"', 'sans-serif']
			}
		}
	},
	safelist: [
		'bg-red-500',
		'bg-green-500',
		'bg-blue-500',
		'bg-yellow-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-gray-500',
		'bg-white',
		'bg-black',
		'bg-transparent',
		'text-red-500',
		'text-green-500',
		'text-blue-500',
		'text-yellow-500',
		'text-purple-500',
		'text-pink-500',
		'text-gray-500',
		'text-white',
		'text-black',
		'text-transparent',
		'border-red-500',
		'border-green-500',
		'border-blue-500',
		'border-yellow-500',
		'border-purple-500',
		'border-pink-500',
		'border-gray-500',
		'border-white',
		'border-black',
		'border-transparent'
	],
	plugins: []
};
