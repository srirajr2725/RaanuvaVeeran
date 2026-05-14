import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api-manpower': {
        target: 'https://unlanded-isela-unmunificently.ngrok-free.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-manpower/, ''),
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
});
