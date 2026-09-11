import { siteData } from '../js/content.js';

export const pages = [
  'index.html',
  'usluge/index.html',
  'projekti/index.html',
  'o-nama/index.html',
  'kontakt/index.html',
  'web-stranice-za-poduzeca/index.html',
  'privatnost/index.html',
  '404.html',
];

export const routes = [
  ['home', 'Početna', '/'],
  ['services', 'Usluge', '/usluge/'],
  ['projects', 'Projekti', '/projekti/'],
  ['about', 'O nama', '/o-nama/'],
  ['contact', 'Kontakt', '/kontakt/'],
];

export const escapeHtml = (value = '') => String(value).replace(
  /[&<>"']/g,
  (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
);

const e = escapeHtml;
const externalMark = '<span aria-hidden="true">↗</span>';
const currentYear = new Date().getFullYear();

export const analysisHref = (page) => ['landing', 'contact'].includes(page) ? '#analiza' : '/kontakt/#analiza';

const navLinks = (page, className = 'mast-nav__link') => routes.map(([id, label, href]) => (
  `<a class="${className}" href="${href}"${id === page ? ' aria-current="page"' : ''}>${label}</a>`
)).join('');

export function header(page) {
  return `<header class="site-masthead" data-header>
    <div class="masthead-shell">
      <p class="masthead-issue"><span>Zagreb · 45.8150° N, 15.9819° E</span><span>Web studio za mala i srednja poduzeća</span><span>Odgovor · tri radna dana</span></p>
      <a class="masthead-wordmark" href="/" aria-label="OSIRIS početna stranica">OSIRIS</a>
      <div class="masthead-rule-row">
        <nav class="mast-nav" aria-label="Glavna navigacija">${navLinks(page)}</nav>
        <a class="action action--compact masthead-action" href="${analysisHref(page)}">Besplatna analiza</a>
        <details class="mast-disclosure" data-mobile-disclosure>
          <summary class="menu-toggle">Izbornik<span class="menu-toggle__mark" aria-hidden="true"></span></summary>
          <div class="mast-menu">
            <nav class="mast-menu__links" aria-label="Mobilna navigacija">${navLinks(page, 'mast-menu__link')}</nav>
            <div class="mast-menu__actions">
              <a class="action" href="${analysisHref(page)}">Besplatna analiza</a>
              <button class="type-action" type="button" data-chat-open>Razgovor</button>
            </div>
            <p class="mast-menu__meta">OSIRIS · ${e(siteData.brand.location)}</p>
          </div>
        </details>
      </div>
    </div>
  </header>`;
}

export function contactLinks() {
  const { email, phone, socials } = siteData.contact;
  return [
    email && `<a href="mailto:${e(email)}">${e(email)}</a>`,
    phone && `<a href="tel:${e(phone.replace(/\s/g, ''))}">${e(phone)}</a>`,
    ...Object.entries(socials)
      .filter(([, url]) => url)
      .map(([name, url]) => `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e({ linkedin: 'LinkedIn', instagram: 'Instagram', github: 'GitHub' }[name] || name)}<span class="sr-only"> (nova kartica)</span></a>`),
  ].filter(Boolean).join('');
}

export function footer(page) {
  const preFooter = ['privacy', 'contact'].includes(page) ? '' : `<aside class="pre-footer-chat" aria-label="Razgovor s OSIRIS-om">
    <div class="page-shell pre-footer-chat__inner">
      <p>Imate pitanje prije obrasca?</p>
      <button class="type-action" type="button" data-chat-open>Otvorite razgovor</button>
    </div>
  </aside>`;
  return `${preFooter}<footer class="site-colophon">
    <div class="page-shell colophon-copy">
      <p><strong>OSIRIS.</strong> ${e(siteData.brand.description)} <span>${e(siteData.brand.location)}.</span></p>
      <nav aria-label="Navigacija u podnožju">${navLinks(page, 'colophon-link')}<a class="colophon-link" href="/privatnost/">Privatnost</a><a class="colophon-link" href="${analysisHref(page)}">Besplatna analiza</a></nav>
      <p>© ${currentYear} ${e(siteData.brand.businessName || 'OSIRIS')}. Sva prava pridržana.</p>
    </div>
  </footer>`;
}

export function picture(project, {
  sizes = '(min-width: 90rem) 42rem, (min-width: 60rem) 48vw, 92vw',
  eager = false,
  className = 'project-figure__media',
} = {}) {
  const media = project.media;
  return `<picture class="${className}">${['avif', 'webp'].map((type) => `<source type="image/${type}" srcset="${e(media.sources[type])}" sizes="${e(sizes)}">`).join('')}<img src="${e(media.src)}" alt="${e(media.alt)}" width="${media.width}" height="${media.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}></picture>`;
}

export function projectFigure(project, {
  sizes,
  eager = false,
  className = '',
  caption = `${project.title} · ${project.category}`,
} = {}) {
  return `<figure class="project-figure${className ? ` ${className}` : ''}">${picture(project, { sizes, eager })}<figcaption><span>${e(caption)}</span><span>${e(project.status)}</span></figcaption></figure>`;
}

const projectById = (id) => siteData.projects.find((project) => project.id === id);

export function homeWork() {
  const lead = projectById('dolce-torte');
  const references = [projectById('dogan-septem'), projectById('produkt-auto')];
  return `<article class="home-work__lead">
    ${projectFigure(lead, { sizes: '(min-width: 90rem) 84rem, (min-width: 60rem) 88vw, 92vw' })}
    <div class="home-work__lead-copy"><h3>${e(lead.title)}</h3><p>${e(lead.summary)}</p><a class="type-link" href="${e(lead.liveUrl)}" target="_blank" rel="noopener noreferrer">Otvorite projekt ${externalMark}<span class="sr-only"> (nova kartica)</span></a></div>
  </article>
  <div class="home-work__references">${references.map((project) => `<article class="home-reference">${projectFigure(project, { sizes: '(min-width: 60rem) 38vw, 92vw' })}<h3>${e(project.title)}</h3><p>${e(project.summary)}</p><a class="type-link" href="${e(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Projekt uživo ${externalMark}<span class="sr-only"> (nova kartica)</span></a></article>`).join('')}</div>`;
}

export function portfolioCases() {
  const layouts = ['portfolio-case--lead', 'portfolio-case--seven', 'portfolio-case--five', 'portfolio-case--text', 'portfolio-case--closing'];
  return siteData.projects.map((project, index) => `<article class="portfolio-case ${layouts[index]}">
    ${projectFigure(project, { sizes: index === 0 || index === 4 ? '(min-width: 90rem) 84rem, (min-width: 60rem) 88vw, 92vw' : '(min-width: 60rem) 48vw, 92vw' })}
    <div class="portfolio-case__copy">
      <p class="project-meta">${e(project.industry)} · ${e(project.category)}</p>
      <h2>${e(project.title)}</h2>
      <dl class="project-ledger"><div><dt>Potreba</dt><dd>${e(project.challenge)}</dd></div><div><dt>Naš doprinos</dt><dd>${e(project.role.join(', '))}.</dd></div><div><dt>Rješenje</dt><dd>${e(project.solution)}</dd></div></dl>
      <a class="type-link" href="${e(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Projekt uživo ${externalMark}<span class="sr-only"> (nova kartica)</span></a>
    </div>
  </article>`).join('');
}

export function serviceRows() {
  return siteData.serviceTracks.map((service) => `<article class="service-row"><p class="service-code">${e(service.code)}</p><h3>${e(service.title)}</h3><p>${e(service.description)}</p><a class="type-link" href="/usluge/#${e(service.id)}">Detalji usluge</a></article>`).join('');
}

export function serviceAnswers() {
  const proof = projectById('produkt-auto');
  return siteData.serviceTracks.map((service, index) => `<article class="service-answer service-answer--${index + 1}" id="${e(service.id)}">
    <div class="service-answer__question"><h2>${index === 0 ? 'Trebate novu poslovnu stranicu?' : index === 1 ? 'Postojeća stranica više ne prati posao?' : 'Standardna stranica više nije dovoljna?'}</h2><p>${e(service.idealFor)}</p></div>
    <div class="service-answer__body"><p>${e(service.description)}</p><h3>Što uključuje</h3><ul>${service.includes.map((item) => `<li>${e(item)}</li>`).join('')}</ul><a class="type-link" href="/kontakt/#analiza">Pošaljite projekt</a></div>
    ${index === 2 ? `<div class="service-answer__proof">${projectFigure(proof, { sizes: '(min-width: 60rem) 40vw, 92vw' })}<p>${e(proof.solution)}</p><a class="type-link" href="${e(proof.liveUrl)}" target="_blank" rel="noopener noreferrer">Otvorite Produkt Auto ${externalMark}<span class="sr-only"> (nova kartica)</span></a></div>` : ''}
  </article>`).join('');
}

export function landingProof() {
  return ['dolce-torte', 'dogan-septem', 'produkt-auto'].map((id, index) => {
    const project = projectById(id);
    return `<article class="proof-panorama__item proof-panorama__item--${index + 1}">${projectFigure(project, { sizes: '(min-width: 60rem) 44vw, 92vw' })}<h3>${e(project.title)}</h3><p>${e(project.summary)}</p><a class="type-link" href="${e(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Projekt uživo ${externalMark}<span class="sr-only"> (nova kartica)</span></a></article>`;
  }).join('');
}

const fieldShell = (prefix, name, label, control, helper = '') => `<div class="field"><label for="${prefix}-${name}">${label}</label><div class="field-control">${control}</div><small id="${prefix}-${name}-help" class="field-message" data-helper-for="${name}">${helper}</small><small id="${prefix}-${name}-error" class="field-message field-message--error" data-error-for="${name}"></small></div>`;

export function form(prefix) {
  const describedBy = (name) => `${prefix}-${name}-help ${prefix}-${name}-error`;
  return `<form class="analysis-form" data-contact-form action="https://formspree.io/f/${e(siteData.contact.formspreeId)}" method="post">
    <p class="form-required">Obavezna polja označena su tekstom „obavezno”.</p>
    <div class="form-grid">
      ${fieldShell(prefix, 'name', 'Ime i prezime <span>obavezno</span>', `<input id="${prefix}-name" name="name" type="text" autocomplete="name" required aria-required="true" aria-describedby="${describedBy('name')}">`)}
      ${fieldShell(prefix, 'email', 'Email adresa <span>obavezno</span>', `<input id="${prefix}-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="ime@primjer.hr" required aria-required="true" aria-describedby="${describedBy('email')}">`)}
      ${fieldShell(prefix, 'websiteStatus', 'Trenutačno stanje <span>obavezno</span>', `<select id="${prefix}-websiteStatus" name="websiteStatus" required aria-required="true" aria-describedby="${describedBy('websiteStatus')}"><option value="">Odaberite stanje</option><option value="no-website">Nemamo web stranicu</option><option value="existing">Želimo poboljšati postojeću</option><option value="redesign">Planiramo redizajn</option></select>`)}
      ${fieldShell(prefix, 'websiteUrl', 'Web adresa <span>opcionalno</span>', `<input id="${prefix}-websiteUrl" name="websiteUrl" type="text" autocomplete="url" inputmode="url" placeholder="primjer.hr" aria-describedby="${describedBy('websiteUrl')}">`, 'Možete upisati adresu bez prefiksa https.')}
      ${fieldShell(prefix, 'company', 'Naziv poduzeća <span>opcionalno</span>', `<input id="${prefix}-company" name="company" type="text" autocomplete="organization" aria-describedby="${describedBy('company')}">`)}
      ${fieldShell(prefix, 'primaryGoal', 'Što želite postići web stranicom? <span>obavezno</span>', `<textarea id="${prefix}-primaryGoal" name="primaryGoal" rows="4" required aria-required="true" aria-describedby="${describedBy('primaryGoal')}"></textarea>`, 'Primjer: jasnije predstaviti usluge, primati upite ili prodavati proizvode.')}
      <details class="form-details"><summary>Dodajte pojedinosti <span>opcionalno</span></summary>${fieldShell(prefix, 'message', 'Dodatna poruka', `<textarea id="${prefix}-message" name="message" rows="4" aria-describedby="${describedBy('message')}"></textarea>`)}</details>
      <div class="field--hidden" aria-hidden="true"><label for="${prefix}-fax">Ne ispunjavajte ovo polje</label><input id="${prefix}-fax" name="_gotcha" type="text" tabindex="-1" autocomplete="off"></div>
    </div>
    ${['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'pageUrl'].map((name) => `<input type="hidden" name="${name}">`).join('')}
    <div class="form-submit"><p class="privacy-note">Podatke koristimo samo za pripremu analize i odgovor. <a href="/privatnost/">Privatnost</a></p><button class="action" type="submit"><span data-submit-label>Zatražite besplatnu analizu</span><span class="button-state" aria-hidden="true"></span></button></div>
    <p class="form-status" data-form-status tabindex="-1" role="status" aria-live="polite" aria-atomic="true"></p>
    ${siteData.contact.email ? `<p class="form-fallback" data-form-fallback hidden>Možete nam pisati i na <a href="mailto:${e(siteData.contact.email)}">${e(siteData.contact.email)}</a>.</p>` : '<p class="form-fallback" data-form-fallback hidden>Ako slanje ne uspije, pokušajte ponovno za nekoliko minuta.</p>'}
  </form>`;
}

export function chatWidget(page = 'default') {
  const suggestions = [
    ['Što radite?', 'Što točno radite?'],
    ['Vaši projekti', 'Koje projekte ste objavili?'],
    ['Kako krenuti?', 'Kako možemo krenuti s besplatnom analizom?'],
  ];
  return `<div class="osiris-chat" data-osiris-chat>
    <button type="button" class="chat-edge-tab" data-chat-open aria-expanded="false" aria-controls="osiris-chat-dialog">Razgovor</button>
    <dialog class="chat-dialog" data-chat-dialog id="osiris-chat-dialog" aria-labelledby="osiris-chat-title" aria-describedby="osiris-chat-disclosure">
      <div class="chat-dialog__header">
        <div><p class="chat-dialog__meta">OSIRIS · Zagreb</p><h2 id="osiris-chat-title">Razgovor s OSIRIS-om</h2></div>
        <div class="chat-dialog__controls"><button type="button" class="icon-action" data-chat-reset aria-label="Novi razgovor" disabled>+</button><button type="button" class="icon-action" data-chat-close aria-label="Zatvori razgovor">×</button></div>
      </div>
      <div class="chat-dialog__messages" data-chat-messages role="log" aria-live="polite" aria-relevant="additions"><div class="chat-intro"><p>Mi smo OSIRIS iz Zagreba. Pitajte nas o uslugama, projektima ili sljedećem koraku za vaš web.</p></div></div>
      <div class="chat-suggestions" data-chat-suggestions>${suggestions.map(([label, prompt]) => `<button type="button" class="chat-suggestion" data-chat-suggestion="${e(prompt)}">${e(label)}</button>`).join('')}</div>
      <p class="chat-status" data-chat-status role="status" aria-live="polite"></p>
      <form class="chat-form" data-chat-form><label for="osiris-chat-input">Vaša poruka</label><textarea id="osiris-chat-input" data-chat-input rows="3" maxlength="2000" placeholder="Napišite pitanje…" required></textarea><button type="submit" class="action chat-send" data-chat-send>Pošalji</button></form>
      <div class="chat-dialog__foot"><p id="osiris-chat-disclosure">Odgovori su automatski. Cijene i rokove potvrđujemo nakon obrasca.</p><a class="type-link" href="${analysisHref(page)}">Besplatna analiza</a></div>
    </dialog>
  </div>`;
}

export function renderPage(html) {
  const page = /data-page="([^"]+)"/.exec(html)?.[1] || 'not-found';
  return html
    .replace('<div data-site-header></div>', `<div data-site-header>${header(page)}</div>`)
    .replace('<div data-site-footer></div>', `<div data-site-footer>${footer(page)}</div>`)
    .replace('<!-- home:work -->', homeWork())
    .replace('<!-- portfolio:cases -->', portfolioCases())
    .replace('<!-- services:rows -->', serviceRows())
    .replace('<!-- services:answers -->', serviceAnswers())
    .replace('<!-- landing:proof -->', landingProof())
    .replace(/<!-- form:(contact|landing) -->/g, (_, variant) => form(variant))
    .replaceAll('<!-- contact-channels -->', contactLinks() ? `<div class="contact-channels">${contactLinks()}</div>` : '')
    .replace('<!-- controller -->', `${e(siteData.brand.businessName || 'OSIRIS')}, ${e(siteData.brand.businessAddress || siteData.brand.location)}`)
    .replace('<!-- privacy-contact -->', siteData.contact.email ? `<a href="mailto:${e(siteData.contact.email)}">${e(siteData.contact.email)}</a>` : '<a href="/kontakt/">kontaktni obrazac</a>')
    .replace('</body>', `${chatWidget(page)}</body>`);
}
