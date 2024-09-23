import { svelte } from '@sveltejs/vite-plugin-svelte';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), basicSsl({ certDir: './cert' })],
  server: {
    port: 5174,
		watch: {
			usePolling: true
		}
  },
  base: './',
  build: {
    minify: false,
    sourcemap: true,
  }
})
