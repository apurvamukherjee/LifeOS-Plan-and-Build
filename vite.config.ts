/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Keeps generateSW (app-shell precache) while still allowing the custom push-event
      // handler in public/push-handler.js — see docs/ARCHITECTURE.md ("Reminder service").
      workbox: {
        importScripts: ['push-handler.js'],
        navigateFallback: '/index.html',
      },
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'LifeOS',
        short_name: 'LifeOS',
        description: 'An offline-first lifestyle tracker for water, supplements, and tasks.',
        theme_color: '#0b0b14',
        background_color: '#0b0b14',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
