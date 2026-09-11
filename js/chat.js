const STORAGE_KEY = 'osiris-chat';
const MAX_HISTORY = 12;
const MAX_STORED_CHARS = 20000;
const history = [];

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.messages) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(state) {
  try {
    const payload = JSON.stringify(state);
    if (payload.length <= MAX_STORED_CHARS) sessionStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // If storage is unavailable, the conversation remains available on this page.
  }
}

function clearStored() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // There is nothing else to clear when storage is unavailable.
  }
}

function appendBubble(container, role, text, { pending = false } = {}) {
  const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 48;
  const bubble = document.createElement('div');
  bubble.className = `osiris-chat__bubble osiris-chat__bubble--${role}${pending ? ' is-pending' : ''}`;
  if (pending) {
    bubble.innerHTML = '<span class="osiris-chat__typing" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">OSIRIS odgovara</span>';
  } else {
    const lines = String(text).split('\n');
    lines.forEach((line, index) => {
      if (index) bubble.append(document.createElement('br'));
      bubble.append(document.createTextNode(line));
    });
  }
  container.appendChild(bubble);
  if (nearBottom || pending) container.scrollTop = container.scrollHeight;
  return bubble;
}

export function setupChatWidget() {
  const root = document.querySelector('[data-osiris-chat]');
  const dialog = root?.querySelector('[data-chat-dialog]');
  const form = root?.querySelector('[data-chat-form]');
  const input = root?.querySelector('[data-chat-input]');
  const send = root?.querySelector('[data-chat-send]');
  const messages = root?.querySelector('[data-chat-messages]');
  const status = root?.querySelector('[data-chat-status]');
  if (!root || !dialog || !form || !input || !send || !messages || !status) return;

  const launchers = [...document.querySelectorAll('[data-chat-open]')];
  const closeButton = dialog.querySelector('[data-chat-close]');
  const resetButton = dialog.querySelector('[data-chat-reset]');
  const suggestions = dialog.querySelector('[data-chat-suggestions]');
  const introHtml = messages.innerHTML;
  const background = [
    document.querySelector('[data-site-header]'),
    document.querySelector('main'),
    document.querySelector('[data-site-footer]'),
  ].filter(Boolean);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;
  let lastFailed = '';
  let lastTrigger = null;
  let closeTimer = null;

  const isOpen = () => dialog.open;

  const setStatus = (text = '', { error = false, retry = false } = {}) => {
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(text) && error);
    if (!retry) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-suggestion';
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
    writeStored({ open: isOpen(), messages: history });
  };

  const setBackgroundInert = (value) => {
    background.forEach((region) => { region.inert = value; });
    document.body.classList.toggle('chat-dialog-open', value);
  };

  const syncLaunchers = () => {
    launchers.forEach((launcher) => launcher.setAttribute('aria-expanded', String(isOpen())));
  };

  const scrollToLatest = () => { messages.scrollTop = messages.scrollHeight; };

  const openDialog = (trigger, { focus = true } = {}) => {
    if (isOpen()) return;
    if (trigger) lastTrigger = trigger.closest('[data-mobile-disclosure]')?.querySelector('summary') || trigger;
    dialog.removeAttribute('data-closing');
    dialog.showModal();
    setBackgroundInert(true);
    syncLaunchers();
    scrollToLatest();
    persist();
    if (focus) input.focus();
  };

  const finishClose = ({ returnFocus = true } = {}) => {
    clearTimeout(closeTimer);
    dialog.removeAttribute('data-closing');
    if (isOpen()) dialog.close();
    setBackgroundInert(false);
    syncLaunchers();
    persist();
    if (returnFocus && lastTrigger?.isConnected) lastTrigger.focus();
  };

  const closeDialog = ({ returnFocus = true } = {}) => {
    if (!isOpen()) return;
    if (reducedMotion.matches) {
      finishClose({ returnFocus });
      return;
    }
    dialog.setAttribute('data-closing', 'true');
    closeTimer = setTimeout(() => finishClose({ returnFocus }), 150);
  };

  const hideSuggestions = () => { if (suggestions) suggestions.hidden = true; };
  const showSuggestions = () => { if (suggestions) suggestions.hidden = false; };
  const syncResetButton = () => { if (resetButton) resetButton.disabled = pending || !history.length; };

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
    stored.messages.forEach((message) => {
      if (!message || !['user', 'assistant'].includes(message.role)) return;
      if (typeof message.content !== 'string' || !message.content) return;
      history.push({ role: message.role, content: message.content });
      appendBubble(messages, message.role, message.content);
    });
    if (!history.length) return;
    hideSuggestions();
    syncResetButton();
    if (stored.open) openDialog(null, { focus: false });
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
      if (!response.ok || !data.reply) throw new Error(data.error || 'service');
      thinking.remove();
      appendBubble(messages, 'assistant', data.reply);
      history.push({ role: 'assistant', content: data.reply });
      if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
      lastFailed = '';
      setStatus('');
    } catch (error) {
      thinking.remove();
      const message = error.name === 'AbortError'
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

  launchers.forEach((launcher) => launcher.addEventListener('click', () => openDialog(launcher)));
  closeButton?.addEventListener('click', () => closeDialog());
  resetButton?.addEventListener('click', resetConversation);

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], textarea:not(:disabled), input:not(:disabled), select:not(:disabled)')]
      .filter((element) => element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    setBackgroundInert(false);
    syncLaunchers();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  suggestions?.querySelectorAll('[data-chat-suggestion]').forEach((suggestion) => {
    suggestion.addEventListener('click', () => {
      if (pending) return;
      sendMessage(suggestion.getAttribute('data-chat-suggestion') || suggestion.textContent.trim());
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value.trim());
  });

  addEventListener('pageshow', () => { if (!isOpen()) setBackgroundInert(false); });
  syncLaunchers();
  syncResetButton();
  restore();
}
