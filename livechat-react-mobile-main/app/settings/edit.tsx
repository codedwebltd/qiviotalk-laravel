import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import authService from '../../src/services/authService';

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 4L12 14.01L9 11.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ErrorCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M15 9L9 15M9 9L15 15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChatIconSvg = ({ iconId }: { iconId: string }) => {
  switch (iconId) {
    case 'comments':
      return (
        <Path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      );
    case 'headset':
      return (
        <Path d="M3 11C3 8.61305 3.94821 6.32387 5.63604 4.63604C7.32387 2.94821 9.61305 2 12 2C14.3869 2 16.6761 2.94821 18.364 4.63604C20.0518 6.32387 21 8.61305 21 11V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H18C17.4696 18 16.9609 17.7893 16.5858 17.4142C16.2107 17.0391 16 16.5304 16 16V13C16 12.4696 16.2107 11.9609 16.5858 11.5858C16.9609 11.2107 17.4696 11 18 11H21M3 11H6C6.53043 11 7.03914 11.2107 7.41421 11.5858C7.78929 11.9609 8 12.4696 8 13V16C8 16.5304 7.78929 17.0391 7.41421 17.4142C7.03914 17.7893 6.53043 18 6 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      );
    case 'comment-dots':
      return (
        <>
          <Path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M8 12H8.01M12 12H12.01M16 12H16.01" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      );
    case 'concierge-bell':
      return (
        <>
          <Path d="M2 17H22M6 17V10C6 8.4087 6.63214 6.88258 7.75736 5.75736C8.88258 4.63214 10.4087 4 12 4C13.5913 4 15.1174 4.63214 16.2426 5.75736C17.3679 6.88258 18 8.4087 18 10V17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M12 4V2M10 21H14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      );
    case 'user-circle':
      return (
        <>
          <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M12 15C14.0711 15 15.75 13.3211 15.75 11.25C15.75 9.17893 14.0711 7.5 12 7.5C9.92893 7.5 8.25 9.17893 8.25 11.25C8.25 13.3211 9.92893 15 12 15Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M5.98047 18.6906C6.54485 17.5785 7.40683 16.6505 8.46844 15.9993C9.53005 15.3481 10.7523 15 11.9996 15C13.2469 15 14.4692 15.3481 15.5308 15.9993C16.5924 16.6505 17.4544 17.5785 18.0188 18.6906" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      );
    default:
      return (
        <Path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      );
  }
};

export default function SettingsEditScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    Animated.sequence([
      Animated.spring(toastAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastVisible(false);
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch fresh data from API
      const profileData = await authService.getUserProfile();
      if (profileData && profileData.user) {
        const user = profileData.user;
        console.log('Fresh user data:', user);

        // Get widget data
        const widget = user.widget || {};
        const onboarding = user.onboarding || {};
        const userSettings = user.usersettings || {};

        setFormData({
          name: user.name || user.full_name || onboarding?.company_name || '',
          email: user.email || '',
          phone: user.phone || user.phone_number || userSettings.phone || '',
          company: user.company || onboarding?.company_name || userSettings.company || '',
          website: widget.website || onboarding.website || '',
          color: widget.color || onboarding.primary_color || '#128C7E',
          position: widget.position || onboarding.widget_position || 'right',
          icon: widget.icon || onboarding.chat_icon || 'comments',
          welcomeMessage: widget.welcome_message || onboarding.welcome_message || 'Hi there! How can I help you today?',
          pushEnabled: userSettings.push_enabled || false,
          emailEnabled: userSettings.email_enabled || false,
          soundEnabled: userSettings.sound_enabled !== undefined ? userSettings.sound_enabled : true,
        });
      }
    } catch (error) {
      console.error('Error loading fresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        setLoading(false);
        return;
      }

      // Prepare payload based on type
      let payload = { type };

      if (type === 'account') {
        payload = {
          ...payload,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
        };
      } else if (type === 'appearance') {
        payload = {
          ...payload,
          color: formData.color,
          position: formData.position,
          icon: formData.icon,
          welcome_message: formData.welcomeMessage,
        };
      } else if (type === 'notifications') {
        payload = {
          ...payload,
          push_enabled: formData.pushEnabled,
          email_enabled: formData.emailEnabled,
          sound_enabled: formData.soundEnabled,
        };
      }

      const API_URL = authService.getApiUrl();
      const response = await fetch(`${API_URL}/settings/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Update cached user data
        const cachedUser = await AsyncStorage.getItem('user');
        if (cachedUser) {
          const user = JSON.parse(cachedUser);

          if (type === 'account') {
            user.name = formData.name;
            user.email = formData.email;
            user.phone = formData.phone;
            user.company = formData.company;
          } else if (type === 'appearance') {
            if (!user.widget) user.widget = {};
            user.widget.color = formData.color;
            user.widget.position = formData.position;
            user.widget.icon = formData.icon;
            user.widget.welcome_message = formData.welcomeMessage;
          }

          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        showToast(data.message || 'Settings updated successfully', 'success');
      } else {
        showToast(data.message || 'Failed to update settings', 'error');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'account': return 'Account Settings';
      case 'appearance': return 'Appearance';
      case 'notifications': return 'Notifications';
      default: return 'Settings';
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'account':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(v) => setFormData({ ...formData, email: v })}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(v) => setFormData({ ...formData, phone: v })}
                placeholder="+1234567890"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </>
        );

      case 'appearance':
        const chatIcons = [
          { id: 'comments', name: 'Chat' },
          { id: 'headset', name: 'Support' },
          { id: 'comment-dots', name: 'Message' },
          { id: 'concierge-bell', name: 'Bell' },
          { id: 'user-circle', name: 'User' },
        ];
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Website URL</Text>
              <TextInput
                style={[styles.input, styles.inputReadonly]}
                value={formData.website || ''}
                placeholder="Not set"
                editable={false}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.hint}>Contact support to change your website URL</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Primary Color *</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorPreview, { backgroundColor: formData.color || '#128C7E' }]} />
                <TextInput
                  style={styles.colorInput}
                  value={formData.color || '#128C7E'}
                  onChangeText={(v) => setFormData({ ...formData, color: v })}
                  placeholder="#128C7E"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Widget Position</Text>
              <View style={styles.positionRow}>
                <TouchableOpacity
                  style={[styles.positionBtn, (formData.position || 'right') === 'right' && styles.positionBtnActive]}
                  onPress={() => setFormData({ ...formData, position: 'right' })}
                >
                  <View style={styles.positionPreview}>
                    <View style={[styles.positionBubble, { position: 'absolute', right: 8, bottom: 8 }]} />
                  </View>
                  <Text style={[styles.positionText, (formData.position || 'right') === 'right' && styles.positionTextActive]}>Bottom Right</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.positionBtn, formData.position === 'left' && styles.positionBtnActive]}
                  onPress={() => setFormData({ ...formData, position: 'left' })}
                >
                  <View style={styles.positionPreview}>
                    <View style={[styles.positionBubble, { position: 'absolute', left: 8, bottom: 8 }]} />
                  </View>
                  <Text style={[styles.positionText, formData.position === 'left' && styles.positionTextActive]}>Bottom Left</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Chat Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconScroll}>
                {chatIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon.id}
                    style={[styles.iconBtn, (formData.icon || 'comments') === icon.id && styles.iconBtnActive]}
                    onPress={() => setFormData({ ...formData, icon: icon.id })}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: formData.color || '#128C7E' }]}>
                      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <ChatIconSvg iconId={icon.id} />
                      </Svg>
                    </View>
                    <Text style={[styles.iconText, (formData.icon || 'comments') === icon.id && styles.iconTextActive]}>{icon.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Welcome Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.welcomeMessage || 'Hi there! How can I help you today?'}
                onChangeText={(v) => setFormData({ ...formData, welcomeMessage: v })}
                placeholder="Hi there! How can I help you today?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        );

      case 'notifications':
        return (
          <>
            <View style={styles.switchField}>
              <View style={styles.switchLeft}>
                <Text style={styles.switchLabel}>Push Notifications</Text>
                <Text style={styles.switchDesc}>Receive notifications for new messages</Text>
              </View>
              <Switch
                value={formData.pushEnabled || false}
                onValueChange={(v) => setFormData({ ...formData, pushEnabled: v })}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={formData.pushEnabled ? '#10B981' : '#F3F4F6'}
              />
            </View>
            <View style={styles.switchField}>
              <View style={styles.switchLeft}>
                <Text style={styles.switchLabel}>Email Notifications</Text>
                <Text style={styles.switchDesc}>Daily summaries via email</Text>
              </View>
              <Switch
                value={formData.emailEnabled || false}
                onValueChange={(v) => setFormData({ ...formData, emailEnabled: v })}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={formData.emailEnabled ? '#10B981' : '#F3F4F6'}
              />
            </View>
            <View style={styles.switchField}>
              <View style={styles.switchLeft}>
                <Text style={styles.switchLabel}>Sound</Text>
                <Text style={styles.switchDesc}>Play sound for notifications</Text>
              </View>
              <Switch
                value={formData.soundEnabled || false}
                onValueChange={(v) => setFormData({ ...formData, soundEnabled: v })}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={formData.soundEnabled ? '#10B981' : '#F3F4F6'}
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderFields()}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
                {
                  scale: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.toastContent, { backgroundColor: toastType === 'success' ? '#10B981' : '#EF4444' }]}>
            <View style={styles.toastIcon}>
              {toastType === 'success' ? <CheckCircleIcon /> : <ErrorCircleIcon />}
            </View>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  inputReadonly: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  textArea: {
    minHeight: 90,
    maxHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  colorInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  positionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  positionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  positionBtnActive: {
    borderColor: '#128C7E',
    backgroundColor: '#E8F5F3',
  },
  positionPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    position: 'relative',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  positionBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#128C7E',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  positionTextActive: {
    color: '#128C7E',
  },
  iconScroll: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  iconBtn: {
    width: 100,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  iconBtnActive: {
    borderColor: '#128C7E',
    backgroundColor: '#E8F5F3',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  iconTextActive: {
    color: '#128C7E',
  },
  switchField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  switchLeft: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  saveBtn: {
    backgroundColor: '#128C7E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    gap: 12,
  },
  toastIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    lineHeight: 20,
  },
});
