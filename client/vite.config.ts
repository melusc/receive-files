import {svelte} from '@sveltejs/vite-plugin-svelte';
import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			configFile: '../svelte.config.js',
		}),
	],
	root: 'src',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
			},
		},
	},
});
