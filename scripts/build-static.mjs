import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, renderPage } from './render-page.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
if (!output.startsWith(root + sep) || output === root) throw new Error('Unsafe output directory');
await rm(output, {recursive:true,force:true});
await mkdir(output,{recursive:true});
for (const file of ['css/osiris-v2.css','js/app.js','js/content.js','images/osiris-mark-128.png','images/osiris-mark-128.webp','images/osiris-social-preview.jpg','media/osiris-coding-hero-poster.jpg','media/osiris-coding-hero-poster-960.avif','media/osiris-coding-hero-poster-960.webp','media/osiris-coding-hero-poster-1600.avif','media/osiris-coding-hero-poster-1600.webp','media/osiris-coding-hero-poster-1920.avif','media/osiris-coding-hero-poster-1920.webp','media/osiris-planning-workspace.jpg']) {
  await mkdir(dirname(join(output,file)),{recursive:true});
  await cp(join(root,file),join(output,file));
}
for (const directory of ['fonts','images/projects']) await cp(join(root,directory),join(output,directory),{recursive:true});
for (const page of pages) {
  await mkdir(dirname(join(output,page)),{recursive:true});
  await writeFile(join(output,page),renderPage(await readFile(join(root,page),'utf8'),page));
}
console.log('Statička stranica pripremljena je u dist/.');
