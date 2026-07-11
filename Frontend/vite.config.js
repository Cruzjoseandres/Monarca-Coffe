import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['monarca-icon.svg'],
      manifest: {
        name: 'Monarca Coffee POS',
        short_name: 'MonarcaPOS',
        description: 'Sistema POS de Venta Rápida - Monarca Coffee',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          {
            src: '/monarca-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/monarca-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
