import { defineConfig } from 'vite-plus';
import tailwind from '@tailwindcss/postcss';
import { copyFile } from 'node:fs/promises';

export default defineConfig({
  css: { postcss: { plugins: [tailwind()] } },
  build: {
    rolldownOptions: { input: { index: 'index.html', fiche: 'fiche.html' } },
    assetsInlineLimit: 0,
  },
  plugins: [{ name: 'shadcn-license', apply: 'build', async closeBundle() {
    await copyFile('src/ui/LICENSE.shadcn', 'dist/LICENSE.shadcn.txt');
  } }],
});
