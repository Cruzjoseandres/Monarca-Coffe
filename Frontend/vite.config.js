import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['el-cafe-comadre-logo-transparent.png'],
      manifest: {
        name: 'CafeteriaPRD',
        short_name: 'CafeteriaPRD',
        description: 'Sistema de Gestión - Cafetería',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/el-cafe-comadre-logo-transparent.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/el-cafe-comadre-logo-transparent.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
