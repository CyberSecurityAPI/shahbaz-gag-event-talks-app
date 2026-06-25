document.addEventListener('DOMContentLoaded', () => {
    // Chat Widget Elements
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    // Toggle Chat Window
    if (chatBubble && chatWindow) {
        chatBubble.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            chatInput.focus();
        });
    }

    if (chatClose && chatWindow) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    // Scroll chat window to bottom
    const scrollToBottom = () => {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    };

    // Append Message to UI
    const appendMessage = (text, isUser = false) => {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'message-user' : 'message-agent'}`;
        
        // Use strong or format helper for basic markdown-like replies
        messageDiv.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    };

    // Send message handler
    const sendMessage = async () => {
        if (!chatInput) return;
        const message = chatInput.value.trim();
        if (!message) return;

        // Display user message in UI
        appendMessage(message, true);
        chatInput.value = '';

        // Temporary Loading bubble
        appendMessage('Analyzing message...', false);
        const lastMsgNode = chatMessages.lastChild;

        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            // Remove loading indicator
            if (chatMessages.contains(lastMsgNode)) {
                chatMessages.removeChild(lastMsgNode);
            }

            if (data.status === 'success') {
                appendMessage(data.reply, false);
            } else {
                appendMessage("Sorry, I encountered an issue processing that. Please try again.", false);
            }
        } catch (error) {
            // Remove loading indicator
            if (chatMessages.contains(lastMsgNode)) {
                chatMessages.removeChild(lastMsgNode);
            }
            console.error('Error fetching chat response:', error);
            appendMessage("Unable to reach the AI agent. Please check your network connection.", false);
        }
    };

    // Event listeners for sending message
    if (chatSend && chatInput) {
        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
