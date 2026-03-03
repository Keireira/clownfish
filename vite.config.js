import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { version } from './package.json';

export default defineConfig({
	define: {
		APP_VERSION: JSON.stringify(version)
	},
	plugins: [react()],
	clearScreen: false,
	server: {
		port: 5173,
		strictPort: true
	}
});
