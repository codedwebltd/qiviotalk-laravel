import Pusher from 'pusher-js/react-native';
import authService from './authService';

const PUSHER_KEY = '38b5c6c6e09853ed572a';
const PUSHER_CLUSTER = 'eu';

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = {};
    this.channelCallbacks = {}; // Store multiple callbacks per channel
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    this.pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    this.initialized = true;

    this.pusher.connection.bind('connected', () => {
      // Connected
    });

    this.pusher.connection.bind('error', (error) => {
      // Error
    });
  }

  subscribeToConversation(conversationId, callbacks) {
    if (!this.initialized) this.initialize();

    const channelName = `conversation.${conversationId}`;
    const callbackId = Math.random().toString(36).substring(7);

    // Initialize callback storage for this channel
    if (!this.channelCallbacks[channelName]) {
      this.channelCallbacks[channelName] = {};
    }

    // Store callbacks with unique ID
    this.channelCallbacks[channelName][callbackId] = callbacks;
    console.log(`📝 PUSHER: Stored callbacks for ${channelName} (ID: ${callbackId})`);

    // Subscribe to channel if not already subscribed
    if (!this.channels[channelName]) {
      const channel = this.pusher.subscribe(channelName);
      this.channels[channelName] = channel;

      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ PUSHER: Successfully subscribed to ${channelName}`);
      });

      channel.bind('new-message', (data) => {
        console.log(`💬 PUSHER: Received 'new-message' on ${channelName}:`, data);
        // Call ALL registered callbacks
        Object.values(this.channelCallbacks[channelName] || {}).forEach(cb => {
          if (cb.onNewMessage) cb.onNewMessage(data);
        });
      });

      channel.bind('App\\Events\\NewMessage', (data) => {
        console.log(`💬 PUSHER: Received 'App\\Events\\NewMessage' on ${channelName}:`, data);
        // Call ALL registered callbacks
        Object.values(this.channelCallbacks[channelName] || {}).forEach(cb => {
          if (cb.onNewMessage && data.message) cb.onNewMessage(data.message);
        });
      });

      channel.bind('typing', (data) => {
        console.log(`⌨️ PUSHER: Received 'typing' on ${channelName}:`, data);
        // Call ALL registered callbacks
        Object.values(this.channelCallbacks[channelName] || {}).forEach(cb => {
          if (cb.onTyping && data.sender_type === 'visitor') cb.onTyping(data);
        });
      });
    } else {
      console.log(`✅ PUSHER: Already subscribed to ${channelName}, added callbacks (ID: ${callbackId})`);
    }

    return callbackId; // Return ID for cleanup
  }

  // ✅ Subscribe to WIDGET channel for new conversations (matches Laravel backend)
  subscribeToWidgetChannel(callbacks) {
    if (!this.initialized) this.initialize();

    const channelName = 'widget';

    if (!this.channels[channelName]) {
      const channel = this.pusher.subscribe(channelName);
      this.channels[channelName] = channel;

      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ PUSHER: Subscribed to WIDGET channel for new conversations');
        console.log('📡 PUSHER: Listening for event: new-conversation');
      });

      // Log ALL events on this channel to debug
      channel.bind_global((eventName, data) => {
        console.log(`🔔 PUSHER WIDGET: Received event '${eventName}':`, data);
      });

      channel.bind('new-conversation', (data) => {
        console.log('🆕 PUSHER WIDGET: Received new-conversation:', data);
        if (callbacks.onNewConversation) {
          // Refresh to get the full conversation data
          callbacks.onNewConversation(data);
        } else {
          console.warn('⚠️ PUSHER WIDGET: onNewConversation callback not defined!');
        }
      });

      channel.bind('conversation-updated', (data) => {
        console.log('🔄 PUSHER GLOBAL: Received conversation-updated:', data);
        if (callbacks.onConversationUpdated) {
          callbacks.onConversationUpdated(data);
        }
      });

      channel.bind('new-message', (data) => {
        console.log('💬 PUSHER GLOBAL: Received new-message:', data);
        if (callbacks.onConversationUpdated) {
          callbacks.onConversationUpdated(data);
        }
      });

      channel.bind('App\\Events\\NewMessage', (data) => {
        console.log('💬 PUSHER GLOBAL: Received App\\Events\\NewMessage:', data);
        if (callbacks.onConversationUpdated) {
          callbacks.onConversationUpdated(data);
        }
      });
    } else {
      // Channel exists, update callbacks
      const channel = this.channels[channelName];

      channel.unbind('new-conversation');
      channel.unbind('App\\Events\\NewConversation');
      channel.unbind('NewConversation');
      channel.unbind('conversation-updated');
      channel.unbind('new-message');
      channel.unbind('App\\Events\\NewMessage');

      channel.bind('new-conversation', (data) => {
        if (callbacks.onNewConversation) {
          callbacks.onNewConversation(data);
        }
      });

      channel.bind('App\\Events\\NewConversation', (data) => {
        if (callbacks.onNewConversation) {
          callbacks.onNewConversation(data.conversation || data);
        }
      });

      channel.bind('NewConversation', (data) => {
        if (callbacks.onNewConversation) {
          callbacks.onNewConversation(data.conversation || data);
        }
      });

      channel.bind('conversation-updated', (data) => {
        if (callbacks.onConversationUpdated) {
          callbacks.onConversationUpdated(data);
        }
      });

      channel.bind('new-message', (data) => {
        if (callbacks.onConversationUpdated) {
          callbacks.onConversationUpdated(data);
        }
      });

      channel.bind('App\\Events\\NewMessage', (data) => {
        if (callbacks.onConversationUpdated) {
          callbacks.onConversationUpdated(data);
        }
      });
    }
  }

  unsubscribeFromWidgetChannel() {
    const channelName = 'widget';
    if (this.channels[channelName]) {
      console.log('🔌 PUSHER: Unsubscribing from widget channel');
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
    }
  }

  subscribeToAgentChannel(agentId, callbacks) {
    if (!this.initialized) this.initialize();

    const channelName = `agent.${agentId}`;

    if (!this.channels[channelName]) {
      const channel = this.pusher.subscribe(channelName);
      this.channels[channelName] = channel;

      channel.bind('pusher:subscription_succeeded', () => {
        // Subscribed to agent channel
      });

      channel.bind('new-conversation', (data) => {
        if (callbacks.onNewConversation) {
          callbacks.onNewConversation(data);
        }
      });

      channel.bind('App\\Events\\NewConversation', (data) => {
        if (callbacks.onNewConversation) {
          callbacks.onNewConversation(data.conversation || data);
        }
      });

      channel.bind('NewConversation', (data) => {
        if (callbacks.onNewConversation) {
          callbacks.onNewConversation(data.conversation || data);
        }
      });

      channel.bind('conversation-assigned', (data) => {
        if (callbacks.onNewConversation) {
          callbacks.onNewConversation(data.conversation || data);
        }
      });
    }
  }

  unsubscribeFromAgentChannel(agentId) {
    const channelName = `agent.${agentId}`;
    if (this.channels[channelName]) {
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
    }
  }

  unsubscribeFromConversation(conversationId, callbackId = null) {
    const channelName = `conversation.${conversationId}`;

    if (callbackId && this.channelCallbacks[channelName]) {
      // Remove specific callback
      delete this.channelCallbacks[channelName][callbackId];
      console.log(`🔌 PUSHER: Removed callback ${callbackId} from ${channelName}`);

      // If no more callbacks, unsubscribe from channel
      if (Object.keys(this.channelCallbacks[channelName]).length === 0) {
        delete this.channelCallbacks[channelName];
        if (this.channels[channelName]) {
          this.pusher.unsubscribe(channelName);
          delete this.channels[channelName];
          console.log(`🔌 PUSHER: Fully unsubscribed from ${channelName}`);
        }
      }
    } else {
      // Remove all callbacks and unsubscribe
      delete this.channelCallbacks[channelName];
      if (this.channels[channelName]) {
        this.pusher.unsubscribe(channelName);
        delete this.channels[channelName];
        console.log(`🔌 PUSHER: Fully unsubscribed from ${channelName}`);
      }
    }
  }

  async sendTypingIndicator(conversationId, isTyping) {
    const API_URL = authService.getApiUrl();

    console.log(`⌨️ PUSHER: Sending typing indicator - conversation: ${conversationId}, isTyping: ${isTyping}`);

    try {
      // Import authService dynamically to avoid circular dependency
      const { default: authService } = await import('./authService');

      // ✅ AWAIT the token - getToken() is async!
      const token = await authService.getToken();

      console.log(`🔑 PUSHER: Got token: ${token ? token.substring(0, 20) + '...' : 'NULL'}`);

      const response = await fetch(`${API_URL}/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          is_typing: isTyping
        })
      });

      if (response.ok) {
        console.log(`✅ PUSHER: Typing indicator sent successfully`);
      } else {
        const errorText = await response.text();
        console.error(`❌ PUSHER: Typing indicator failed - status: ${response.status}, response: ${errorText}`);
      }
    } catch (err) {
      console.error('❌ PUSHER: Error sending typing indicator:', err);
    }
  }

  cleanup() {
    Object.keys(this.channels).forEach(channelName => {
      this.pusher.unsubscribe(channelName);
    });
    this.channels = {};
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.initialized = false;
    }
  }
}

export default new PusherService();
