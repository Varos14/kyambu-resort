import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(rootDir, 'index.html'),
        cottages: resolve(rootDir, 'cottages.html'),
        cocoa: resolve(rootDir, 'cocoa.html'),
        mungu: resolve(rootDir, 'mungu.html'),
        batwa: resolve(rootDir, 'batwa.html'),
        sempaya: resolve(rootDir, 'sempaya.html'),
        dining: resolve(rootDir, 'dining.html'),
        location: resolve(rootDir, 'location.html')
      }
    }
  }
});
