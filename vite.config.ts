import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },

      manifest: {
        name: "Planetary hours",
        short_name: "Hours",
        description: "Checing current hours",
        theme_color: "#000",
        background_color: "#000",
        icons: [
          {
            src: "logo.png",
            sizes: "530x530",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
