import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path is '/' for local dev/preview and set to the repo subpath
// (e.g. '/Claude-App/') by the GitHub Pages deploy workflow via BASE_PATH.
// Normalize to always end in a single trailing slash, which Vite requires.
const base = (process.env.BASE_PATH || '/').replace(/\/*$/, '/')

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
      ],
      manifest: {
        name: 'Momentum — Personal OS',
        short_name: 'Momentum',
        description:
          'A private command center for tasks, money, habits, goals and reflection.',
        theme_color: '#050911',
        background_color: '#050911',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
