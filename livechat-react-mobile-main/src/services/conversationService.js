import axios from 'axios';
import authService from './authService';

const API_URL = authService.getApiUrl();

const conversationService = {
  // Get all conversations with optional filters
  getConversations: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_URL}/conversations?${queryParams}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single conversation with messages
  getConversation: async (conversationId, options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.before_id) queryParams.append('before_id', options.before_id);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${API_URL}/conversations/${conversationId}?${queryString}`
        : `${API_URL}/conversations/${conversationId}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get messages for a conversation with pagination (agent side)
  getMessages: async (conversationId, options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.before_id) queryParams.append('before_id', options.before_id);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${API_URL}/conversations/${conversationId}/messages?${queryString}`
        : `${API_URL}/conversations/${conversationId}/messages`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send a message in a conversation
  sendMessage: async (conversationId, content, file = null) => {
    try {
      // If no file, use simple JSON post
      if (!file) {
        const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, { content });
        return response.data;
      }
      
      // If there's a file, use FormData
      const formData = new FormData();
      formData.append('content', content);
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Close a conversation
  closeConversation: async (conversationId, reason = '') => {
    try {
      const response = await axios.post(`${API_URL}/conversations/${conversationId}/close`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reopen a closed conversation
  reopenConversation: async (conversationId) => {
    try {
      const response = await axios.post(`${API_URL}/conversations/${conversationId}/reopen`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Archive a conversation
  archiveConversation: async (conversationId) => {
    try {
      const response = await axios.post(`${API_URL}/conversations/${conversationId}/archive`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get widget data
  getWidget: async () => {
    try {
      const response = await axios.get(`${API_URL}/widget`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default conversationService;