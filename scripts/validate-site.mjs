import { access, readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
import { renderPage } from './render-page.mjs';
const pages = [
  "index.html",
  "usluge/index.html",
  "projekti/index.html",
  "o-nama/index.html",
  "kontakt/index.html",
  "web-stranice-za-poduzeca/index.html",
  "privatnost/index.html",
  "404.html",
];
const errors = [];

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function report(condition, message) {
  if (!condition) errors.push(message);
}

function rgbFromHex(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function relativeLuminance(hex) {
  const channels = rgbFromHex(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function localAssetCandidates(html) {
  const candidates = new Set();
  const attributes = /(?:src|href|poster|data-video-src-(?:mp4|webm))=["']([^"']+)["']/g;
  for (const match of html.matchAll(attributes)) {
    const value = match[1];
    if (!value.startsWith("/") || value.startsWith("//")) continue;
    const pathname = value.split(/[?#]/)[0];
    if (pathname && extname(pathname)) candidates.add(pathname);
  }

  for (const match of html.matchAll(/srcset=["']([^"']+)["']/g)) {
    for (const item of match[1].split(",")) {
      const value = item.trim().split(/\s+/)[0];
      if (value.startsWith("/") && !value.startsWith("//")) {
        candidates.add(value.split(/[?#]/)[0]);
      }
    }
  }
  return candidates;
}

for (const page of pages) {
  const file = join(root, page);
  let html;
  try {
    html = renderPage(await readFile(file, "utf8"), page);
  } catch {
    errors.push(`${page}: datoteka ne postoji`);
    continue;
  }

  report(count(html, /<h1\b/gi) === 1, `${page}: mora imati točno jedan h1`);
  report(/name="viewport" content="width=device-width, initial-scale=1(?:\.0)?"/.test(html), `${page}: neispravan viewport`);
  report(count(html, /<main\b/gi) === 1, `${page}: mora imati točno jedan main`);
  report(html.includes("data-site-header"), `${page}: nedostaje header mount`);
  report(html.includes("data-site-footer"), `${page}: nedostaje footer mount`);
  report(html.includes("/css/osiris-v2.css"), `${page}: nije učitan osiris-v2.css`);
  report(
    !/osiris-(?:brutal|polish|enhanced|media|services|about)\.css/i.test(html),
    `${page}: još učitava legacy stylesheet`,
  );

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  report(new Set(ids).size === ids.length, page + ': duplicirani ID');
  let previousHeading = 0;
  for (const match of html.matchAll(/<h([1-6])\b/g)) {
    const level = Number(match[1]);
    report(level <= previousHeading + 1, page + ': preskočena razina naslova');
    previousHeading = level;
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g)) report(ids.includes(match[1]), page + ': nepostojeći fragment ' + match[1]);
  for (const match of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) report(ids.includes(id), page + ': nepostojeći ARIA cilj ' + id);
  }
  report(html.includes('<header ') && html.includes('<footer>') || html.includes('<header ') && html.includes('<footer '), page + ': nedostaje statička navigacija');
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    report(/\balt=["'][^"']*["']/i.test(image[0]), page + ': slika nema alt');
    report(/\bwidth=["']\d+["']/i.test(image[0]), `${page}: slika nema width`);
    report(/\bheight=["']\d+["']/i.test(image[0]), `${page}: slika nema height`);
    report(/\bdecoding=["']async["']/i.test(image[0]), `${page}: slika nema decoding="async"`);
  }

  for (const source of html.matchAll(/<source\b[^>]*\bsrcset=[^>]*>/gi)) {
    report(!/\d+w/.test(source[0]) || /\bsizes=["'][^"']+["']/i.test(source[0]), `${page}: responsive source nema sizes`);
  }

  for (const externalLink of html.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)) {
    report(/\brel=["'][^"']*noopener[^"']*["']/i.test(externalLink[0]), `${page}: vanjska poveznica nema noopener`);
  }

  for (const asset of localAssetCandidates(html)) {
    try {
      await access(join(root, asset.slice(1)));
    } catch {
      errors.push(`${page}: lokalni asset ne postoji: ${asset}`);
    }
  }

  for (const form of html.matchAll(/<form\b[\s\S]*?<\/form>/gi)) {
    const markup = form[0];
    report(markup.includes('action="https://formspree.io/f/'), page + ': nedostaje POST odredište');
    report(/method="post"/i.test(markup), page + ': obrazac mora koristiti POST');
    report(!/\bnovalidate\b/i.test(markup), page + ': native validacija mora raditi bez JavaScripta');
    for (const requiredName of ["name", "email", "websiteStatus", "primaryGoal"]) {
      const field = new RegExp(`<[^>]+name=["']${requiredName}["'][^>]*>`, "i").exec(markup)?.[0];
      report(Boolean(field), `${page}: obrazac nema polje ${requiredName}`);
      report(Boolean(field && /\brequired\b/i.test(field)), `${page}: ${requiredName} mora biti required`);
    }
    for (const optionalName of ["company", "websiteUrl", "message"]) {
      const field = new RegExp(`<[^>]+name=["']${optionalName}["'][^>]*>`, "i").exec(markup)?.[0];
      if (field) {
        report(!/\brequired\b/i.test(field), `${page}: ${optionalName} mora ostati optional`);
      }
    }
    report(markup.includes("data-form-status"), `${page}: obrazac nema statusnu regiju`);
    for (const requiredName of ["name", "email", "websiteStatus", "primaryGoal"]) {
      const field = new RegExp(`<[^>]+name=["']${requiredName}["'][^>]*>`, "i").exec(markup)?.[0];
      report(Boolean(field && /\baria-describedby=["'][^"']+["']/i.test(field)), `${page}: ${requiredName} nema aria-describedby`);
    }
  }
}

const cssPath = join(root, "css/osiris-v2.css");
const css = await readFile(cssPath, "utf8");
report(!css.includes("!important"), "osiris-v2.css: !important nije dopušten");
report(!/transition\s*:\s*all\b/i.test(css), "osiris-v2.css: transition: all nije dopušten");

let braceDepth = 0;
for (const character of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
  if (character === "{") braceDepth += 1;
  if (character === "}") braceDepth -= 1;
  if (braceDepth < 0) break;
}
report(braceDepth === 0, "osiris-v2.css: vitičaste zagrade nisu uravnotežene");

const declaredVariables = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
for (const match of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
  report(declaredVariables.has(match[1]), `osiris-v2.css: nedefinirana varijabla ${match[1]}`);
}

const resetLayerIndex = css.indexOf("@layer reset");
report(resetLayerIndex > -1, "osiris-v2.css: nedostaje reset sloj");
const literalColorsOutsideTokens = [
  ...(resetLayerIndex > -1 ? css.slice(resetLayerIndex) : css).matchAll(/#[0-9a-f]{3,8}\b/gi),
];
report(
  literalColorsOutsideTokens.length === 0,
  `osiris-v2.css: literalne hex boje izvan token sloja nisu dopuštene (${literalColorsOutsideTokens.map((match) => match[0]).join(", ")})`,
);

const colorTokens = new Map(
  [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)].map((match) => [
    match[1],
    match[2],
  ]),
);
const contrastPairs = [
  ["bijeli tekst / Tech Blue", "--white", "--tech-blue"],
  ["bijeli tekst / Deep Blue", "--white", "--deep-blue"],
  ["bijeli tekst / ink", "--white", "--ink"],
  ["tamni tekst / Paper", "--text-ink", "--paper"],
  ["sekundarni tekst / Paper", "--text-slate", "--paper"],
  ["sekundarni tekst / Soft Blue", "--text-muted-paper", "--soft-blue"],
  ["svijetla poveznica / ink", "--link-dark", "--ink"],
  ["navigacija / ink", "--text-navigation", "--ink"],
  ["sekundarni tekst / Tech Blue", "--text-muted-brand", "--tech-blue"],
  ["success tekst / success površina", "--success", "--success-surface"],
  ["error tekst / error površina", "--error", "--error-surface"],
  ["breadcrumb na svijetloj površini", "--deep-blue", "--paper"],
  ["obrub polja", "--field-border", "--white"],
  ["fokus kartice", "--deep-blue", "--white"],
];

for (const [label, foregroundToken, backgroundToken] of contrastPairs) {
  const foreground = colorTokens.get(foregroundToken);
  const background = colorTokens.get(backgroundToken);
  report(Boolean(foreground && background), `osiris-v2.css: nedostaju tokeni za kontrast ${label}`);
  if (foreground && background) {
    const ratio = contrastRatio(foreground, background);
    report(ratio >= 4.5, `osiris-v2.css: kontrast ${label} je ${ratio.toFixed(2)}:1`);
  }
}

for (const match of css.matchAll(/url\(["']?(\/fonts\/[^"')]+)["']?\)/g)) {
  try { await access(join(root, match[1].slice(1))); } catch { errors.push('Nedostaje font: ' + match[1]); }
}
if (errors.length) {
  console.error(`Provjera nije prošla (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Provjera prošla: ${pages.length} ruta, lokalni asseti, obrasci i CSS ugovor.`);
