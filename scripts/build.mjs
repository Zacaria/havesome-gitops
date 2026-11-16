import { rm, mkdir, cp } from 'node:fs/promises';
import { build } from 'esbuild';
await rm('dist', {recursive:true, force:true}); await mkdir('dist');
for (const file of ['index.html','style.css','assets']) await cp(file, `dist/${file}`, {recursive:true});
await build({entryPoints:['lab.js'], bundle:true, minify:true, outfile:'dist/lab.js', target:'es2020'});
