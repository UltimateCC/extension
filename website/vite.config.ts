import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

	server: {
		proxy: {
			// Use real live channel endpoint for testing
			'/api/twitch/live': {
				target: 'https://ultimatecc.net',
				changeOrigin: true
			},

			// Config dev server to proxy socketio requests to backend locally
			'/socket.io': {
				target: 'ws://localhost:8001',
				ws: true
			},

			'/api': {
				target: 'http://localhost:8001'
			}
		}
	}

})
