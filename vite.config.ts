import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mathias Filmsamling',
        short_name: 'Filmsamling',
        description: 'Personlig filmsamlings-app',
        lang: 'sv',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f1115',
        theme_color: '#0f1115',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // xlsx (Excel-export) laddas bara in on-demand via dynamic import när
        // man klickar på "Exportera till Excel" – ska därför inte precachas
        // i förväg (det skulle tvinga alla besökare att ladda ner den i
        // bakgrunden), utan cachas separat nedan först vid faktisk användning.
        globIgnores: ['**/xlsx-*.js'],
        // Filmerna hämtas direkt från Supabase (inte via /api), så deras
        // domän måste vitlistas explicit för att kunna cachas här.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-data',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'image.tmdb.org',
            handler: 'CacheFirst',
            options: {
              cacheName: 'tmdb-posters',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/assets/xlsx-'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'xlsx-lib',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
