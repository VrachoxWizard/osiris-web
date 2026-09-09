const history = [];

function escapeText(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function appendBubble(container, role, text, { pending = false } = {}) {
  const bubble = document.createElement('div');
  bubble.className = `osiris-chat__bubble osiris-chat__bubble--${role}${pending ? ' is-pending' : ''}`;
  if (pending) {
    bubble.innerHTML = '<span class="osiris-chat__typing" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">OSIRIS odgovara</span>';
  } else {
    bubble.innerHTML = escapeText(text).replace(/\n/g, '<br>');
  }
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

export function setupChatWidget() {
  const root = document.querySelector('[data-osiris-chat]');
  if (!root) return;

  const launcher = root.querySelector('[data-chat-launcher]');
  const panel = root.querySelector('[data-chat-panel]');
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
  let open = false;
  let pending = false;

  const setStatus = (text = '', isError = false) => {
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(text) && isError);
  };

  const setOpen = (next) => {
    open = next;
    panel.hidden = !open;
    root.classList.toggle('is-open', open);
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      input.focus();
    } else {
      launcher.focus();
    }
  };

  const hideSuggestions = () => {
    if (suggestions) suggestions.hidden = true;
  };

  const showSuggestions = () => {
    if (suggestions) suggestions.hidden = false;
  };

  const resetConversation = () => {
    if (pending) return;
    history.length = 0;
    messages.innerHTML = introHtml;
    messages.scrollTop = 0;
    showSuggestions();
    setStatus('');
    input.value = '';
    input.focus();
  };

  const sendMessage = async (text) => {
    if (pending || !text) return;

    appendBubble(messages, 'user', text);
    history.push({ role: 'user', content: text });
    hideSuggestions();
    input.value = '';
    pending = true;
    send.disabled = true;
    input.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
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
      if (history.length > 12) history.splice(0, history.length - 12);
      setStatus('');
    } catch (error) {
      thinking.remove();
      const message =
        error.name === 'AbortError'
          ? 'Odgovor traje predugo. Pokušajte ponovno.'
          : typeof error.message === 'string' && error.message !== 'service'
            ? error.message
            : 'Trenutačno ne možemo odgovoriti. Pokušajte ponovno ili zatražite besplatnu analizu.';
      setStatus(message, true);
    } finally {
      clearTimeout(timeout);
      pending = false;
      send.disabled = false;
      input.disabled = false;
      if (resetBtn) resetBtn.disabled = false;
      form.removeAttribute('aria-busy');
      input.focus();
    }
  };

  launcher.addEventListener('click', () => setOpen(!open));
  closeBtn?.addEventListener('click', () => setOpen(false));
  resetBtn?.addEventListener('click', resetConversation);

  document.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  });

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
}
