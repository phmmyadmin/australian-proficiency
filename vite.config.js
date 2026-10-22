import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Australian Proficiency - PTE Academic & Aussie Listening Lab',
        short_name: 'AusProficiency',
        description: 'PTE Academic Practice, Mock Exams, Reverse-Engineered Scoring, Australian Accent YouTube Lab, and AI FSRS-5 Vocabulary Flashcards.',
        theme_color: '#FAFAF7',
        background_color: '#FAFAF7',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
