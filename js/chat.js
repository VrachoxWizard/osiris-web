const STORAGE_KEY = 'osiris-chat';
const MAX_HISTORY = 12;
const MAX_STORED_CHARS = 20000;

const history = [];

function escapeText(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(state) {
  try {
    const payload = JSON.stringify(state);
    if (payload.length > MAX_STORED_CHARS) return;
    sessionStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Private browsing or a full quota: the conversation simply stays per page.
  }
}

function clearStored() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}

function appendBubble(container, role, text, { pending = false } = {}) {
  // Preserve the reading position when the visitor has scrolled up to re-read an answer.
  const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 48;
  const bubble = document.createElement('div');
  bubble.className = `osiris-chat__bubble osiris-chat__bubble--${role}${pending ? ' is-pending' : ''}`;
  if (pending) {
    bubble.innerHTML = '<span class="osiris-chat__typing" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">OSIRIS odgovara</span>';
  } else {
    bubble.innerHTML = escapeText(text).replace(/\n/g, '<br>');
  }
  container.appendChild(bubble);
  if (nearBottom || pending) container.scrollTop = container.scrollHeight;
  return bubble;
}

export function setupChatWidget() {
  const root = document.querySelector('[data-osiris-chat]');
  if (!root) return;

  const launcher = root.querySelector('[data-chat-launcher]');
  const panel = root.querySelector('[data-chat-panel]');
  const scrim = root.querySelector('[data-chat-scrim]');
  const closeBtn = root.querySelector('[data-chat-close]');
  const resetBtn = root.querySelector('[data-chat-reset]');
  const form = root.querySelector('[data-chat-form]');
  const input = root.querySelector('[data-chat-input]');
  const send = root.querySelector('[data-chat-send]');
  const messages = root.querySelector('[data-chat-messages]');
  const status = root.querySelector('[data-chat-status]');
  const suggestions = root.querySelector('[data-chat-suggestions]');
  if (!launcher || !panel || !form || !input || !send || !messages || !status) return;

  const introHtml = messages.innerHTML;
  const sheet = matchMedia('(max-width: 39.99rem)');
  const backdrop = [
    document.querySelector('[data-header]'),
    document.querySelector('main'),
    document.querySelector('[data-site-footer]'),
  ].filter(Boolean);
  let open = false;
  let pending = false;
  let lastFailed = '';

  const setStatus = (text = '', { error = false, retry = false } = {}) => {
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(text) && error);
    if (!retry) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'osiris-chat__chip';
    button.textContent = 'Pokušajte ponovno';
    button.addEventListener('click', () => {
      const retryText = lastFailed;
      if (!retryText) return;
      lastFailed = '';
      setStatus('');
      sendMessage(retryText, { resend: true });
    });
    status.appendChild(button);
  };

  const persist = () => {
    if (!history.length) {
      clearStored();
      return;
    }
    writeStored({ open, messages: history });
  };

  const setBackdropInert = (inert) => {
    backdrop.forEach((region) => { region.inert = inert; });
    document.body.classList.toggle('chat-sheet-open', inert);
  };

  const applySheetState = () => {
    const modal = open && sheet.matches;
    if (scrim) scrim.hidden = !modal;
    if (modal) panel.setAttribute('aria-modal', 'true');
    else panel.removeAttribute('aria-modal');
    setBackdropInert(modal);
  };

  const focusable = () =>
    [...panel.querySelectorAll('button, a[href], textarea, input, select')].filter(
      (el) => !el.disabled && el.getClientRects().length,
    );

  // Only measurable once the panel is visible, so this has to run after the hidden flag clears.
  const scrollToLatest = () => { messages.scrollTop = messages.scrollHeight; };

  const setOpen = (next, { focus = true } = {}) => {
    open = next;
    panel.hidden = !open;
    root.classList.toggle('is-open', open);
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    applySheetState();
    persist();
    if (open) scrollToLatest();
    if (!focus) return;
    if (open) input.focus();
    else launcher.focus();
  };

  const hideSuggestions = () => {
    if (suggestions) suggestions.hidden = true;
  };

  const showSuggestions = () => {
    if (suggestions) suggestions.hidden = false;
  };

  const syncResetButton = () => {
    if (resetBtn) resetBtn.disabled = pending || !history.length;
  };

  const resetConversation = () => {
    if (pending) return;
    history.length = 0;
    lastFailed = '';
    messages.innerHTML = introHtml;
    messages.scrollTop = 0;
    showSuggestions();
    setStatus('');
    syncResetButton();
    clearStored();
    input.value = '';
    input.focus();
  };

  const restore = () => {
    const stored = readStored();
    if (!stored) return;
    for (const message of stored.messages) {
      if (!message || (message.role !== 'user' && message.role !== 'assistant')) continue;
      if (typeof message.content !== 'string' || !message.content) continue;
      history.push({ role: message.role, content: message.content });
      appendBubble(messages, message.role, message.content);
    }
    if (!history.length) return;
    hideSuggestions();
    syncResetButton();
    if (stored.open) setOpen(true, { focus: false });
  };

  const sendMessage = async (text, { resend = false } = {}) => {
    if (pending || !text) return;

    if (!resend) {
      appendBubble(messages, 'user', text);
      history.push({ role: 'user', content: text });
      input.value = '';
    }
    hideSuggestions();
    pending = true;
    send.disabled = true;
    input.disabled = true;
    syncResetButton();
    form.setAttribute('aria-busy', 'true');
    setStatus('OSIRIS odgovara…');

    const thinking = appendBubble(messages, 'assistant', '', { pending: true });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'service');
      }
      thinking.remove();
      appendBubble(messages, 'assistant', data.reply);
      history.push({ role: 'assistant', content: data.reply });
      if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
      lastFailed = '';
      setStatus('');
    } catch (error) {
      thinking.remove();
      const message =
        error.name === 'AbortError'
          ? 'Odgovor traje predugo.'
          : typeof error.message === 'string' && error.message !== 'service'
            ? error.message
            : 'Trenutačno ne možemo odgovoriti. Pokušajte ponovno ili zatražite besplatnu analizu.';
      lastFailed = text;
      setStatus(message, { error: true, retry: true });
    } finally {
      clearTimeout(timeout);
      pending = false;
      send.disabled = false;
      input.disabled = false;
      syncResetButton();
      form.removeAttribute('aria-busy');
      persist();
      input.focus();
    }
  };

  launcher.addEventListener('click', () => setOpen(!open));
  closeBtn?.addEventListener('click', () => setOpen(false));
  resetBtn?.addEventListener('click', resetConversation);
  scrim?.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab' || !sheet.matches) return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });

  sheet.addEventListener('change', applySheetState);
  addEventListener('pageshow', () => { if (!open) setBackdropInert(false); });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  suggestions?.querySelectorAll('[data-chat-suggestion]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (pending) return;
      sendMessage(chip.getAttribute('data-chat-suggestion') || chip.textContent.trim());
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value.trim());
  });

  syncResetButton();
  restore();
}
