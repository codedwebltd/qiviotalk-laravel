import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Clipboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import authService from '../src/services/authService';
import conversationService from '../src/services/conversationService';

const CACHE_KEY = 'widget_data';

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = ({ color = "#10B981" }) => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <Path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const AlertCircleIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
    <Path d="M12 8V12M12 16H12.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const CopyIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M8 4V16C8 17.1046 8.89543 18 10 18H18M8 4C8 2.89543 8.89543 2 10 2H16L20 6V16C20 17.1046 19.1046 18 18 18M8 4C6.89543 4 6 4.89543 6 6V20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20V18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const RefreshIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93433 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function WidgetScreen() {
  const router = useRouter();
  const [widget, setWidget] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const verifyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Check if onboarding is completed first
    checkOnboardingAndLoad();

    return () => {
      if (verifyIntervalRef.current) {
        clearInterval(verifyIntervalRef.current);
      }
    };
  }, []);

  const checkOnboardingAndLoad = async () => {
    try {
      // Check onboarding status from server
      const profileData = await authService.getUserProfile();

      if (!profileData || !profileData.onboarding_completed) {
        // Redirect to setup if not completed
        console.log('⚠️ Widget screen - Onboarding not completed, redirecting to setup');
        router.replace('/setup');
        return;
      }

      console.log('✅ Widget screen - Onboarding completed, loading widget');

      // Onboarding completed - proceed to load widget
      // Optimistic load - show cached data immediately
      loadCachedWidget();

      // Then fetch fresh data in background
      loadWidget();

      // Animate entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, redirect to setup to be safe
      router.replace('/setup');
    }
  };

  // Auto-verify widget installation every 30 seconds if not installed
  useEffect(() => {
    if (!widget || widget.is_installed) {
      if (verifyIntervalRef.current) {
        clearInterval(verifyIntervalRef.current);
      }
      return;
    }

    verifyIntervalRef.current = setInterval(() => {
      loadWidget(true);
    }, 30000);

    return () => {
      if (verifyIntervalRef.current) {
        clearInterval(verifyIntervalRef.current);
      }
    };
  }, [widget]);

  const loadCachedWidget = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setWidget(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Failed to load cached widget:', error);
    }
  };

  const loadWidget = async (silent = false) => {
    if (!silent) {
      setRefreshing(true);
    }
    try {
      const result = await conversationService.getWidget();
      if (result.status === 'success') {
        setWidget(result.widget);
        // Cache the widget data
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result.widget));
      }
    } catch (err) {
      console.error('Error loading widget:', err);
    } finally {
      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  const copyCode = () => {
    if (!widget) return;

    const apiUrl = authService.getApiUrl();
    const baseUrl = apiUrl.replace('/api', '');
    const code = `<script src="${baseUrl}/widgets/widget-${widget.widget_key}.js" async></script>`;

    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiUrl = authService.getApiUrl();
  const baseUrl = apiUrl.replace('/api', '');
  const widgetCode = widget ? `<script src="${baseUrl}/widgets/widget-${widget.widget_key}.js" async></script>` : 'Loading...';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#128C7E" />

      {/* Header - Same size as Inbox */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Widget Setup</Text>
          <TouchableOpacity
            onPress={() => loadWidget()}
            style={styles.refreshBtn}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshIcon />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!widget ? (
          // Shimmer Loading
          <>
            {/* Status Card Shimmer */}
            <View style={styles.statusCard}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <ShimmerBox width={48} height={48} style={{ borderRadius: 24 }} />
              </View>
              <View style={styles.statusContent}>
                <ShimmerBox width="50%" height={20} style={{ marginBottom: 8, alignSelf: 'center' }} />
                <ShimmerBox width="80%" height={14} style={{ marginBottom: 4, alignSelf: 'center' }} />
                <ShimmerBox width="60%" height={14} style={{ alignSelf: 'center' }} />
              </View>
            </View>

            {/* Widget Code Card Shimmer */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ShimmerBox width={48} height={48} style={{ borderRadius: 24, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <ShimmerBox width="50%" height={16} />
                  <ShimmerBox width="70%" height={12} style={{ marginTop: 6 }} />
                </View>
              </View>

              <View style={styles.codeBox}>
                <ShimmerBox width="90%" height={16} />
              </View>

              <ShimmerBox width="100%" height={56} style={{ borderRadius: 12 }} />
            </View>

            {/* Quick Steps Shimmer */}
            <View style={styles.card}>
              <ShimmerBox width="40%" height={18} style={{ marginBottom: 16 }} />

              {[1, 2, 3].map((i) => (
                <View key={i}>
                  <View style={styles.stepItem}>
                    <ShimmerBox width={36} height={36} style={{ borderRadius: 18, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <ShimmerBox width="40%" height={14} style={{ marginBottom: 6 }} />
                      <ShimmerBox width="80%" height={12} />
                    </View>
                  </View>
                  {i < 3 && <View style={styles.stepDivider} />}
                </View>
              ))}
            </View>

            {/* Help Card Shimmer */}
            <View style={styles.helpCard}>
              <ShimmerBox width={32} height={32} style={{ borderRadius: 16, marginBottom: 12 }} />
              <ShimmerBox width="40%" height={16} style={{ marginBottom: 8, alignSelf: 'center' }} />
              <ShimmerBox width="80%" height={12} style={{ alignSelf: 'center' }} />
            </View>

            <View style={{ height: 20 }} />
          </>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Status Card */}
            <View style={[styles.statusCard, widget?.is_installed ? styles.statusCardSuccess : styles.statusCardWarning]}>
              <View style={styles.statusIcon}>
                {widget?.is_installed ? (
                  <CheckCircleIcon color="#10B981" />
                ) : (
                  <AlertCircleIcon />
                )}
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>
                  {widget?.is_installed ? '✓ Widget Active' : 'Setup Required'}
                </Text>
                <Text style={styles.statusMessage}>
                  {widget?.is_installed
                    ? 'Your chat widget is live and receiving conversations'
                    : 'Complete the setup below to start receiving messages'}
                </Text>
                {widget?.last_verified_at && (
                  <Text style={styles.statusTime}>
                    Last verified {new Date(widget.last_verified_at).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>

          {/* Widget Code Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Your Widget Code</Text>
                <Text style={styles.cardSubtitle}>Tap to copy • Add to your website</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.codeBox}
              onPress={copyCode}
              activeOpacity={0.8}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText} selectable>
                  {widgetCode}
                </Text>
              </ScrollView>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copyButtonSuccess]}
              onPress={copyCode}
              activeOpacity={0.85}
            >
              <View style={styles.copyButtonContent}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                <Text style={styles.copyButtonText}>
                  {copied ? 'Copied to Clipboard!' : 'Copy Widget Code'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Steps Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quick Installation</Text>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Copy the code</Text>
                <Text style={styles.stepDesc}>Tap the copy button above to copy your widget code</Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add to your website</Text>
                <Text style={styles.stepDesc}>Paste the code before the closing &lt;/body&gt; tag</Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Visit your site</Text>
                <Text style={styles.stepDesc}>The widget will auto-activate within 30 seconds</Text>
              </View>
            </View>
          </View>

          {/* Help Card */}
          <View style={styles.helpCard}>
            <View style={styles.helpIconContainer}>
              <Text style={styles.helpEmoji}>💡</Text>
            </View>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Need assistance?</Text>
              <Text style={styles.helpText}>
                Our support team is available 24/7 to help you get started
              </Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusCardSuccess: {
    borderLeftColor: '#10B981',
  },
  statusCardWarning: {
    borderLeftColor: '#F59E0B',
  },
  statusIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  statusTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  codeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    minHeight: 60,
    justifyContent: 'center',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#128C7E',
    lineHeight: 18,
  },
  copyButton: {
    backgroundColor: '#128C7E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#128C7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  copyButtonSuccess: {
    backgroundColor: '#10B981',
  },
  copyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
    marginLeft: 48,
  },
  helpCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  helpIconContainer: {
    marginRight: 12,
  },
  helpEmoji: {
    fontSize: 28,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
});
