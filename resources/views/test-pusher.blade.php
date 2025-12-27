{{-- this is a blade template for testing the agent chat functionality with Pusher integration. 
It includes sections for authentication, connection setup, message sending, 
typing indicators, and an event log. --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Chat Tester</title>
    <script src="https://js.pusher.com/7.4/pusher.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            background-color: #f5f7fa;
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .test-section {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        h1, h2 {
            margin-top: 0;
            color: #2d3748;
        }
        .input-group {
            display: flex;
            margin-bottom: 10px;
        }
        .input-group input, .input-group select, .input-group textarea {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .input-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        .input-group button {
            padding: 10px 15px;
            background-color: #3B82F6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 5px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .input-group button:hover {
            background-color: #2563eb;
        }
        .input-group button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
        }
        .status {
            margin-top: 10px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 4px;
            font-size: 14px;
        }
        .status.connected {
            background-color: #dcfce7;
            color: #166534;
        }
        .status.error {
            background-color: #fee2e2;
            color: #b91c1c;
        }
        .event-log {
            height: 200px;
            overflow-y: auto;
            background-color: #1e293b;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            color: #e2e8f0;
            font-size: 13px;
        }
        .messages-container {
            max-height: 350px;
            overflow-y: auto;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .messages-wrapper {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .message {
            padding: 12px 16px;
            border-radius: 18px;
            max-width: 80%;
            position: relative;
            line-height: 1.4;
            font-size: 14px;
        }
        .message-visitor {
            background-color: #e5e7eb;
            color: #1f2937;
            align-self: flex-start;
            border-top-left-radius: 4px;
        }
        .message-agent {
            background-color: #3B82F6;
            color: white;
            align-self: flex-end;
            border-top-right-radius: 4px;
            margin-left: auto;
        }
        .message-time {
            font-size: 11px;
            margin-top: 4px;
            opacity: 0.7;
            text-align: right;
        }
        .message-pending {
            opacity: 0.7;
        }
        .message-pending::after {
            content: '';
            position: absolute;
            right: 10px;
            bottom: 10px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: rgba(255,255,255,0.5);
        }
        .typing-indicator {
            display: inline-flex;
            align-items: center;
            background-color: #e5e7eb;
            color: #4b5563;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 13px;
            align-self: flex-start;
            margin-top: 5px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .typing-indicator.visible {
            opacity: 1;
        }
        .typing-dots {
            display: inline-flex;
            margin-left: 6px;
        }
        .typing-dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #4b5563;
            margin: 0 1px;
            animation: typing-dot 1.4s infinite;
            animation-fill-mode: both;
        }
        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        @keyframes typing-dot {
            0% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
            100% { transform: translateY(0); }
        }
        .auth-section {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .auth-token {
            width: 100%;
            padding: 10px;
            border: 1px dashed #cbd5e1;
            background-color: #f8fafc;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease infinite;
            margin-left: 6px;
            vertical-align: middle;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Agent Chat Tester</h1>
        
        <div class="test-section">
            <h2>Authentication</h2>
            <div class="auth-section">
                <div class="auth-token" id="auth-token">eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWI4Y2Y0MTA0MmQwMzE1M2FiY2Q3YWVkMjkyOGEwY2E1YTYyNWE1MTEzMmZjYTA4OWMzZGZmZDQyOWFmN2Y3NzFmYzg5N2UyMmFkZDBiZjciLCJpYXQiOjE3NjMyMjQ0MjcuNDMyMTU0ODkzODc1MTIyMDcwMzEyNSwibmJmIjoxNzYzMjI0NDI3LjQzMjE2MTA5Mjc1ODE3ODcxMDkzNzUsImV4cCI6MTc5NDc2MDQyNy40MTgyNzcwMjUyMjI3NzgzMjAzMTI1LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.XUALg7C-3e_PLi1_PLcJsev90xGIlSco9ykDffaAUH0nbItewXLTMzPmLeCpQ4tNyP9XqbC9uE3j1L4GiD-2RxnTjEDMqKctdeO1ZCLpmuVqCzwwnwU7x-PfGGMni7pVSYq37e39lRMG0Yh84IgpP4AEus5AJ_KbcfYt5tdc5cuqqdzTwWZq9r2AJupJXbeHtdVobLTcZxvwxbxuWinAJqST-yTyirMxBAm2EyIq_tPS0mshsQy1zZdFWG_pvmMOdDsBLr1SnmLkgEnrB2uSzo8RnY7zpZEYZMdaJJQA1HukfAmRZT4PBDtMKzUPxL1EueY5aJFUUrBhGyJ-F3RVoa1gbaUnrL0kwyvF5IApOhUD7bv8_slysmQVdLp_BDd0FNP94GWIw0ay7TrRPJIYXzIUx6nRlIpG-SyEWz5nvSFxQ19qMvbEBbAnKK6FqwnXsxp1GI849w5A-MTewPUjwanuc99eIUJVWic4T8Lakz_Ic8YU2-uk0KoNBUKL0A_FPLmB0_d_75_OUP2G9bJgsOyFEWajr1fKQxQhDALprwh4Zo_UeMS8uLVqWL9IWpeV7aicwNE3FHleyX8o2MbPPivTQYkJHYXkuPjcpG7PrxV1oEBj0Wt-CzmzsFUQ55Yx4AvboCMyOc6NxcLlpcW6hSyNIjS2QmtYbvKtGB9G5ac</div>
            </div>
        </div>
        
        <div class="test-section">
            <h2>Connection Setup</h2>
            <div class="input-group">
                <input type="text" id="widget-key" placeholder="Widget Key" value="099fd06c74a3820e94b5fc882ea7c370">
                <input type="text" id="conversation-id" placeholder="Conversation ID">
                <button id="connect-btn">Connect</button>
            </div>
            <div class="status" id="connection-status">Not connected</div>
        </div>

        <div class="test-section">
            <h2>Messages</h2>
            <div class="messages-container">
                <div class="messages-wrapper" id="messages-wrapper">
                    <!-- Messages will be displayed here -->
                </div>
                <div class="typing-indicator" id="visitor-typing">
                    Visitor is typing
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
            <div class="input-group" style="margin-top: 10px;">
                <textarea id="message-input" placeholder="Type a message as the agent..." disabled></textarea>
                <button id="send-message-btn" disabled>Send</button>
            </div>
        </div>

        <div class="test-section">
            <h2>Agent Typing Indicator</h2>
            <div class="input-group">
                <button id="typing-start-btn" disabled>Start Typing</button>
                <button id="typing-stop-btn" disabled>Stop Typing</button>
            </div>
        </div>

        <div class="test-section">
            <h2>Event Log</h2>
            <div class="event-log" id="event-log"></div>
        </div>
    </div>

    <script>
        // Enable Pusher logging for debugging
        Pusher.logToConsole = true;
        
        // Elements
        const authTokenEl = document.getElementById('auth-token');
        const widgetKeyInput = document.getElementById('widget-key');
        const conversationIdInput = document.getElementById('conversation-id');
        const connectBtn = document.getElementById('connect-btn');
        const connectionStatus = document.getElementById('connection-status');
        const messageInput = document.getElementById('message-input');
        const sendMessageBtn = document.getElementById('send-message-btn');
        const messagesWrapper = document.getElementById('messages-wrapper');
        const eventLog = document.getElementById('event-log');
        const visitorTypingIndicator = document.getElementById('visitor-typing');
        const typingStartBtn = document.getElementById('typing-start-btn');
        const typingStopBtn = document.getElementById('typing-stop-btn');
        
        // Variables
        let pusher = null;
        let channel = null;
        let apiUrl = 'https://adminer.palestinesrelief.org';
        let authToken = authTokenEl.textContent.trim();
        
        // Functions
        function logEvent(message) {
            const timestamp = new Date().toLocaleTimeString();
            eventLog.innerHTML = `<div>[${timestamp}] ${message}</div>` + eventLog.innerHTML;
            console.log(`[${timestamp}] ${message}`);
        }

        function connectToPusher() {
            const widgetKey = widgetKeyInput.value.trim();
            const conversationId = conversationIdInput.value.trim();
            
            if (!widgetKey || !conversationId) {
                logEvent('❌ ERROR: Widget key and conversation ID are required');
                connectionStatus.textContent = 'Missing widget key or conversation ID';
                connectionStatus.className = 'status error';
                return;
            }
            
            try {
                // Initialize Pusher
                pusher = new Pusher('38b5c6c6e09853ed572a', {
                    cluster: 'eu',
                    encrypted: true
                });
                
                logEvent('🔌 Pusher initialized');
                
                // Subscribe to the conversation channel
                const channelName = `conversation.${conversationId}`;
                logEvent(`Attempting to subscribe to channel: ${channelName}`);
                channel = pusher.subscribe(channelName);
                
                channel.bind('pusher:subscription_succeeded', () => {
                    logEvent(`✅ Successfully subscribed to channel: ${channelName}`);
                    connectionStatus.textContent = `Connected to channel: ${channelName}`;
                    connectionStatus.className = 'status connected';
                    
                    // Enable UI elements
                    messageInput.disabled = false;
                    sendMessageBtn.disabled = false;
                    typingStartBtn.disabled = false;
                    typingStopBtn.disabled = false;
                    
                    // Load existing messages
                    getExistingMessages();
                });
                
                // Add the global event binding here
channel.bind_global((eventName, data) => {
    logEvent(`📣 Received event: ${eventName} - ${JSON.stringify(data)}`);
});
                channel.bind('pusher:subscription_error', (error) => {
                    logEvent(`❌ Error subscribing to channel: ${channelName} - ${JSON.stringify(error)}`);
                    connectionStatus.textContent = `Failed to connect: ${error}`;
                    connectionStatus.className = 'status error';
                });
                
                // Listen for typing events
                channel.bind('typing', (data) => {
                    logEvent(`📝 Received typing event: ${JSON.stringify(data)}`);
                    
                    // Only show typing indicator for visitor messages
                    if (data.sender_type === 'visitor') {
                        if (data.is_typing) {
                            visitorTypingIndicator.classList.add('visible');
                        } else {
                            visitorTypingIndicator.classList.remove('visible');
                        }
                    }
                });
                
                // Listen for new messages with debug logging
                channel.bind('new-message', (data) => {
                    logEvent(`💬 Received new message event: ${JSON.stringify(data)}`);
                    
                    // Add message to UI
                    // Only add if it's from a visitor (we already added our own)
                    if (data.sender_type === 'visitor') {
                        logEvent(`Adding visitor message to UI: ${data.content}`);
                        addMessageToUI(data);
                        // Hide typing indicator when message is received
                        visitorTypingIndicator.classList.remove('visible');
                    }
                });

                // Listen for Laravel-formatted messages
channel.bind('App\\Events\\NewMessage', (data) => {
    logEvent(`💬 Received new message event via Laravel format: ${JSON.stringify(data)}`);
    
    // Extract the message from the nested structure
    if (data.message) {
        const message = data.message;
        
        // Only add visitor messages (we already added our own)
        if (message.sender_type === 'visitor') {
            logEvent(`Adding visitor message to UI: ${message.content}`);
            addMessageToUI(message);
            // Hide typing indicator when message is received
            visitorTypingIndicator.classList.remove('visible');
        }
    }
});
                
            } catch (error) {
                logEvent(`❌ Error initializing Pusher: ${error.message}`);
                connectionStatus.textContent = `Connection error: ${error.message}`;
                connectionStatus.className = 'status error';
            }
        }
        
        // Format timestamp to readable time
        function formatTime(timestamp) {
            const date = new Date(timestamp);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }
        
        // Add message to the UI
        function addMessageToUI(message, isPending = false) {
            // Create message element
            const messageEl = document.createElement('div');
            messageEl.className = `message message-${message.sender_type}`;
            if (isPending) {
                messageEl.className += ' message-pending';
            }
            
            if (message.id) {
                messageEl.id = `msg-${message.id}`;
            }
            
            // Set content based on message type
            let content = message.content || '';
            
            if (message.type === 'image' && message.file_url) {
                content = `<img src="${message.file_url}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:5px;">`;
            } else if (message.type === 'file' && message.file_url) {
                content = `<div style="display:flex;align-items:center;">
                    <span style="margin-right:6px;">📎</span>
                    <span>${message.file_name || 'Attachment'}</span>
                </div>`;
            }
            
            // Create time element
            const timeText = message.created_at ? formatTime(message.created_at) : formatTime(new Date());
            
            messageEl.innerHTML = `
                <div>${content}</div>
                <div class="message-time">
                    ${timeText}
                </div>
            `;
            
            // Add to container
            messagesWrapper.appendChild(messageEl);
            
            // Scroll to bottom
            messagesWrapper.parentElement.scrollTop = messagesWrapper.parentElement.scrollHeight;
        }
        
        // Send a message as an agent
        function sendAgentMessage() {
            const conversationId = conversationIdInput.value.trim();
            const messageContent = messageInput.value.trim();
            
            if (!conversationId || !messageContent) {
                logEvent('❌ Cannot send message: Missing conversation ID or message content');
                return;
            }
            
            // Show sending state
            sendMessageBtn.disabled = true;
            sendMessageBtn.innerHTML = 'Sending <span class="spinner"></span>';
            
            // Create temporary message ID and add to UI
            const tempId = 'temp-' + Date.now();
            const tempMessage = {
                id: tempId,
                content: messageContent,
                sender_type: 'agent',
                created_at: new Date().toISOString(),
            };
            
            // Add the message to UI immediately with pending status
            addMessageToUI(tempMessage, true);
            
            // Use the agent endpoint to send the message
            fetch(`${apiUrl}/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: messageContent
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                logEvent(`✅ Message sent successfully: ${JSON.stringify(data)}`);
                
                // Remove temp message
                const tempEl = document.getElementById(`msg-${tempId}`);
                if (tempEl) {
                    tempEl.remove();
                }
                
                // Add the confirmed message
                if (data.status === 'success' && data.data) {
                    addMessageToUI(data.data);
                }
                
                // Clear input
                messageInput.value = '';
            })
            .catch(error => {
                logEvent(`❌ Error sending message: ${error.message}`);
                
                // Mark message as failed
                const tempEl = document.getElementById(`msg-${tempId}`);
                if (tempEl) {
                    tempEl.style.backgroundColor = '#fee2e2';
                    tempEl.style.color = '#b91c1c';
                }
            })
            .finally(() => {
                // Reset button state
                sendMessageBtn.disabled = false;
                sendMessageBtn.textContent = 'Send';
            });
        }
        
        // Get existing messages for conversation
        function getExistingMessages() {
            const conversationId = conversationIdInput.value.trim();
            
            if (!conversationId) {
                return;
            }
            
            logEvent('🔍 Loading existing messages...');
            
            fetch(`${apiUrl}/api/conversations/${conversationId}/messages`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success' && data.messages) {
                    logEvent(`📥 Loaded ${data.messages.length} existing messages`);
                    
                    // Clear existing messages
                    messagesWrapper.innerHTML = '';
                    
                    // Add all messages
                    data.messages.forEach(message => {
                        addMessageToUI(message);
                    });
                }
            })
            .catch(error => {
                logEvent(`❌ Error loading messages: ${error.message}`);
            });
        }
        
        // Send agent typing indicator
        function sendAgentTypingStatus(isTyping) {
            const conversationId = conversationIdInput.value.trim();
            
            if (!conversationId) {
                return;
            }
            
            fetch(`${apiUrl}/api/typing`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    is_typing: isTyping
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                logEvent(`📝 Sent agent typing status (${isTyping ? 'started' : 'stopped'}): ${JSON.stringify(data)}`);
            })
            .catch(error => {
                logEvent(`❌ Error sending typing status: ${error.message}`);
            });
        }

        // Event Listeners
        connectBtn.addEventListener('click', connectToPusher);
        
        sendMessageBtn.addEventListener('click', sendAgentMessage);
        
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAgentMessage();
            }
        });
        
        // Auto typing events when typing in input
        let typingTimeout = null;
        messageInput.addEventListener('input', () => {
            // Clear previous timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Send typing started
            sendAgentTypingStatus(true);
            
            // Set timeout to send typing stopped after 2 seconds of inactivity
            typingTimeout = setTimeout(() => {
                sendAgentTypingStatus(false);
            }, 2000);
        });
        
        // Manual typing controls
        typingStartBtn.addEventListener('click', () => {
            sendAgentTypingStatus(true);
        });
        
        typingStopBtn.addEventListener('click', () => {
            sendAgentTypingStatus(false);
        });

        // Initialize
        logEvent('🚀 Agent Chat Tester loaded. Enter conversation ID and connect.');
    </script>
</body>
</html>

{{-- 👀 Typing event received: {conversation_id: '13', is_typing: true, user_id: 1, sender_type: 'agent'}conversation_id: "13"is_typing: truesender_type: "agent"user_id: 1[[Prototype]]: Object --}}
