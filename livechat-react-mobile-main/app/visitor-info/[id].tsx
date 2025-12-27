import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BlurView as RNBlurView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import authService from '../../src/services/authService';
import conversationService from '../../src/services/conversationService';

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Shimmer
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

// Blurred Value Component for Free Users
const BlurredValue = ({ label, router }: any) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ position: 'relative' }}>
      <BlurView intensity={50} tint="light" style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        <TouchableOpacity
          onPress={() => router.push('/subscription')}
          activeOpacity={0.8}
        >
          <Animated.View style={{
            transform: [{ scale: pulseAnim }],
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}>
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#10B981" stroke="#10B981" strokeWidth="1"/>
            </Svg>
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              color: '#10B981',
              letterSpacing: 0.3,
            }}>
              Upgrade to view
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

export default function VisitorInfoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<any>(null);
  const [firstMessageExpanded, setFirstMessageExpanded] = useState(false);
  const [isFreeTier, setIsFreeTier] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadVisitorInfo();
    loadMembership();
  }, []);

  const loadMembership = async () => {
    try {
      const profileData = await authService.getUserProfile();

      // Check subscription.is_free_tier from API response
      if (profileData?.user?.subscription?.is_free_tier !== undefined) {
        setIsFreeTier(profileData.user.subscription.is_free_tier);
      }
    } catch (error) {
      console.error('Failed to load membership:', error);
    }
  };

  const loadVisitorInfo = async () => {
    try {
      const result = await conversationService.getConversation(Number(id));
      if (result.status === 'success') {
        setConversation(result.conversation);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Failed to load visitor info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryFlag = (code: string) => {
    const flags = {
      'NG': '🇳🇬', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'DE': '🇩🇪',
      'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'BR': '🇧🇷', 'IN': '🇮🇳',
    };
    return flags[code] || '🌍';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visitor Information</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Shimmer */}
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <ShimmerBox width={96} height={96} style={{ borderRadius: 48, alignSelf: 'center', marginBottom: 16 }} />
            <ShimmerBox width="40%" height={24} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <ShimmerBox width="30%" height={14} style={{ alignSelf: 'center' }} />
          </View>

          {/* Sections */}
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.card}>
              <ShimmerBox width="30%" height={18} style={{ marginBottom: 16 }} />
              {[1, 2, 3].map((j) => (
                <View key={j} style={styles.infoRow}>
                  <ShimmerBox width="25%" height={12} />
                  <ShimmerBox width="50%" height={14} />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const meta = conversation?.meta_data || {};
  const location = meta.location || {};
  const device = location.device || {};
  const browserCaps = meta.browser_capabilities || {};
  const security = location.security || {};

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visitor Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {conversation?.visitor_name ? conversation.visitor_name[0].toUpperCase() : 'V'}
              </Text>
            </View>
            <Text style={styles.visitorName}>
              {conversation?.visitor_name || 'Anonymous Visitor'}
            </Text>
            {conversation?.visitor_email && (
              <Text style={styles.visitorEmail}>{conversation.visitor_email}</Text>
            )}
            <Text style={styles.visitorId}>ID: {conversation?.visitor_id}</Text>
          </View>

          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <Circle cx="12" cy="10" r="3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.cardTitle}>Location</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>
                {getCountryFlag(location.country?.code)} {location.country?.name || 'Unknown'}
              </Text>
            </View>

            {location.city?.name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>City</Text>
                {isFreeTier ? (
                  <BlurredValue label="City" router={router} />
                ) : (
                  <Text style={styles.infoValue}>{location.city.name}</Text>
                )}
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IP Address</Text>
              {isFreeTier ? (
                <BlurredValue label="IP Address" router={router} />
              ) : (
                <Text style={styles.infoValue}>{conversation?.visitor_ip || location.ip}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timezone</Text>
              <Text style={styles.infoValue}>{location.timezone || meta.visitor_timezone}</Text>
            </View>

            {location.coordinates && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coordinates</Text>
                {isFreeTier ? (
                  <BlurredValue label="Coordinates" router={router} />
                ) : (
                  <Text style={styles.infoValue}>
                    {location.coordinates.latitude}°, {location.coordinates.longitude}°
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Device Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M12 18H12.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.cardTitle}>Device & Browser</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Browser</Text>
              <Text style={styles.infoValue}>
                {device.browser || 'Unknown'} {device.browser_version || ''}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              {isFreeTier ? (
                <BlurredValue label="Platform" router={router} />
              ) : (
                <Text style={styles.infoValue}>
                  {device.platform} {device.platform_version}
                </Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device Type</Text>
              <Text style={[styles.infoValue, styles.badge]}>
                {device.device_type?.toUpperCase() || 'DESKTOP'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Screen</Text>
              <Text style={styles.infoValue}>{meta.visitor_screen_resolution}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Language</Text>
              {isFreeTier ? (
                <BlurredValue label="Language" router={router} />
              ) : (
                <Text style={styles.infoValue}>{conversation?.visitor_language}</Text>
              )}
            </View>
          </View>

          {/* Activity Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
                <Path d="M12 6V12L16 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
              </Svg>
              <Text style={styles.cardTitle}>Activity</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Visit</Text>
              <Text style={styles.infoValue}>{formatDate(conversation?.created_at)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Activity</Text>
              {isFreeTier ? (
                <BlurredValue label="Last Activity" router={router} />
              ) : (
                <Text style={styles.infoValue}>{formatDate(conversation?.last_message_at)}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Page</Text>
              {isFreeTier ? (
                <BlurredValue label="Current Page" router={router} />
              ) : (
                <TouchableOpacity onPress={() => meta.visitor_url && Linking.openURL(meta.visitor_url)}>
                  <Text style={[styles.infoValue, styles.linkText]} numberOfLines={1}>
                    {meta.visitor_url || 'N/A'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Referrer</Text>
              {conversation?.visitor_referrer && conversation.visitor_referrer !== 'Direct' ? (
                <TouchableOpacity onPress={() => Linking.openURL(conversation.visitor_referrer)}>
                  <Text style={[styles.infoValue, styles.linkText]} numberOfLines={1}>
                    {conversation.visitor_referrer}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>Direct</Text>
              )}
            </View>

            {conversation?.first_message && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => setFirstMessageExpanded(!firstMessageExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.infoLabel}>First Message</Text>
                <View style={{ flex: 2 }}>
                  <Text style={styles.infoValue} numberOfLines={firstMessageExpanded ? undefined : 2}>
                    {conversation.first_message}
                  </Text>
                  {conversation.first_message.length > 100 && (
                    <Text style={styles.expandText}>
                      {firstMessageExpanded ? 'Tap to collapse' : 'Tap to expand'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Visited Pages */}
          {meta.visitor_pages && meta.visitor_pages.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.cardTitle}>Visited Pages</Text>
              </View>

              {isFreeTier ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pages ({meta.visitor_pages.length})</Text>
                  <BlurredValue label="Pages" router={router} />
                </View>
              ) : (
                meta.visitor_pages.map((page: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.pageItem}
                    onPress={() => Linking.openURL(page)}
                  >
                    <View style={styles.pageNumber}>
                      <Text style={styles.pageNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.pageUrl, styles.linkText]} numberOfLines={1}>
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Conversation Status */}
          {conversation?.status === 'closed' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 12L11 14L15 10" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.cardTitle}>Conversation Status</Text>
              </View>

              {conversation?.closed_at && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Closed At</Text>
                  <Text style={styles.infoValue}>{formatDate(conversation.closed_at)}</Text>
                </View>
              )}

              {conversation?.closed_by && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Closed By</Text>
                  <Text style={styles.infoValue}>
                    {conversation.closed_by_user?.name || conversation.closed_by_user?.email || `User #${conversation.closed_by}`}
                  </Text>
                </View>
              )}

              {conversation?.close_reason && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Close Reason</Text>
                  <Text style={styles.infoValue}>{conversation.close_reason}</Text>
                </View>
              )}

              {conversation?.rating && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rating</Text>
                  {isFreeTier ? (
                    <BlurredValue label="Rating" router={router} />
                  ) : (
                    <Text style={styles.infoValue}>
                      {'⭐'.repeat(conversation.rating)}
                    </Text>
                  )}
                </View>
              )}

              {conversation?.rating_comment && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rating Comment</Text>
                  {isFreeTier ? (
                    <BlurredValue label="Rating Comment" router={router} />
                  ) : (
                    <Text style={styles.infoValue}>{conversation.rating_comment}</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Browser Capabilities */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2"/>
                <Path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
              </Svg>
              <Text style={styles.cardTitle}>Browser Features</Text>
            </View>

            <View style={styles.capabilitiesGrid}>
              <View style={styles.capItem}>
                <Text style={browserCaps.cookiesEnabled ? styles.capEnabled : styles.capDisabled}>
                  {browserCaps.cookiesEnabled ? '✓' : '✕'}
                </Text>
                <Text style={styles.capLabel}>Cookies</Text>
              </View>
              <View style={styles.capItem}>
                <Text style={browserCaps.localStorage ? styles.capEnabled : styles.capDisabled}>
                  {browserCaps.localStorage ? '✓' : '✕'}
                </Text>
                <Text style={styles.capLabel}>Storage</Text>
              </View>
              <View style={styles.capItem}>
                <Text style={browserCaps.touchScreen ? styles.capEnabled : styles.capDisabled}>
                  {browserCaps.touchScreen ? '✓' : '✕'}
                </Text>
                <Text style={styles.capLabel}>Touch</Text>
              </View>
              <View style={styles.capItem}>
                <Text style={browserCaps.javaEnabled ? styles.capEnabled : styles.capDisabled}>
                  {browserCaps.javaEnabled ? '✓' : '✕'}
                </Text>
                <Text style={styles.capLabel}>Java</Text>
              </View>
            </View>
          </View>

          {/* Security Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.cardTitle}>Security</Text>
            </View>

            <View style={styles.securityGrid}>
              <View style={styles.securityItem}>
                <View style={[styles.securityBadge, !security.is_vpn && styles.securityBadgeSafe]}>
                  <Text style={styles.securityText}>{security.is_vpn ? 'VPN' : 'No VPN'}</Text>
                </View>
              </View>
              <View style={styles.securityItem}>
                <View style={[styles.securityBadge, !security.is_tor && styles.securityBadgeSafe]}>
                  <Text style={styles.securityText}>{security.is_tor ? 'TOR' : 'No TOR'}</Text>
                </View>
              </View>
              <View style={styles.securityItem}>
                <View style={[styles.securityBadge, !security.is_anonymous_proxy && styles.securityBadgeSafe]}>
                  <Text style={styles.securityText}>{security.is_anonymous_proxy ? 'Proxy' : 'No Proxy'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Profile
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
  },
  avatarSection: {
    paddingVertical: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  visitorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  visitorEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
  },
  visitorId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Card
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
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  badge: {
    backgroundColor: '#10B981',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Capabilities
  capabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  capItem: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  capEnabled: {
    fontSize: 24,
    color: '#10B981',
    marginBottom: 4,
  },
  capDisabled: {
    fontSize: 24,
    color: '#EF4444',
    marginBottom: 4,
  },
  capLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Security
  securityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  securityItem: {
    flex: 1,
  },
  securityBadge: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  securityBadgeSafe: {
    backgroundColor: '#D1FAE5',
  },
  securityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },

  // Links
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },

  // Expandable message
  expandText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'right',
  },

  // Visited Pages
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  pageNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  pageUrl: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
});
