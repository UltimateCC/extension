import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

	server: {
		// Config dev server to proxy socketio requests to backend
		proxy: {
			'/socket.io': {
				target: 'ws://localhost:8080',
				ws: true
			},

			'/api': {
				target: 'http://localhost:8080'
			}
		}
	}

})
