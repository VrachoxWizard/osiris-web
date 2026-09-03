import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "dist");

const files = [
  "index.html",
  "css/osiris-v2.css",
  "js/app.js",
  "js/content.js",
  "images/osiris-mark-128.png",
  "images/osiris-mark-128.webp",
  "images/osiris-social-preview.jpg",
  "media/osiris-coding-hero-poster.jpg",
  "media/osiris-coding-hero-poster-960.avif",
  "media/osiris-coding-hero-poster-960.webp",
  "media/osiris-coding-hero-poster-1600.avif",
  "media/osiris-coding-hero-poster-1600.webp",
  "media/osiris-coding-hero-poster-1920.avif",
  "media/osiris-coding-hero-poster-1920.webp",
  "media/osiris-planning-workspace.jpg",
];

const directories = [
  "kontakt",
  "o-nama",
  "privatnost",
  "projekti",
  "usluge",
  "web-stranice-za-poduzeca",
  "fonts",
  "images/projects",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join(root, file), destination);
}

for (const directory of directories) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}

console.log(`Statička verzija pripremljena je u ${output}`);
