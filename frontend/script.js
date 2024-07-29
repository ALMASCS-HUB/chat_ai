document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messageContainer = document.getElementById('message-container');
  const clearHistoryBtn = document.getElementById('clear-history-btn'); // New button

  // Event listener for form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageText = input.value.trim();
    if (messageText === '') return;

    addMessageToChat(messageText, 'sent');

    // Clear input after sending message
    input.value = '';

    try {
      // Show loading indicator
      addMessageToChat('...', 'received');

      const reply = await sendMessageToServer(messageText);
      addMessageToChat(reply, 'received');
    } catch (error) {
      console.error('Error sending message:', error);
      addMessageToChat('Error: Failed to get a response from the server', 'received');
    }
  });

  // Event listener for clear history button
  clearHistoryBtn.addEventListener('click', () => {
    // Clear messages from the UI
    messageContainer.innerHTML = '';
    // Clear messages from localStorage
    localStorage.removeItem('chatHistory');
  });

  function addMessageToChat(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', type === 'sent' ? 'sent-message' : 'received-message');
    messageElement.innerText = message;
    messageContainer.appendChild(messageElement);
    scrollToBottom();

    // Save messages to localStorage
    saveChatHistory();
  }

  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function saveChatHistory() {
    const messages = Array.from(messageContainer.children).map(child => ({
      text: child.innerText,
      type: child.classList.contains('sent-message') ? 'sent' : 'received'
    }));
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }

  function loadChatHistory() {
    const chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
      JSON.parse(chatHistory).forEach(message => addMessageToChat(message.text, message.type));
    }
  }

  async function sendMessageToServer(message) {
    try {
      const response = await fetch('/api/send-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: message })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      throw error;
    }
  }

  // Load chat history from localStorage when the page loads
  loadChatHistory();
});
