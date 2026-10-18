import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const DESCRIPTION = 'משחק זיכרון קלאסי: זכרו את הרצף, שחזרו אותו והגיעו לשיא!';

// `base` will be set to the GitHub Pages path before deployment.
export default defineConfig({
  plugins: [
    VitePWA({
      // No skipWaiting: a new version takes over only after the app is fully closed,
      // so a running game is never reloaded and old/new files never mix (ADR-5).
      registerType: 'prompt',
      injectRegister: false,
      // Icons are already precached by globPatterns below.
      includeManifestIcons: false,
      manifest: {
        name: 'סיימון',
        short_name: 'סיימון',
        description: DESCRIPTION,
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        // Relative paths keep working once `base` points to the GitHub Pages folder.
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache every build file; woff2 only (supported by all modern browsers).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
