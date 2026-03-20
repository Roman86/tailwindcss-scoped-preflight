import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const viteDir = path.resolve('e2e/v4/vite');

await build({
  root: viteDir,
  base: './',
  configFile: false,
  plugins: [tailwindcss()],
  build: {
    outDir: path.join(viteDir, 'dist'),
    emptyOutDir: true,
  },
  logLevel: 'error',
});

console.log('Built: e2e/v4/vite/dist/');
