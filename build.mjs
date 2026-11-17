import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['lab.js'], bundle: true, minify: true, outfile: 'dist/lab.js', target: ['es2020'] });
for (const file of ['index.html', 'fiche.html', 'style.css', 'fiche.css', 'progress.css', 'progress.js', 'assets']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
await cp('src/ui/LICENSE.shadcn', 'dist/LICENSE.shadcn.txt');
await build({ entryPoints: ['src/code-blocks.tsx'], bundle: true, minify: true, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, outfile: 'dist/code-blocks.js', format: 'iife', target: ['es2020'] });
execFileSync(process.execPath, ['node_modules/@tailwindcss/cli/dist/index.mjs', '-i', 'src/code-blocks.css', '-o', 'dist/code-blocks.css', '--minify'], { stdio: 'inherit' });
