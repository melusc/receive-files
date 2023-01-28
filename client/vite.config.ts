import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	root: 'src',
	build: {
		outDir: '../dist',
		assetsDir: '.',
		emptyOutDir: true,
	},
	base: '/static',
	plugins: [react()],
});
