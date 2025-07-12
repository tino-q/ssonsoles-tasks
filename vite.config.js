import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/ssonsoles-tasks/' : '/',
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'MISSING_API_URL')
  }
})
