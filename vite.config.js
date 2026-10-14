import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/changelog.js')) {
            return 'changelog-data';
          }
          if (id.includes('src/data/guide.js')) {
            return 'guide-data';
          }
        }
      }
    }
  }
});
