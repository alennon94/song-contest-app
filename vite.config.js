import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // This allows ngrok to connect to your local server
    allowedHosts: ['all'], 
    // If you use a specific ngrok domain, you can list it instead:
    // allowedHosts: ['.ngrok-free.app']
    host: true,
    port: 5173,
    strictPort: true,
  }
})