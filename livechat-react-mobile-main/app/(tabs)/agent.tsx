import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import Svg, { Circle, Path } from 'react-native-svg';
import authService from '../../src/services/authService';

const CACHE_KEY = 'ai_agent_settings';

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SparkleIcon = ({ size = 24, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// Shimmer component
const ShimmerBox = ({ width = '100%', height = 20, style = {} }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#D1D5DB',
          borderRadius: 8,
          opacity,
        },
        style,
      ]}
    />
  );
};

export default function AgentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    auto_reply: false,
    personality: 'friendly',
    response_tone: 'professional',
    max_response_time: 5,
    fallback_to_human: true,
    language: 'en',
    knowledge_base_enabled: true,
    greeting_message: 'Hi! I\'m your AI assistant. How can I help you today?',
    offline_message: 'We\'re currently offline. Leave a message and we\'ll get back to you soon!',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // ✅ Refetch fresh data EVERY TIME user navigates to this screen
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Agent screen focused, loading fresh data...');
      loadSettings();
    }, [])
  );

  useEffect(() => {
    // Animation effects (only need to run once)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (showToast) {
      Animated.sequence([
        Animated.spring(toastAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToast(false));
    }
  }, [showToast]);

  const loadSettings = async () => {
    try {
      // Always fetch fresh data from profile endpoint (source of truth)
      const profileData = await authService.getUserProfile();

      // ✅ FIX: Backend returns { status, user: { ai_setting } }, not { ai_setting }
      if (profileData && profileData.user && profileData.user.ai_setting) {
        console.log('✅ AI Settings loaded from server:', profileData.user.ai_setting);
        setSettings(profileData.user.ai_setting);
        // Update cache with fresh data
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(profileData.user.ai_setting));
      } else {
        console.warn('⚠️ AI settings not found in profile response, using cache');
        // Only fall back to cache if profile doesn't have ai_setting
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setSettings(JSON.parse(cached));
        }
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      // Only fall back to cache on network error
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        console.log('📦 Using cached AI settings due to error');
        setSettings(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const apiUrl = authService.getApiUrl();
      const token = await authService.getToken();

      const response = await fetch(`${apiUrl}/ai/agent/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // ✅ ALWAYS refetch from server after save to ensure DB and UI match
        console.log('💾 Settings saved, refetching fresh data from server...');
        const profileData = await authService.getUserProfile();

        if (profileData && profileData.user && profileData.user.ai_setting) {
          // Update state with what's actually in the database
          console.log('✅ Fresh data loaded from DB:', profileData.user.ai_setting);
          setSettings(profileData.user.ai_setting);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(profileData.user.ai_setting));
          console.log('✅ DB and UI now in sync!');
        } else {
          // Fallback: use what we sent if profile fetch fails
          console.warn('⚠️ Profile refetch failed, using sent data');
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(settings));
        }

        showToastMessage(data.message || 'Settings saved successfully!', 'success');
      } else {
        showToastMessage(data.message || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      showToastMessage('Network error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    toastAnim.setValue(0);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const personalities = [
    { id: 'friendly', label: 'Friendly', emoji: '😊', desc: 'Warm and approachable' },
    { id: 'professional', label: 'Professional', emoji: '💼', desc: 'Formal and business-like' },
    { id: 'casual', label: 'Casual', emoji: '🤙', desc: 'Relaxed and informal' },
    { id: 'empathetic', label: 'Empathetic', emoji: '🤗', desc: 'Understanding and caring' },
  ];

  const responseTones = [
    { id: 'professional', label: 'Professional' },
    { id: 'friendly', label: 'Friendly' },
    { id: 'concise', label: 'Concise' },
    { id: 'detailed', label: 'Detailed' },
  ];

  const languages = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'es', label: 'Spanish', flag: '🇪🇸' },
    { id: 'fr', label: 'French', flag: '🇫🇷' },
    { id: 'de', label: 'German', flag: '🇩🇪' },
    { id: 'pt', label: 'Portuguese', flag: '🇵🇹' },
    { id: 'ad', label: 'AUTO', flag: '🌐' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

        {/* Header */}
        <LinearGradient
          colors={['#0A2540', '#1E3A5F']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <BackIcon />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <View style={styles.headerTitleRow}>
                <Animated.View style={{
                  transform: [{
                    rotate: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }, {
                    scale: sparkleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.15, 1]
                    })
                  }]
                }}>
                  <SparkleIcon size={24} color="#FFD700" />
                </Animated.View>
                <Text style={styles.headerTitle}>AI Agent</Text>
              </View>
              <Text style={styles.headerSubtitle}>Configure your intelligent assistant</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <ShimmerBox width={10} height={10} style={{ borderRadius: 5 }} />
            <ShimmerBox width={120} height={14} />
          </View>
        </LinearGradient>

        {/* Shimmer Loading */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.sectionHeader, { marginTop: 0 }]}>
            <ShimmerBox width={20} height={20} style={{ borderRadius: 10 }} />
            <ShimmerBox width={100} height={16} style={{ marginLeft: 8 }} />
          </View>
          <View style={styles.card}>
            <ShimmerBox width="50%" height={14} style={{ marginBottom: 12 }} />
            <View style={styles.optionsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={{ flex: 1, minWidth: '47%' }}>
                  <ShimmerBox width="100%" height={110} style={{ borderRadius: 12 }} />
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <ShimmerBox width={20} height={20} style={{ borderRadius: 10 }} />
            <ShimmerBox width={150} height={16} style={{ marginLeft: 8 }} />
          </View>
          <View style={styles.card}>
            <ShimmerBox width="40%" height={14} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4].map((i) => (
                <ShimmerBox key={i} width={80} height={36} style={{ borderRadius: 18 }} />
              ))}
            </View>
            {[1, 2, 3].map((i) => (
              <View key={i}>
                <View style={styles.settingRow}>
                  <View style={styles.settingRowLeft}>
                    <ShimmerBox width="50%" height={14} />
                    <ShimmerBox width="70%" height={12} style={{ marginTop: 4 }} />
                  </View>
                  <ShimmerBox width={50} height={30} style={{ borderRadius: 15 }} />
                </View>
                {i < 3 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          <ShimmerBox width="100%" height={56} style={{ marginTop: 24, borderRadius: 14 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header */}
      <LinearGradient
        colors={['#0A2540', '#1E3A5F']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <View style={styles.headerTitleRow}>
              <Animated.View style={{
                transform: [{
                  rotate: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }, {
                  scale: sparkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.15, 1]
                  })
                }]
              }}>
                <SparkleIcon size={24} color="#FFD700" />
              </Animated.View>
              <Text style={styles.headerTitle}>AI Agent</Text>
            </View>
            <Text style={styles.headerSubtitle}>Configure your intelligent assistant</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={styles.statusText}>
            {settings.enabled ? 'Active & Responding' : 'Currently Disabled'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Personality Section */}
          <View style={[styles.sectionHeader, { marginTop: 0 }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2"/>
              <Path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M15 9H15.01M9 9H9.01" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.sectionTitle}>Personality</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.labelText}>Choose AI Personality</Text>
            <View style={styles.optionsGrid}>
              {personalities.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.personalityOption,
                    settings.personality === p.id && styles.personalityOptionActive,
                  ]}
                  onPress={() => updateSetting('personality', p.id)}
                >
                  <Text style={styles.personalityEmoji}>{p.emoji}</Text>
                  <Text style={[
                    styles.personalityLabel,
                    settings.personality === p.id && styles.personalityLabelActive,
                  ]}>
                    {p.label}
                  </Text>
                  <Text style={styles.personalityDesc}>{p.desc}</Text>
                  {settings.personality === p.id && (
                    <View style={styles.selectedBadge}>
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <Path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Response Settings */}
          <View style={styles.sectionHeader}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.sectionTitle}>Response Configuration</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingLabel}>Enable AI Agent</Text>
                <Text style={styles.settingDesc}>Activate AI assistant for conversations</Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(val) => updateSetting('enabled', val)}
                trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                thumbColor={settings.enabled ? '#10B981' : '#9CA3AF'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.labelText}>Response Tone</Text>
            <View style={styles.toneOptions}>
              {responseTones.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  style={[
                    styles.toneOption,
                    settings.response_tone === tone.id && styles.toneOptionActive,
                  ]}
                  onPress={() => updateSetting('response_tone', tone.id)}
                >
                  <Text style={[
                    styles.toneLabel,
                    settings.response_tone === tone.id && styles.toneLabelActive,
                  ]}>
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingLabel}>Auto-Reply</Text>
                <Text style={styles.settingDesc}>Respond automatically to new messages</Text>
              </View>
              <Switch
                value={settings.auto_reply}
                onValueChange={(val) => updateSetting('auto_reply', val)}
                trackColor={{ false: '#E5E7EB', true: '#A78BFA' }}
                thumbColor={settings.auto_reply ? '#8B5CF6' : '#9CA3AF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingLabel}>Knowledge Base</Text>
                <Text style={styles.settingDesc}>Use training data for responses</Text>
              </View>
              <Switch
                value={settings.knowledge_base_enabled}
                onValueChange={(val) => updateSetting('knowledge_base_enabled', val)}
                trackColor={{ false: '#E5E7EB', true: '#A78BFA' }}
                thumbColor={settings.knowledge_base_enabled ? '#8B5CF6' : '#9CA3AF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingLabel}>Fallback to Human</Text>
                <Text style={styles.settingDesc}>Transfer to agent if AI can't help</Text>
              </View>
              <Switch
                value={settings.fallback_to_human}
                onValueChange={(val) => updateSetting('fallback_to_human', val)}
                trackColor={{ false: '#E5E7EB', true: '#A78BFA' }}
                thumbColor={settings.fallback_to_human ? '#8B5CF6' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Messages Section */}
          <View style={styles.sectionHeader}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M7 8H17M7 12H17M7 16H13" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.sectionTitle}>Custom Messages</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.labelText}>Greeting Message</Text>
            <TextInput
              style={styles.textArea}
              value={settings.greeting_message}
              onChangeText={(val) => updateSetting('greeting_message', val)}
              placeholder="Enter AI greeting message..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <View style={styles.divider} />

            <Text style={styles.labelText}>Offline Message</Text>
            <TextInput
              style={styles.textArea}
              value={settings.offline_message}
              onChangeText={(val) => updateSetting('offline_message', val)}
              placeholder="Enter offline message..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Language Section */}
          <View style={styles.sectionHeader}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2"/>
              <Path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22M2 12H22" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.sectionTitle}>Language</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.languageOptions}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.languageOption,
                    settings.language === lang.id && styles.languageOptionActive,
                  ]}
                  onPress={() => updateSetting('language', lang.id)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageLabel,
                    settings.language === lang.id && styles.languageLabelActive,
                  ]}>
                    {lang.label}
                  </Text>
                  {settings.language === lang.id && (
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17L4 12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveSettings}
            disabled={saving}
          >
            <LinearGradient
              colors={['#128C7E', '#0D6D61']}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M17 21V13H7V21M7 3V8H15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </Animated.View>
      </ScrollView>

      {/* Toast */}
      {showToast && (
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
            <View style={styles.toastIconWrapper}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.2,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Personality Options
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  personalityOption: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  personalityOptionActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  personalityEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  personalityLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  personalityLabelActive: {
    color: '#8B5CF6',
  },
  personalityDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },

  // Tone Options
  toneOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  toneOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  toneOptionActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
  },
  toneLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toneLabelActive: {
    color: '#8B5CF6',
  },

  // Settings Row
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },

  // Text Area
  textArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  // Language Options
  languageOptions: {
    gap: 10,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
  },
  languageFlag: {
    fontSize: 24,
  },
  languageLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  languageLabelActive: {
    color: '#8B5CF6',
  },

  // Save Button
  saveButton: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#128C7E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Toast
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
  toastIconWrapper: {
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
  },
});
