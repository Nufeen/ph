import {defineConfig} from 'vite'
import {VitePWA} from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import dsv from '@rollup/plugin-dsv'

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://nufeen.github.io/ph/',
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },

  plugins: [
    react(),
    dsv(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 5000000
      },

      manifest: {
        name: 'Planetary hours',
        short_name: 'Hours',
        description: 'Checking current hours',
        theme_color: '#000',
        background_color: '#000',
        icons: [
          {
            src: 'logo.png',
            sizes: '530x530',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
