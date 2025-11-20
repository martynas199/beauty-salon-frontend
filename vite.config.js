import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["framer-motion", "embla-carousel-react"],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (disable if not needed)
    sourcemap: false,
  },

  // Server optimizations
  server: {
    // Enable HMR
    hmr: true,
  },

  // Image optimization
  assetsInlineLimit: 4096, // Inline assets smaller than 4kb as base64
});
