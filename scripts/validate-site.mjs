import { access, readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, renderPage } from './render-page.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
const report = (condition, message) => { if (!condition) errors.push(message); };
const count = (source, pattern) => [...source.matchAll(pattern)].length;

function localAssetCandidates(html) {
  const candidates = new Set();
  for (const match of html.matchAll(/(?:src|href|poster)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    const pathname = value.split(/[?#]/)[0];
    if (pathname && extname(pathname)) candidates.add(pathname);
  }
  for (const match of html.matchAll(/srcset=["']([^"']+)["']/g)) {
    for (const item of match[1].split(',')) {
      const value = item.trim().split(/\s+/)[0];
      if (value.startsWith('/') && !value.startsWith('//')) candidates.add(value.split(/[?#]/)[0]);
    }
  }
  return candidates;
}

function parseOklch(value) {
  const match = /^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/i.exec(value.trim());
  if (!match) return null;
  return { l: Number(match[1]) / 100, c: Number(match[2]), h: Number(match[3]) * Math.PI / 180 };
}

function luminanceFromOklch(value) {
  const parsed = parseOklch(value);
  if (!parsed) return null;
  const a = parsed.c * Math.cos(parsed.h);
  const b = parsed.c * Math.sin(parsed.h);
  const lPrime = parsed.l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = parsed.l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = parsed.l - 0.0894841775 * a - 1.291485548 * b;
  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.max(0, Math.min(1, channel)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const a = luminanceFromOklch(first);
  const b = luminanceFromOklch(second);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

for (const page of pages) {
  let html;
  try {
    html = renderPage(await readFile(join(root, page), 'utf8'));
  } catch {
    errors.push(`${page}: datoteka ne postoji ili se ne može renderirati`);
    continue;
  }

  report(count(html, /<h1\b/gi) === 1, `${page}: mora imati točno jedan h1`);
  report(count(html, /<main\b/gi) === 1, `${page}: mora imati točno jedan main`);
  report(/name="viewport" content="width=device-width, initial-scale=1(?:\.0)?, viewport-fit=cover"/.test(html), `${page}: neispravan viewport`);
  report(html.includes('data-site-header'), `${page}: nedostaje header mount`);
  report(html.includes('data-site-footer'), `${page}: nedostaje footer mount`);
  report(html.includes('/css/osiris-v3.css'), `${page}: nije učitan osiris-v3.css`);
  report(!html.includes('/css/osiris-v2.css'), `${page}: osiris-v2.css mora ostati samo rollback asset`);
  report(!/\beyebrow\b/i.test(html), `${page}: dekorativni eyebrow nije dopušten`);
  report(!/data-reveal/i.test(html), `${page}: univerzalni reveal markup nije dopušten`);
  report(!/(frame__dots|traffic-light|browser-chrome|window-dots)/i.test(html), `${page}: lažni browser chrome nije dopušten`);
  const visibleText = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ');
  report(!/(^|[^-])--([^-]|$)/m.test(visibleText), `${page}: dvostruka crtica u sadržaju nije dopuštena`);
  report(!/\.\.\./.test(visibleText), `${page}: tri točke treba zamijeniti znakom elipse`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  report(new Set(ids).size === ids.length, `${page}: duplicirani ID`);
  let previousHeading = 0;
  for (const match of html.matchAll(/<h([1-6])\b/g)) {
    const level = Number(match[1]);
    report(level <= previousHeading + 1, `${page}: preskočena razina naslova`);
    previousHeading = level;
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g)) report(ids.includes(match[1]), `${page}: nepostojeći fragment ${match[1]}`);
  for (const match of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) report(ids.includes(id), `${page}: nepostojeći ARIA cilj ${id}`);
  }

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    report(/\balt=["'][^"']*["']/i.test(image[0]), `${page}: slika nema alt`);
    report(/\bwidth=["']\d+["']/i.test(image[0]), `${page}: slika nema width`);
    report(/\bheight=["']\d+["']/i.test(image[0]), `${page}: slika nema height`);
    report(/\bdecoding=["']async["']/i.test(image[0]), `${page}: slika nema decoding="async"`);
  }
  for (const source of html.matchAll(/<source\b[^>]*\bsrcset=[^>]*>/gi)) {
    report(!/\d+w/.test(source[0]) || /\bsizes=["'][^"']+["']/i.test(source[0]), `${page}: responsive source nema sizes`);
  }
  for (const link of html.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)) {
    report(/\brel=["'][^"']*noopener[^"']*["']/i.test(link[0]), `${page}: vanjska poveznica nema noopener`);
  }
  for (const asset of localAssetCandidates(html)) {
    try { await access(join(root, asset.slice(1))); } catch { errors.push(`${page}: lokalni asset ne postoji: ${asset}`); }
  }

  report(/<dialog\b[^>]*data-chat-dialog/.test(html), `${page}: chat mora koristiti nativni dialog`);
  report(html.includes('data-chat-open'), `${page}: nedostaje pristup razgovoru`);
  for (const formMatch of html.matchAll(/<form\b[\s\S]*?<\/form>/gi)) {
    const markup = formMatch[0];
    if (/\bdata-chat-form\b/i.test(markup)) continue;
    report(markup.includes('action="https://formspree.io/f/'), `${page}: nedostaje POST odredište`);
    report(/method="post"/i.test(markup), `${page}: obrazac mora koristiti POST`);
    report(!/\bnovalidate\b/i.test(markup), `${page}: native validacija mora raditi bez JavaScripta`);
    for (const name of ['name', 'email', 'websiteStatus', 'primaryGoal']) {
      const field = new RegExp(`<[^>]+name=["']${name}["'][^>]*>`, 'i').exec(markup)?.[0];
      report(Boolean(field && /\brequired\b/i.test(field)), `${page}: ${name} mora postojati i biti required`);
      report(Boolean(field && /\baria-describedby=["'][^"']+["']/i.test(field)), `${page}: ${name} nema aria-describedby`);
    }
    for (const name of ['company', 'websiteUrl', 'message']) {
      const field = new RegExp(`<[^>]+name=["']${name}["'][^>]*>`, 'i').exec(markup)?.[0];
      report(Boolean(field && !/\brequired\b/i.test(field)), `${page}: ${name} mora postojati i ostati optional`);
    }
    for (const name of [...attributionKeys, 'pageUrl']) report(markup.includes(`name="${name}"`), `${page}: nedostaje skriveno polje ${name}`);
    report(markup.includes('data-form-status'), `${page}: obrazac nema statusnu regiju`);
  }
}

const tokenPath = join(root, 'tokens.css');
const cssPath = join(root, 'css/osiris-v3.css');
await access(tokenPath).catch(() => errors.push('Nedostaje tokens.css'));
await access(cssPath).catch(() => errors.push('Nedostaje css/osiris-v3.css'));
const tokens = await readFile(tokenPath, 'utf8');
const css = await readFile(cssPath, 'utf8');

report(css.startsWith('/* Hallmark · pre-emit critique:') && css.includes('/* Hallmark · genre: editorial'), 'osiris-v3.css: nedostaje Hallmark app stamp');
report(css.includes('@import url("/tokens.css")'), 'osiris-v3.css: mora učitati tokens.css');
report(!css.includes('!important'), 'osiris-v3.css: !important nije dopušten');
report(!/transition\s*:\s*all\b/i.test(css), 'osiris-v3.css: transition: all nije dopušten');
report(!/(linear-gradient|radial-gradient|conic-gradient)/i.test(css), 'osiris-v3.css: gradijenti nisu dopušteni');
report(!/(bounce|overshoot|1\.56)/i.test(css), 'osiris-v3.css: bounce i overshoot nisu dopušteni');
report(!/\b100vw\b/i.test(css), 'osiris-v3.css: 100vw nije dopušten');
report(/html, body\s*\{[^}]*overflow-x:\s*clip/s.test(css), 'osiris-v3.css: html i body moraju koristiti overflow-x: clip');
report(!/(#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\()/i.test(css), 'osiris-v3.css: boje moraju dolaziti iz tokens.css');
for (const match of css.matchAll(/font-family\s*:\s*([^;]+);/gi)) report(/^var\(--font-(?:display|body|mono)\)$/.test(match[1].trim()), `osiris-v3.css: font-family mora koristiti token (${match[1].trim()})`);
report(!/box-shadow\s*:/i.test(css.replace(/\.chat-dialog\s*\{[\s\S]*?\}/, '')), 'osiris-v3.css: sjena je dopuštena samo na chat dialogu');
report(!/transition\s*:[^;]*(?:width|height|padding|margin|top|left)/i.test(css), 'osiris-v3.css: layout svojstva ne smiju se animirati');

let braceDepth = 0;
for (const character of `${tokens}\n${css}`.replace(/\/\*[\s\S]*?\*\//g, '')) {
  if (character === '{') braceDepth += 1;
  if (character === '}') braceDepth -= 1;
  if (braceDepth < 0) break;
}
report(braceDepth === 0, 'CSS: vitičaste zagrade nisu uravnotežene');

const declared = new Set([...`${tokens}\n${css}`.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
for (const match of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) report(declared.has(match[1]), `osiris-v3.css: nedefinirana varijabla ${match[1]}`);

const colorTokens = new Map([...tokens.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(oklch\([^;\/]+\))\s*;/gi)].map((match) => [match[1], match[2]]));
const contrastPairs = [
  ['ink / paper', '--color-ink', '--color-paper', 4.5],
  ['secondary ink / paper', '--color-ink-2', '--color-paper', 4.5],
  ['muted / paper', '--color-muted', '--color-paper', 4.5],
  ['paper / ink', '--color-paper', '--color-ink', 4.5],
  ['accent ink / accent', '--color-accent-ink', '--color-accent', 4.5],
  ['focus / paper', '--color-focus-paper', '--color-paper', 3],
  ['focus / ink', '--color-focus-ink', '--color-ink', 3],
  ['success / success surface', '--color-success', '--color-success-surface', 4.5],
  ['error / error surface', '--color-error', '--color-error-surface', 4.5],
];
for (const [label, foregroundName, backgroundName, minimum] of contrastPairs) {
  const foreground = colorTokens.get(foregroundName);
  const background = colorTokens.get(backgroundName);
  const ratio = foreground && background ? contrastRatio(foreground, background) : null;
  report(ratio !== null, `tokens.css: nedostaju OKLCH tokeni za ${label}`);
  if (ratio !== null) report(ratio >= minimum, `tokens.css: kontrast ${label} je ${ratio.toFixed(2)}:1`);
}

for (const match of tokens.matchAll(/url\(["']?(\/fonts\/[^"')]+)["']?\)/g)) {
  try { await access(join(root, match[1].slice(1))); } catch { errors.push(`Nedostaje font: ${match[1]}`); }
}
await access(join(root, 'fonts/OFL-IBM-Plex-Mono.txt')).catch(() => errors.push('Nedostaje IBM Plex Mono OFL licenca'));
await access(join(root, 'design.md')).catch(() => errors.push('Nedostaje design.md kao jedini dizajnerski autoritet'));

if (errors.length) {
  console.error(`Provjera nije prošla (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Provjera prošla: ${pages.length} ruta, Zagreb Dossier tokeni, obrasci, chat i anti-slop ugovor.`);
