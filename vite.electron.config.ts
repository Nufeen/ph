import {defineConfig} from 'vite'
import {VitePWA} from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import dsv from '@rollup/plugin-dsv'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    outDir: './dist-electron',
    emptyOutDir: true // also necessary
  },

  plugins: [react(), dsv()]
})
