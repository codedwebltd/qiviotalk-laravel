import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import authService from './authService';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.initialized = false;
    this.fcmToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Initialize notification service - call this on app launch
   * @param {string|null} authToken - Authentication token for API calls
   * @returns {Promise<string|null>} FCM token or null
   */
  async initialize(authToken = null) {
    if (this.initialized) {
      console.log('✅ Notifications already initialized');
      return this.fcmToken;
    }

    try {
      console.log('🔔 Initializing notification service...');

      // Request permissions first
      const permission = await this.requestPermissions();
      if (!permission) {
        console.log('❌ Notification permissions denied');
        return null;
      }

      // Get FCM token
      this.fcmToken = await this.getFCMToken();
      console.log('📱 FCM Token:', this.fcmToken ? `${this.fcmToken.substring(0, 20)}...` : 'NULL');

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await this.configureAndroidChannels();
      }

      // Register token with backend if auth token provided
      if (this.fcmToken && authToken) {
        await this.registerTokenWithBackend(this.fcmToken, authToken);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.initialized = true;
      console.log('✅ Notification service initialized');

      return this.fcmToken;
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      return null;
    }
  }

  /**
   * Request notification permissions from user
   * @returns {Promise<boolean>} Permission granted
   */
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        console.log('⚠️ Notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('📱 Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted');
        return false;
      }

      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM token from Expo
   * @returns {Promise<string|null>} FCM token
   */
  async getFCMToken() {
    try {
      console.log('🔍 Getting FCM token...');
      console.log('🔍 Device.isDevice:', Device.isDevice);

      if (!Device.isDevice) {
        console.log('⚠️ Cannot get FCM token on simulator');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log('🔍 Project ID:', projectId);

      if (!projectId) {
        console.error('❌ No Expo project ID found');
        console.log('📋 Full config:', JSON.stringify(Constants.expoConfig?.extra, null, 2));
        return null;
      }

      console.log('📱 Getting Expo Push Token...');
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      console.log('✅ Expo Push Token:', tokenData.data);

      console.log('📱 Getting Device Push Token...');
      // For native FCM, we use getDevicePushTokenAsync
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      console.log('✅ Device Push Token:', deviceToken.data);
      console.log('✅ Device Push Token Type:', typeof deviceToken.data);
      console.log('✅ Device Push Token Length:', deviceToken.data?.length);

      // Return the device token (native FCM token)
      return deviceToken.data;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      console.error('❌ Error stack:', error.stack);
      return null;
    }
  }

  /**
   * Configure Android notification channels
   */
  async configureAndroidChannels() {
    try {
      // Messages channel
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#25D366',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      // New conversation channel
      await Notifications.setNotificationChannelAsync('conversations', {
        name: 'New Conversations',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#25D366',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      console.log('✅ Android notification channels configured');
    } catch (error) {
      console.error('❌ Error configuring Android channels:', error);
    }
  }

  /**
   * Register FCM token with backend
   * @param {string} token - FCM token
   * @param {string} authToken - Authentication token
   * @returns {Promise<boolean>} Success status
   */
  async registerTokenWithBackend(token, authToken) {
    try {
      const API_URL = authService.getApiUrl();
      console.log('📤 Registering FCM token with backend...');
      console.log('🔑 FCM Token to send:', token);
      console.log('🔑 Auth Token:', authToken ? `${authToken.substring(0, 20)}...` : 'NULL');
      console.log('🌐 API URL:', `${API_URL}/fcm-token`);

      const requestBody = {
        fcm_token: token,
        platform: Platform.OS, // 'android' or 'ios'
        device_name: `${Platform.OS} device`,
      };
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_URL}/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ FCM token registered with backend:', JSON.stringify(data, null, 2));
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to register FCM token:');
        console.error('   Status:', response.status);
        console.error('   Response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error registering FCM token:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      return false;
    }
  }

  /**
   * Set up listeners for incoming notifications and user interactions
   */
  setupNotificationListeners() {
    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received (foreground):', notification);

      const { data } = notification.request.content;

      // Play haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // You can add custom handling here based on notification data
      if (data?.type === 'new_conversation') {
        console.log('🆕 New conversation notification:', data.conversation_id);
      } else if (data?.type === 'new_message') {
        console.log('💬 New message notification:', data.conversation_id);
      }
    });

    // Listener for when user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);

      const { data } = response.notification.request.content;

      // Handle deep linking based on notification data
      this.handleNotificationTap(data);
    });

    console.log('✅ Notification listeners set up');
  }

  /**
   * Handle notification tap - navigate to appropriate screen
   * @param {object} data - Notification data payload
   */
  handleNotificationTap(data) {
    try {
      console.log('🔗 Handling notification tap:', data);

      if (data?.conversation_id) {
        // Import router dynamically to avoid circular dependency
        import('expo-router').then(({ router }) => {
          router.push(`/chat/${data.conversation_id}`);
        });
      }
    } catch (error) {
      console.error('❌ Error handling notification tap:', error);
    }
  }

  /**
   * Show a local notification (for testing or in-app notifications)
   * @param {string} title
   * @param {string} body
   * @param {object} data - Additional data
   */
  async showNotification(title, body, data = {}) {
    try {
      await this.initialize();

      // Play haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Determine channel based on data type
      const channelId = data.type === 'new_conversation' ? 'conversations' : 'messages';

      // Show notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: channelId,
        },
        trigger: null, // Show immediately
      });

      console.log('✅ Local notification shown:', title);
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
      // Fallback to haptic only
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  /**
   * Update FCM token with backend (call after user logs in)
   * @param {string} authToken - Authentication token
   * @returns {Promise<boolean>} Success status
   */
  async updateToken(authToken) {
    if (!this.fcmToken) {
      console.log('⚠️ No FCM token available, reinitializing...');
      await this.initialize(authToken);
      return !!this.fcmToken;
    }

    return await this.registerTokenWithBackend(this.fcmToken, authToken);
  }

  /**
   * Clean up notification listeners
   */
  cleanup() {
    try {
      if (this.notificationListener) {
        this.notificationListener.remove();
      }
      if (this.responseListener) {
        this.responseListener.remove();
      }
      this.initialized = false;
      console.log('🧹 Notification service cleaned up');
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  /**
   * Get current FCM token
   * @returns {string|null}
   */
  getToken() {
    return this.fcmToken;
  }
}

export default new NotificationService();
