import { siteData } from '../js/content.js';

export const pages = ['index.html', 'usluge/index.html', 'projekti/index.html', 'o-nama/index.html', 'kontakt/index.html', 'web-stranice-za-poduzeca/index.html', 'privatnost/index.html', '404.html'];
export const routes = [
  ['home', 'Početna', '/'], ['services', 'Usluge', '/usluge/'], ['projects', 'Projekti', '/projekti/'],
  ['about', 'O nama', '/o-nama/'], ['contact', 'Kontakt', '/kontakt/'],
];
export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHtml;
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
export const analysisHref = page => ['landing', 'contact'].includes(page) ? '#analiza' : '/kontakt/#analiza';
const logo = () => '<span class="brand-mark" aria-hidden="true"><picture><source srcset="/images/osiris-mark-128.webp" type="image/webp"><img src="/images/osiris-mark-128.png" alt="" width="128" height="128" decoding="async"></picture></span><span class="brand-name">OSIRIS</span>';
const navLinks = page => routes.map(([id,label,href]) => `<a class="nav-link" href="${href}"${id === page ? ' aria-current="page"' : ''}>${label}</a>`).join('');
export function header(page) {
  return `<header class="site-header" data-header><span class="scroll-progress" data-scroll-progress aria-hidden="true"></span><div class="container header-inner">
    <a class="brand" href="/" aria-label="OSIRIS početna stranica">${logo()}</a>
    <nav class="desktop-nav" aria-label="Glavna navigacija">${navLinks(page)}</nav>
    <a class="button button--small button--primary header-cta" href="${analysisHref(page)}">Besplatna analiza ${arrow}</a>
    <details class="mobile-disclosure" data-mobile-disclosure><summary class="menu-toggle"><span class="sr-only">Izbornik</span><span class="menu-symbol" aria-hidden="true"></span></summary>
      <div class="mobile-menu" id="mobile-menu"><nav class="container mobile-nav" aria-label="Mobilna navigacija"><p class="eyebrow">Izbornik</p><div class="mobile-nav-list">${navLinks(page)}</div><div class="mobile-nav-footer"><a class="button button--primary" href="${analysisHref(page)}">Besplatna analiza ${arrow}</a><span>${e(siteData.brand.location)}</span></div></nav></div>
    </details></div></header>`;
}
export function contactLinks() {
  const {email,phone,socials} = siteData.contact;
  return [email && `<a href="mailto:${e(email)}">${e(email)}</a>`, phone && `<a href="tel:${e(phone.replace(/\s/g,''))}">${e(phone)}</a>`, ...Object.entries(socials).filter(([,url])=>url).map(([name,url])=>`<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e({linkedin:'LinkedIn',instagram:'Instagram',github:'GitHub'}[name] || name)}<span class="sr-only"> (nova kartica)</span></a>`)].filter(Boolean).join('');
}
export function footer(page) {
  return `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand-block"><a class="brand" href="/" aria-label="OSIRIS početna stranica">${logo()}</a><p>${e(siteData.brand.description)}</p><span class="location-pill">${e(siteData.brand.location)}</span></div><nav class="footer-links" aria-label="Navigacija u podnožju"><p class="footer-label">Navigacija</p>${navLinks(page)}<a href="/privatnost/">Privatnost</a></nav><div class="footer-contact"><p class="footer-label">Razgovarajmo</p><p>Recite nam što želite poboljšati na webu. Odgovaramo u roku od tri radna dana.</p><a class="text-link" href="${analysisHref(page)}">Besplatna analiza ${arrow}</a><div class="contact-channels">${contactLinks()}</div></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} OSIRIS. Sva prava pridržana.</span><span>${e(siteData.brand.businessName || 'OSIRIS')} · Zagreb</span></div></footer>`;
}
export function picture(project, {sizes='(min-width: 87rem) 405px, (min-width: 60rem) 29vw, 92vw', eager=false, className='frame__media'} = {}) {
  const m = project.media;
  return `<picture class="${className}">${['avif','webp'].map(type=>`<source type="image/${type}" srcset="${e(m.sources[type])}" sizes="${e(sizes)}">`).join('')}<img src="${e(m.src)}" alt="${e(m.alt)}" width="${m.width}" height="${m.height}" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}></picture>`;
}
// Browser chrome around a screenshot. The bar shows the project title, never the host: two live
// URLs contain hyphens and body.innerText must stay free of them.
export function frame(label, media, className='') {
  return `<div class="frame${className?' '+className:''}"><span class="frame__bar" aria-hidden="true"><span class="frame__dots"></span><span class="frame__label">${e(label)}</span></span>${media}</div>`;
}
// The hero carries the two projects the rest of the homepage does not use, so no project repeats.
export function heroTiles() {
  return ['tina-sport-pia','atasol'].map((id,i)=>{
    const project = siteData.projects.find(p=>p.id===id);
    return frame(project.title, picture(project,{sizes:'(min-width: 60rem) 34vw, 78vw',eager:i===0}), `hero-tile hero-tile--${i+1}`);
  }).join('');
}
export function proofStrip() {
  return ['dolce-torte','produkt-auto'].map(id=>{
    const project = siteData.projects.find(p=>p.id===id);
    return frame(project.title, picture(project,{sizes:'(min-width: 60rem) 17vw, 42vw'}), 'proof-strip__item');
  }).join('');
}
export function capabilityPanel() {
  return `<div class="capability-panel">${siteData.serviceTracks.map(s=>`<div class="capability-panel__row"><span class="capability-panel__code">${e(s.code)}</span><ul class="capability-panel__list">${s.includes.map(x=>`<li>${e(x)}</li>`).join('')}</ul></div>`).join('')}</div>`;
}
export function projectCards(variant) {
  const projects = variant === 'cases' ? siteData.projects : ['dolce-torte','dogan-septem','produkt-auto'].map(id=>siteData.projects.find(p=>p.id===id));
  return projects.map((p,i)=>{
    const wide = variant==='cases' && i===projects.length-1;
    const sizes = variant==='cases' ? '(min-width: 87rem) 616px, (min-width: 60rem) 44vw, 92vw' : undefined;
    return `<article class="project-card${wide?' project-card--wide':''}" data-reveal>${frame(p.title,picture(p,{sizes}),'project-card__frame')}<div class="project-card__content"><span class="project-card__index">${e(p.industry)} · ${e(p.category)}</span><h3>${e(p.title)}</h3>${variant==='cases'?`<dl class="project-details"><div><dt>Potreba</dt><dd>${e(p.challenge)}</dd></div><div><dt>Naš doprinos</dt><dd>${e(p.role.join(', '))}.</dd></div><div><dt>Rješenje</dt><dd>${e(p.solution)}</dd></div></dl>`:`<p>${e(p.summary)}</p>`}<a class="text-link" href="${e(p.liveUrl)}" target="_blank" rel="noopener noreferrer">Pogledajte ${e(p.title)} ${arrow}<span class="sr-only"> (otvara se u novoj kartici)</span></a></div></article>`;
  }).join('');
}
export function services(variant) {
  return siteData.serviceTracks.map((s,i)=>`<article class="card${variant==='offers'?' card--offer':''}"${variant==='offers'?` id="${s.id}"`:''} data-reveal><span class="card__index">0${i+1}</span><h3>${e(s.title)}</h3><p>${e(s.description)}</p>${variant==='offers'?`<h4>Uključuje</h4><ul>${s.includes.map(x=>`<li>${e(x)}</li>`).join('')}</ul><a class="text-link" href="/kontakt/#analiza">Razgovarajmo o projektu ${arrow}</a>`:''}</article>`).join('') + (variant==='summary'?'<a class="text-link" href="/usluge/">Pogledajte usluge ↗</a>':'');
}
export function form(prefix) {
  const input = (name,label,type,attrs='') => `<div class="field"><label for="${prefix}-${name}">${label}${['name','email'].includes(name)?' <span aria-hidden="true">*</span>':''}</label><input id="${prefix}-${name}" name="${name}" type="${type}" aria-describedby="${prefix}-${name}-error" ${attrs}><small id="${prefix}-${name}-error" class="field-error" data-error-for="${name}"></small></div>`;
  return `<form data-contact-form action="https://formspree.io/f/${e(siteData.contact.formspreeId)}" method="post"><div class="form-grid">
    ${input('name','Ime i prezime','text','autocomplete="name" required')}${input('email','Email adresa','email','autocomplete="email" inputmode="email" placeholder="ime@primjer.hr" required')}
    <div class="field field--full"><label for="${prefix}-websiteStatus">Trenutačno stanje <span aria-hidden="true">*</span></label><select id="${prefix}-websiteStatus" name="websiteStatus" required aria-describedby="${prefix}-websiteStatus-error"><option value="">Odaberite stanje</option><option value="no-website">Nemamo web stranicu</option><option value="existing">Želimo poboljšati postojeću</option><option value="redesign">Planiramo redizajn</option></select><small id="${prefix}-websiteStatus-error" class="field-error" data-error-for="websiteStatus"></small></div>
    ${input('websiteUrl','Web adresa <span>(opcionalno)</span>','text','autocomplete="url" inputmode="url" placeholder="primjer.hr"')}${input('company','Naziv poduzeća <span>(opcionalno)</span>','text','autocomplete="organization"')}
    <div class="field field--full"><label for="${prefix}-primaryGoal">Što želite postići web stranicom? <span aria-hidden="true">*</span></label><textarea id="${prefix}-primaryGoal" name="primaryGoal" rows="3" required aria-describedby="${prefix}-goal-hint ${prefix}-primaryGoal-error"></textarea><small id="${prefix}-goal-hint" class="field-hint">Npr. jasnije predstaviti usluge, primati upite ili prodavati proizvode.</small><small id="${prefix}-primaryGoal-error" class="field-error" data-error-for="primaryGoal"></small></div>
    <details class="form-details field--full"><summary>Dodajte pojedinosti <span>(opcionalno)</span></summary><div class="field"><label for="${prefix}-message">Dodatna poruka</label><textarea id="${prefix}-message" name="message" rows="3"></textarea></div></details>
    <div class="field--hidden" aria-hidden="true"><label for="${prefix}-fax">Ne ispunjavajte ovo polje</label><input id="${prefix}-fax" name="_gotcha" type="text" tabindex="-1" autocomplete="off"></div></div>
    ${['utm_source','utm_medium','utm_campaign','utm_content','pageUrl'].map(n=>`<input type="hidden" name="${n}">`).join('')}
    <p class="privacy-note">Podatke koristimo samo za pripremu analize i odgovor. <a href="/privatnost/">Privatnost</a></p>
    <button class="button button--primary" type="submit">Zatražite besplatnu analizu</button><p class="form-status" data-form-status tabindex="-1" role="status" aria-live="polite" aria-atomic="true"></p>
    ${siteData.contact.email
      ? `<p class="form-fallback" data-form-fallback hidden>Možete nam pisati i na <a href="mailto:${e(siteData.contact.email)}">${e(siteData.contact.email)}</a>.</p>`
      : `<p class="form-fallback" data-form-fallback hidden>Ako slanje ne uspije, pokušajte ponovno za nekoliko minuta.</p>`}</form>`;
}
// The compact variant sits under a section h2, so its cards drop a level.
function founders(variant = 'page') {
  const tag = variant === 'compact' ? 'h3' : 'h2';
  return siteData.brand.founderProfiles.map(p=>`<article class="founder-card"><span class="eyebrow">${e(p.role || 'OSIRIS')}</span><${tag}>${e(p.name)}</${tag}>${p.bio?`<p>${e(p.bio)}</p>`:''}</article>`).join('');
}
export function chatWidget(page = 'default') {
  const greeting = 'Mi smo OSIRIS iz Zagreba. Pitajte nas o uslugama, projektima ili sljedećem koraku za vaš web.';
  const suggestions = [
    ['Što radite?', 'Što točno radite?'],
    ['Vaši projekti', 'Koje projekte ste objavili?'],
    ['Kako krenuti?', 'Kako možemo krenuti s besplatnom analizom?'],
  ];
  return `<div class="osiris-chat" data-osiris-chat>
  <div class="osiris-chat__scrim" data-chat-scrim hidden></div>
  <div class="osiris-chat__panel" data-chat-panel hidden id="osiris-chat-panel" role="dialog" aria-labelledby="osiris-chat-title">
    <span class="osiris-chat__grip" aria-hidden="true"></span>
    <div class="osiris-chat__header">
      <div class="osiris-chat__identity">
        <span class="osiris-chat__avatar" aria-hidden="true"><picture><source srcset="/images/osiris-mark-128.webp" type="image/webp"><img src="/images/osiris-mark-128.png" alt="" width="48" height="48" decoding="async"></picture></span>
        <div class="osiris-chat__brand">
          <p class="osiris-chat__eyebrow">Studio · Zagreb</p>
          <p class="osiris-chat__title" id="osiris-chat-title">OSIRIS AI</p>
        </div>
      </div>
      <div class="osiris-chat__controls">
        <button type="button" class="osiris-chat__icon-btn" data-chat-reset aria-label="Novi razgovor" disabled>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9 4v10M4 9h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>
        </button>
        <button type="button" class="osiris-chat__icon-btn" data-chat-close aria-label="Zatvori razgovor">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 4l10 10M14 4L4 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>
        </button>
      </div>
    </div>
    <div class="osiris-chat__body">
      <div class="osiris-chat__messages" data-chat-messages role="log" aria-live="polite" aria-relevant="additions">
        <div class="osiris-chat__intro">
          <p class="osiris-chat__intro-label">Dobrodošli</p>
          <p class="osiris-chat__intro-copy">${greeting}</p>
        </div>
      </div>
      <div class="osiris-chat__suggestions" data-chat-suggestions>
        ${suggestions.map(([label, prompt]) => `<button type="button" class="osiris-chat__chip" data-chat-suggestion="${e(prompt)}">${e(label)}</button>`).join('')}
      </div>
      <p class="osiris-chat__status" data-chat-status role="status" aria-live="polite"></p>
      <form class="osiris-chat__form" data-chat-form>
        <label class="sr-only" for="osiris-chat-input">Vaša poruka</label>
        <div class="osiris-chat__composer">
          <textarea id="osiris-chat-input" data-chat-input rows="2" maxlength="2000" placeholder="Napišite pitanje…" required></textarea>
          <button type="submit" class="osiris-chat__send" data-chat-send>
            <span>Pošalji</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div class="osiris-chat__foot">
          <p class="osiris-chat__note">Automatski odgovori studija OSIRIS. Cijene i rokove potvrđujemo putem obrasca.</p>
          <a class="osiris-chat__cta" href="${analysisHref(page)}">Besplatna analiza <span aria-hidden="true">↗</span></a>
        </div>
      </form>
    </div>
  </div>
  <button type="button" class="osiris-chat__launcher" data-chat-launcher aria-expanded="false" aria-controls="osiris-chat-panel" aria-label="Pitajte OSIRIS AI">
    <span class="osiris-chat__launcher-mark" aria-hidden="true"><picture><source srcset="/images/osiris-mark-128.webp" type="image/webp"><img src="/images/osiris-mark-128.png" alt="" width="32" height="32" decoding="async"></picture></span>
    <span class="osiris-chat__launcher-copy">
      <span class="osiris-chat__launcher-kicker">Razgovor</span>
      <span class="osiris-chat__launcher-label">Pitajte OSIRIS AI</span>
    </span>
  </button>
</div>`;
}

export function renderPage(html, route='/') {
  const page = /data-page="([^"]+)"/.exec(html)?.[1] || 'not-found';
  return html.replace('<div data-site-header></div>',`<div data-site-header>${header(page)}</div>`)
    .replace('<div data-site-footer></div>',`<div data-site-footer>${footer(page)}</div>`)
    .replace(/<!-- projects:(previews|cases) -->/g,(_,v)=>projectCards(v))
    .replace('<!-- hero:tiles -->',()=>heroTiles())
    .replace('<!-- capability-panel -->',()=>capabilityPanel())
    .replace('<!-- projects:proof -->',()=>proofStrip())
    .replace(/<!-- services:(summary|offers) -->/g,(_,v)=>services(v))
    .replace(/<!-- form:(contact|landing) -->/g,(_,v)=>form(v))
    .replace(/<!-- founders(?::(compact))? -->/g,(_,v)=>founders(v))
    .replaceAll('<!-- contact-channels -->',contactLinks()?`<div class="contact-channels">${contactLinks()}</div>`:'')
    .replace('<!-- controller -->', e(siteData.brand.businessName || 'OSIRIS') + ', ' + e(siteData.brand.businessAddress || siteData.brand.location))
    .replace('<!-- privacy-contact -->',siteData.contact.email?`<a href="mailto:${e(siteData.contact.email)}">${e(siteData.contact.email)}</a>`:'<a href="/kontakt/">kontaktni obrazac</a>')
    .replace('</body>', `${chatWidget(page)}</body>`);
}
