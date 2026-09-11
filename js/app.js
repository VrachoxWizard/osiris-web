import { setupChatWidget } from './chat.js';
import { siteData } from './content.js';

const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

function preserveAttribution() {
  const params = new URLSearchParams(location.search);
  document.querySelectorAll('a[href]').forEach((link) => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
    for (const key of attributionKeys) {
      if (params.has(key) && !url.searchParams.has(key)) url.searchParams.set(key, params.get(key));
    }
    link.href = url.href;
  });

  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    attributionKeys.forEach((key) => {
      form.elements.namedItem(key).value = params.get(key) || '';
    });
    form.elements.namedItem('pageUrl').value = location.href;
  });
}

function setupNavigation() {
  const disclosure = document.querySelector('[data-mobile-disclosure]');
  if (!disclosure) return;
  const summary = disclosure.querySelector('summary');
  const desktop = matchMedia('(min-width: 52rem)');
  const regions = [
    document.querySelector('main'),
    document.querySelector('[data-site-footer]'),
    document.querySelector('[data-osiris-chat]'),
  ].filter(Boolean);

  const close = ({ returnFocus = false } = {}) => {
    disclosure.open = false;
    summary.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    regions.forEach((region) => { region.inert = false; });
    if (returnFocus && !desktop.matches) summary.focus();
  };

  const sync = () => {
    const open = disclosure.open && !desktop.matches;
    summary.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    regions.forEach((region) => { region.inert = open; });
  };

  disclosure.addEventListener('toggle', sync);
  disclosure.querySelectorAll('a, [data-chat-open]').forEach((control) => {
    control.addEventListener('click', () => close());
  });

  document.addEventListener('keydown', (event) => {
    if (!disclosure.open || desktop.matches) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close({ returnFocus: true });
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [summary, ...disclosure.querySelectorAll('a[href], button:not(:disabled)')]
      .filter((element) => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !disclosure.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !disclosure.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });

  desktop.addEventListener('change', () => { if (desktop.matches) close(); });
  addEventListener('pageshow', () => close());
  summary.setAttribute('aria-expanded', 'false');
}

const requiredMessages = {
  name: 'Nedostaje ime i prezime. Upišite osobu kojoj možemo odgovoriti.',
  email: 'Nedostaje email adresa. Upišite adresu na koju možemo poslati analizu.',
  websiteStatus: 'Nije odabrano trenutačno stanje. Odaberite jednu od ponuđenih mogućnosti.',
  primaryGoal: 'Nedostaje poslovni cilj. Ukratko opišite što web treba postići.',
};

function websiteError(control, { normalize = false } = {}) {
  if (control.name !== 'websiteUrl' || !control.value.trim()) return '';
  const value = control.value.trim();
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error();
    if (normalize) control.value = url.href;
    return '';
  } catch {
    return 'Web adresa nije prepoznata. Upišite je kao primjer.hr ili https://primjer.hr.';
  }
}

function setupContactForms() {
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    const submit = form.querySelector('button[type="submit"]');
    const submitLabel = submit.querySelector('[data-submit-label]');
    const status = form.querySelector('[data-form-status]');
    const fallback = form.querySelector('[data-form-fallback]');
    const controls = [...form.elements].filter((element) => (
      ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
      && element.type !== 'hidden'
      && element.name !== '_gotcha'
    ));
    const errors = new Map([...form.querySelectorAll('[data-error-for]')].map((element) => [element.dataset.errorFor, element]));
    const touched = new Set();
    let submitting = false;

    const setState = (state, message = '', focus = false) => {
      form.dataset.state = state;
      status.dataset.state = state;
      status.textContent = message;
      if (fallback) fallback.hidden = state !== 'error';
      if (focus) status.focus();
    };

    const showValidation = (control, message) => {
      const field = control.closest('.field');
      if (message) {
        control.setAttribute('aria-invalid', 'true');
        field?.removeAttribute('data-valid');
        if (errors.has(control.name)) errors.get(control.name).textContent = message;
        return false;
      }
      control.removeAttribute('aria-invalid');
      if (errors.has(control.name)) errors.get(control.name).textContent = '';
      if (touched.has(control) && control.value.trim()) field?.setAttribute('data-valid', 'true');
      else field?.removeAttribute('data-valid');
      return true;
    };

    const validate = (control, { normalize = false } = {}) => {
      let message = websiteError(control, { normalize });
      if (!message && control.required && !control.value.trim()) message = requiredMessages[control.name];
      else if (!message && control.type === 'email' && control.validity.typeMismatch) message = 'Email adresa nije ispravna. Upišite je kao ime@primjer.hr.';
      else if (!message && !control.validity.valid) message = 'Vrijednost nije ispravna. Provjerite unos i pokušajte ponovno.';
      return showValidation(control, message);
    };

    controls.forEach((control) => {
      control.addEventListener('focus', () => { control.closest('.field')?.setAttribute('data-state', 'typing'); });
      control.addEventListener('blur', () => {
        control.closest('.field')?.removeAttribute('data-state');
        touched.add(control);
        validate(control, { normalize: control.name === 'websiteUrl' });
      });
      control.addEventListener('input', () => {
        if (touched.has(control)) validate(control);
        if (!submitting && form.dataset.state === 'error') setState('idle');
      });
      control.addEventListener('change', () => {
        if (touched.has(control)) validate(control);
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitting) return;

      let firstInvalid;
      controls.forEach((control) => {
        touched.add(control);
        if (!validate(control, { normalize: control.name === 'websiteUrl' })) firstInvalid ||= control;
      });

      if (firstInvalid) {
        setState('error', 'Provjerite označena polja. Svaka poruka objašnjava što treba ispraviti.');
        firstInvalid.focus();
        return;
      }

      const data = new FormData(form);
      data.set('pageUrl', location.href);
      submitting = true;
      form.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      submitLabel.textContent = 'Šaljemo';
      setState('loading', 'Šaljemo vaš zahtjev…');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(response.status === 429 ? 'rate-limit' : 'service');
        form.reset();
        touched.clear();
        form.querySelectorAll('.field').forEach((field) => field.removeAttribute('data-valid'));
        preserveAttribution();
        setState('success', siteData.contact.statusMessage, true);
      } catch (error) {
        const message = error.name === 'AbortError'
          ? 'Slanje traje predugo. Pokušajte ponovno za nekoliko trenutaka.'
          : error.message === 'rate-limit'
            ? 'Previše zahtjeva. Pričekajte nekoliko minuta pa pokušajte ponovno.'
            : error.message === 'service'
              ? 'Zahtjev nije poslan zbog pogreške servisa. Pokušajte ponovno.'
              : 'Zahtjev nije poslan. Provjerite vezu i pokušajte ponovno.';
        setState('error', message, true);
      } finally {
        clearTimeout(timeout);
        submit.disabled = false;
        submitLabel.textContent = 'Pošaljite zahtjev';
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
setupChatWidget();
