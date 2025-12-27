import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import authService from '../src/services/authService';

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const BrainIcon = ({ size = 24, color = "#8B5CF6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C12 2 8 4 8 8C8 12 6 14 4 14C4 14 4 18 8 18C12 18 12 22 12 22M12 2C12 2 16 4 16 8C16 12 18 14 20 14C20 14 20 18 16 18C12 18 12 22 12 22M12 2V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// Shimmer component for loading state
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
          backgroundColor: '#E5E7EB',
          borderRadius: 8,
          opacity,
        },
        style,
      ]}
    />
  );
};

export default function AITrainingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [context, setContext] = useState({
    website_url: '',
    about_content: '',
    products_services: [],
    faq_data: [],
    contact_info: {},
    pricing_info: [],
    meta_description: '',
    key_features: [],
    full_context: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadContext();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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

  const loadContext = async () => {
    try {
      const profileData = await authService.getUserProfile();
      if (profileData?.user?.widget?.website_context) {
        const ctx = profileData.user.widget.website_context;
        setContext({
          website_url: ctx.website_url || '',
          about_content: ctx.about_content || '',
          products_services: ctx.products_services || [],
          faq_data: ctx.faq_data || [],
          contact_info: ctx.contact_info || {},
          pricing_info: ctx.pricing_info || [],
          meta_description: ctx.meta_description || '',
          key_features: ctx.key_features || [],
          full_context: ctx.full_context || '',
        });
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContext = async () => {
    setSaving(true);
    try {
      const apiUrl = authService.getApiUrl();
      const token = await authService.getToken();

      const response = await fetch(`${apiUrl}/website-context/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToastMessage(data.message || 'AI training data updated successfully!', 'success');
      } else {
        showToastMessage(data.message || 'Failed to update training data', 'error');
      }
    } catch (error) {
      console.error('Failed to save context:', error);
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

  const updateField = (field: string, value: any) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

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
                <BrainIcon size={24} color="#FFD700" />
                <Text style={styles.headerTitle}>AI Training</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.card}>
              <ShimmerBox width="50%" height={18} style={{ marginBottom: 12 }} />
              <ShimmerBox width="100%" height={100} />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

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
              <BrainIcon size={24} color="#FFD700" />
              <Text style={styles.headerTitle}>AI Training</Text>
            </View>
            <Text style={styles.headerSubtitle}>Train your AI with website context</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={styles.statusText}>Ready for Training</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Website URL */}
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M21 12H3M12 21C7.02944 21 3 16.9706 3 12M12 21C13.6569 21 15 16.9706 15 12C15 7.02944 13.6569 3 12 3M12 21C10.3431 21 9 16.9706 9 12C9 7.02944 10.3431 3 12 3M3 12C3 7.02944 7.02944 3 12 3" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.fieldLabel}>Website URL</Text>
              </View>
              <TextInput
                style={styles.input}
                value={context.website_url}
                onChangeText={(val) => updateField('website_url', val)}
                placeholder="https://example.com"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* About Content */}
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.fieldLabel}>About Your Business</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={context.about_content}
                onChangeText={(val) => updateField('about_content', val)}
                placeholder="Describe your business, what you do, and what makes you unique..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Meta Description */}
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M7 8H17M7 12H17M7 16H13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.fieldLabel}>Meta Description</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={context.meta_description}
                onChangeText={(val) => updateField('meta_description', val)}
                placeholder="Brief description of your website for search engines..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Products/Services */}
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.fieldLabel}>Products & Services</Text>
              </View>
              <Text style={styles.helpText}>One item per line</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={Array.isArray(context.products_services) ? context.products_services.join('\n') : ''}
                onChangeText={(val) => updateField('products_services', val.split('\n').filter(v => v.trim()))}
                placeholder="List your products or services&#10;E.g., Web Development&#10;Mobile Apps&#10;UI/UX Design"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Key Features */}
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.fieldLabel}>Key Features</Text>
              </View>
              <Text style={styles.helpText}>One feature per line</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={Array.isArray(context.key_features) ? context.key_features.join('\n') : ''}
                onChangeText={(val) => updateField('key_features', val.split('\n').filter(v => v.trim()))}
                placeholder="List your key features&#10;E.g., 24/7 Support&#10;Fast Delivery&#10;Secure Payment"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Contact Info */}
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.fieldLabel}>Contact Phone</Text>
              </View>
              <TextInput
                style={styles.input}
                value={context.contact_info?.phone || ''}
                onChangeText={(val) => updateField('contact_info', { ...context.contact_info, phone: val })}
                placeholder="+1 234 567 8900"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            {/* Full Context */}
            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.fieldLabel}>Additional Context</Text>
              </View>
              <Text style={styles.helpText}>Any additional information about your business</Text>
              <ScrollView
                style={styles.scrollableTextArea}
                nestedScrollEnabled={true}
              >
                <TextInput
                  style={[styles.input, styles.textArea, { height: 200 }]}
                  value={context.full_context}
                  onChangeText={(val) => updateField('full_context', val)}
                  placeholder="Add any other relevant information about your business, policies, procedures, etc..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={8}
                />
              </ScrollView>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveContext}
              disabled={saving}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                    <Text style={styles.saveButtonText}>Save Training Data</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#374151',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  scrollableTextArea: {
    maxHeight: 200,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
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
