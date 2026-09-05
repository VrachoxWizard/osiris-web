import { siteData } from '../js/content.js';

export const pages = ['index.html', 'usluge/index.html', 'projekti/index.html', 'o-nama/index.html', 'kontakt/index.html', 'web-stranice-za-poduzeca/index.html', 'privatnost/index.html', '404.html'];
export const routes = [
  ['services', 'Usluge', '/usluge/'], ['projects', 'Projekti', '/projekti/'],
  ['about', 'O nama', '/o-nama/'], ['contact', 'Kontakt', '/kontakt/'],
];
export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHtml;
const arrow = '<span aria-hidden="true">↗</span>';
export const analysisHref = page => ['landing', 'contact'].includes(page) ? '#analiza' : '/kontakt/#analiza';
const logo = () => '<span class="brand-mark" aria-hidden="true"><picture><source srcset="/images/osiris-mark-128.webp" type="image/webp"><img src="/images/osiris-mark-128.png" alt="" width="128" height="128" decoding="async"></picture></span><span class="brand-name">OSIRIS</span>';
const navLinks = page => routes.map(([id,label,href]) => `<a class="nav-link" href="${href}"${id === page ? ' aria-current="page"' : ''}>${label}</a>`).join('');
export function header(page) {
  return `<header class="site-header" data-header><div class="container header-inner">
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
  return `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand-block"><a class="brand" href="/" aria-label="OSIRIS početna stranica">${logo()}</a><p>${e(siteData.brand.description)}</p><span class="location-pill">${e(siteData.brand.location)}</span></div><nav class="footer-links" aria-label="Navigacija u podnožju"><p class="footer-label">Navigacija</p>${navLinks(page)}<a href="/privatnost/">Privatnost</a></nav><div class="footer-contact"><p class="footer-label">Razgovarajmo</p><p>Recite nam što želite poboljšati na webu. Odgovaramo u roku od tri radna dana.</p><a class="text-link" href="${analysisHref(page)}">Besplatna analiza ${arrow}</a><div class="contact-channels">${contactLinks()}</div></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} OSIRIS. Sva prava pridržana.</span><span>${e(siteData.brand.businessName || 'Tin i Mate · Zagreb')}</span></div></footer>`;
}
export function picture(project, {sizes='(min-width: 87rem) 405px, (min-width: 60rem) 29vw, 92vw', eager=false, className='project-card__media'} = {}) {
  const m = project.media;
  return `<picture class="${className}">${['avif','webp'].map(type=>`<source type="image/${type}" srcset="${e(m.sources[type])}" sizes="${e(sizes)}">`).join('')}<img src="${e(m.src)}" alt="${e(m.alt)}" width="${m.width}" height="${m.height}" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}></picture>`;
}
export function projectCards(variant) {
  const projects = variant === 'cases' ? siteData.projects : ['dolce-torte','dogan-septem','produkt-auto'].map(id=>siteData.projects.find(p=>p.id===id));
  return projects.map((p,i)=>{
    const wide = variant==='cases' && i===projects.length-1;
    const sizes = variant==='cases' ? '(min-width: 87rem) 616px, (min-width: 60rem) 44vw, 92vw' : undefined;
    return `<article class="project-card${wide?' project-card--wide':''}">${picture(p,{sizes})}<div class="project-card__content"><span class="project-card__index">${e(p.industry)} · ${e(p.category)}</span><h3>${e(p.title)}</h3>${variant==='cases'?`<dl class="project-details"><div><dt>Potreba</dt><dd>${e(p.challenge)}</dd></div><div><dt>Naš doprinos</dt><dd>${e(p.role.join(', '))}.</dd></div><div><dt>Rješenje</dt><dd>${e(p.solution)}</dd></div></dl>`:`<p>${e(p.summary)}</p>`}<a class="text-link" href="${e(p.liveUrl)}" target="_blank" rel="noopener noreferrer">Pogledajte ${e(p.title)} ${arrow}<span class="sr-only"> (otvara se u novoj kartici)</span></a></div></article>`;
  }).join('');
}
export function services(variant) {
  return siteData.serviceTracks.map((s,i)=>`<article class="card${variant==='offers'?' card--offer':''}"${variant==='offers'?` id="${s.id}"`:''}><span class="card__index">0${i+1}</span><h3>${e(s.title)}</h3><p>${e(s.description)}</p>${variant==='offers'?`<h4>Uključuje</h4><ul>${s.includes.map(x=>`<li>${e(x)}</li>`).join('')}</ul><a class="text-link" href="/kontakt/#analiza">Razgovarajmo o projektu ${arrow}</a>`:''}</article>`).join('') + (variant==='summary'?'<a class="text-link" href="/usluge/">Pogledajte usluge ↗</a>':'');
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
    ${siteData.contact.email?`<p class="form-fallback" data-form-fallback hidden>Možete nam pisati i na <a href="mailto:${e(siteData.contact.email)}">${e(siteData.contact.email)}</a>.</p>`:''}</form>`;
}
function founders() {
  return siteData.brand.founderProfiles.map(p=>`<article class="founder-card"><span class="eyebrow">${e(p.role || 'Suosnivač')}</span><h2>${e(p.name)}</h2>${p.bio?`<p>${e(p.bio)}</p>`:''}</article>`).join('');
}
export function renderPage(html, route='/') {
  const page = /data-page="([^"]+)"/.exec(html)?.[1] || 'not-found';
  return html.replace('<div data-site-header></div>',`<div data-site-header>${header(page)}</div>`)
    .replace('<div data-site-footer></div>',`<div data-site-footer>${footer(page)}</div>`)
    .replace(/<!-- projects:(previews|cases) -->/g,(_,v)=>projectCards(v))
    .replace(/<!-- services:(summary|offers) -->/g,(_,v)=>services(v))
    .replace(/<!-- form:(contact|landing) -->/g,(_,v)=>form(v))
    .replace('<!-- founders -->',founders())
    .replaceAll('<!-- contact-channels -->',contactLinks()?`<div class="contact-channels">${contactLinks()}</div>`:'')
    .replace('<!-- controller -->', e(siteData.brand.businessName || 'OSIRIS Tin i Mate') + ', ' + e(siteData.brand.businessAddress || siteData.brand.location))
    .replace('<!-- privacy-contact -->',siteData.contact.email?`<a href="mailto:${e(siteData.contact.email)}">${e(siteData.contact.email)}</a>`:'<a href="/kontakt/">kontaktni obrazac</a>');
}
