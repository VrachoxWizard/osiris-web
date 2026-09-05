import { siteData } from './content.js';

const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
function preserveAttribution() {
  const params = new URLSearchParams(location.search);
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
    for (const key of attributionKeys) {
      if (params.has(key) && !url.searchParams.has(key)) url.searchParams.set(key, params.get(key));
    }
    link.href = url.href;
  });
  document.querySelectorAll('[data-contact-form]').forEach(form => {
    attributionKeys.forEach(key => { form.elements.namedItem(key).value = params.get(key) || ''; });
    form.elements.namedItem('pageUrl').value = location.href;
  });
}

function setupNavigation() {
  const disclosure = document.querySelector('[data-mobile-disclosure]');
  const header = document.querySelector('[data-header]');
  if (!disclosure || !header) return;
  const summary = disclosure.querySelector('summary');
  const regions = [document.querySelector('main'), document.querySelector('[data-site-footer]')].filter(Boolean);
  const desktop = matchMedia('(min-width: 60rem)');
  const close = (focus = false) => {
    disclosure.open = false;
    document.body.classList.remove('menu-open');
    regions.forEach(region => { region.inert = false; });
    if (focus && !desktop.matches) summary.focus();
  };
  disclosure.addEventListener('toggle', () => {
    const open = disclosure.open && !desktop.matches;
    document.body.classList.toggle('menu-open', open);
    regions.forEach(region => { region.inert = open; });
  });
  disclosure.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));
  document.addEventListener('keydown', event => {
    if (!disclosure.open || desktop.matches) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
    if (event.key !== 'Tab') return;
    const focusable = [summary, ...disclosure.querySelectorAll('a[href]')].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !disclosure.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !disclosure.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  desktop.addEventListener('change', () => { if (desktop.matches) close(); });
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 12);
  addEventListener('scroll', updateHeader, { passive: true });
  addEventListener('pageshow', () => { close(); updateHeader(); });
  updateHeader();
}

const requiredMessages = {
  name: 'Unesite ime i prezime.',
  email: 'Unesite email adresu.',
  websiteStatus: 'Odaberite trenutačno stanje.',
  primaryGoal: 'Opišite što želite postići web stranicom.',
};
function normalizeWebsite(control) {
  if (control.name !== 'websiteUrl' || !control.value.trim()) return '';
  const value = control.value.trim();
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error();
    control.value = url.href;
    return '';
  } catch { return 'Unesite web adresu, npr. primjer.hr ili https://primjer.hr.'; }
}
function setupContactForms() {
  document.querySelectorAll('[data-contact-form]').forEach(form => {
    const submit = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-form-status]');
    const fallback = form.querySelector('[data-form-fallback]');
    const controls = [...form.elements].filter(el => ['INPUT','SELECT','TEXTAREA'].includes(el.tagName) && el.type !== 'hidden' && el.name !== '_gotcha');
    const errors = new Map([...form.querySelectorAll('[data-error-for]')].map(el => [el.dataset.errorFor, el]));
    let submitting = false;
    const setState = (state, message = '', focus = false) => {
      form.dataset.state = state;
      status.dataset.state = state;
      status.textContent = message;
      if (fallback) fallback.hidden = state !== 'error';
      if (focus) status.focus();
    };
    const clearError = control => {
      control.removeAttribute('aria-invalid');
      if (errors.has(control.name)) errors.get(control.name).textContent = '';
    };
    controls.forEach(control => {
      control.addEventListener('input', () => {
        clearError(control);
        if (!submitting && form.dataset.state === 'error') setState('idle');
      });
      control.addEventListener('change', () => clearError(control));
      if (control.name === 'websiteUrl') control.addEventListener('blur', () => normalizeWebsite(control));
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submitting) return;
      let firstInvalid;
      controls.forEach(control => {
        clearError(control);
        let message = normalizeWebsite(control);
        if (control.required && !control.value.trim()) message = requiredMessages[control.name];
        else if (control.type === 'email' && control.validity.typeMismatch) message = 'Unesite ispravnu email adresu, npr. ime@primjer.hr.';
        else if (!message && !control.validity.valid) message = 'Provjerite unesenu vrijednost.';
        if (!message) return;
        control.setAttribute('aria-invalid','true');
        if (errors.has(control.name)) errors.get(control.name).textContent = message;
        firstInvalid ||= control;
      });
      if (firstInvalid) {
        setState('error','Provjerite označena polja.');
        firstInvalid.focus(); return;
      }
      const data = new FormData(form);
      data.set('pageUrl', location.href);
      submitting = true;
      form.setAttribute('aria-busy','true');
      const disabled = controls.map(control => control.disabled);
      controls.forEach(control => { control.disabled = true; });
      submit.disabled = true;
      const originalLabel = submit.textContent;
      submit.textContent = 'Šaljemo…';
      setState('pending','Šaljemo vaš zahtjev…');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.action, {method:'POST',headers:{Accept:'application/json'},body:data,signal:controller.signal});
        if (!response.ok) throw new Error(response.status === 429 ? 'rate-limit' : 'service');
        form.reset();
        preserveAttribution();
        setState('success',siteData.contact.statusMessage,true);
      } catch (error) {
        const message = error.name === 'AbortError' ? 'Slanje traje predugo. Pokušajte ponovno za nekoliko trenutaka.' : error.message === 'rate-limit' ? 'Previše zahtjeva. Pričekajte nekoliko minuta pa pokušajte ponovno.' : error.message === 'service' ? 'Zahtjev nije poslan zbog pogreške servisa. Pokušajte ponovno.' : 'Zahtjev nije poslan. Provjerite vezu i pokušajte ponovno.';
        setState('error',message,true);
      } finally {
        clearTimeout(timeout);
        controls.forEach((control,i) => { control.disabled = disabled[i]; });
        submit.disabled = false;
        submit.textContent = originalLabel;
        form.removeAttribute('aria-busy');
        submitting = false;
      }
    });
    form.noValidate = true;
    form.dataset.state = 'idle';
  });
}

setupNavigation();
preserveAttribution();
setupContactForms();
