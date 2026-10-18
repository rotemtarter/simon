import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icons in public/ from public/icon.svg (run once: `npx pwa-assets-generator`).
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: '#0F172A' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#0F172A' } },
  },
  images: ['public/icon.svg'],
});
