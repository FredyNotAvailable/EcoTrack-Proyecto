import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compresión gzip para archivos > 1KB
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    // Compresión brotli (mejor ratio de compresión)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],
  build: {
    // Usar terser para mejor minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting manual para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - cambia poco, muy cacheable
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI Library + Animaciones (juntas por dependencia circular)
          'vendor-ui': [
            '@chakra-ui/react',
            '@chakra-ui/icons',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion',
          ],
          // Estado y data fetching
          'vendor-state': ['zustand', '@tanstack/react-query'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Warning si un chunk excede 500KB
    chunkSizeWarningLimit: 500,
    // Generar source maps para debug (opcional en prod)
    sourcemap: false,
  },
  // Pre-bundling de dependencias frecuentes
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      'zustand',
      '@tanstack/react-query',
    ],
  },
})
