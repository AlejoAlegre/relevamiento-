(() => {
  const toggle = document.getElementById('chatToggle');
  const window_ = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatClose');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const messages = document.getElementById('chatMessages');
  const notification = document.getElementById('chatNotification');
  const iconOpen = toggle.querySelector('.toggle-icon.open');
  const iconClose = toggle.querySelector('.toggle-icon.close');

  let isOpen = false;
  let isSending = false;
  let conversationHistory = [];

  // --- Toggle chat window ---
  function openChat() {
    isOpen = true;
    window_.classList.add('open');
    iconOpen.style.display = 'none';
    iconClose.style.display = 'block';
    notification.style.display = 'none';
    input.focus();
  }

  function closeChat() {
    isOpen = false;
    window_.classList.remove('open');
    iconOpen.style.display = 'block';
    iconClose.style.display = 'none';
  }

  toggle.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // --- Time helper ---
  function getTime() {
    return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  // --- Append message ---
  function appendMessage(text, role) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message', role === 'user' ? 'user-message' : 'bot-message');

    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.textContent = text;

    const time = document.createElement('span');
    time.classList.add('message-time');
    time.textContent = getTime();

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    messages.appendChild(wrapper);
    scrollToBottom();
    return wrapper;
  }

  // --- Typing indicator ---
  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message', 'bot-message', 'typing-indicator');
    wrapper.id = 'typingIndicator';

    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    scrollToBottom();
  }

  function removeTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  // --- Send message ---
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    sendBtn.disabled = true;
    input.value = '';

    appendMessage(text, 'user');
    conversationHistory.push({ role: 'user', content: text });

    showTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      removeTyping();

      // Create bot message bubble for streaming
      const wrapper = document.createElement('div');
      wrapper.classList.add('message', 'bot-message');
      const bubble = document.createElement('div');
      bubble.classList.add('message-bubble');
      bubble.textContent = '';
      const time = document.createElement('span');
      time.classList.add('message-time');
      time.textContent = getTime();
      wrapper.appendChild(bubble);
      wrapper.appendChild(time);
      messages.appendChild(wrapper);

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                bubble.textContent = fullText;
                scrollToBottom();
              }
            } catch { /* ignore malformed */ }
          }
        }
      }

      conversationHistory.push({ role: 'assistant', content: fullText });

    } catch (error) {
      removeTyping();
      appendMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', 'bot');
      console.error('Chat error:', error);
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // --- Event listeners ---
  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Prevent closing when clicking inside window
  window_.addEventListener('click', (e) => e.stopPropagation());
})();
