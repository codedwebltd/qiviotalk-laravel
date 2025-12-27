import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import Svg, { Path } from 'react-native-svg';
import DrawerMenu from '../src/components/DrawerMenu';
import authService from '../src/services/authService';
import conversationService from '../src/services/conversationService';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

// Icons
const MenuIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 12H21M3 6H21M3 18H21" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BellIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Stats Icons
const ChatBubbleIcon = ({ color = "#3B82F6" }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M8 10H16M8 14H11M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const UnreadIcon = ({ color = "#10B981" }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 6L12 13L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = ({ color = "#F59E0B" }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChartIcon = ({ color = "#8B5CF6" }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 3V21M21 21H3M7 13V17M12 9V17M17 5V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const WalletBalanceIcon = ({ color = "#8B5CF6" }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V12ZM21 12H16C14.8954 12 14 12.8954 14 14C14 15.1046 14.8954 16 16 16H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [stats, setStats] = useState({
    openChats: 0,
    unreadMessages: 0,
    closedToday: 0,
    aiResponses: 0,
  });
  const [onlineVisitors, setOnlineVisitors] = useState(0);
  const [refundBalance, setRefundBalance] = useState('0.00');
  const [recentConversations, setRecentConversations] = useState([]);
  const [userName, setUserName] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [membershipType, setMembershipType] = useState<'free' | 'premium' | 'enterprise'>('free');
  const [membershipExpiresAt, setMembershipExpiresAt] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [hoursRemaining, setHoursRemaining] = useState<number>(0);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await loadDashboard(); // Show shimmer on first load
      setIsInitialLoad(false); // Mark initial load complete
      // Check onboarding status
      const completed = await authService.isOnboardingCompleted();
      setOnboardingCompleted(completed);
    };
    init();
    loadUserName();
    updateTime();
    const timer = setInterval(updateTime, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Real-time countdown timer - updates EVERY SECOND like a coming soon page
  useEffect(() => {
    if (!membershipExpiresAt || membershipType === 'free') return;

    const updateCountdown = () => {
      // Handle both "YYYY-MM-DD HH:MM:SS" and ISO format
      const expiryDateStr = membershipExpiresAt.replace(' ', 'T');
      const expiryDate = new Date(expiryDateStr);
      const now = new Date();

      // Calculate total difference in milliseconds
      const diffTime = expiryDate.getTime() - now.getTime();

      if (diffTime <= 0) {
        // Expired
        setDaysRemaining(0);
        setHoursRemaining(0);
        setMinutesRemaining(0);
        setSecondsRemaining(0);
        return;
      }

      // Calculate days, hours, minutes, seconds
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

      // Update all state
      setDaysRemaining(days);
      setHoursRemaining(hours);
      setMinutesRemaining(minutes);
      setSecondsRemaining(seconds);
    };

    // Update immediately
    updateCountdown();

    // Update EVERY SECOND (1000ms) for real-time countdown
    const countdownTimer = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(countdownTimer);
    };
  }, [membershipExpiresAt, membershipType]);

  // 🔴 PUSHER REMOVED FROM DASHBOARD - No real-time updates here to avoid conflicts
  // Dashboard refreshes from API only. Real-time updates happen in Inbox and Chat screens.
  useFocusEffect(
    useCallback(() => {
      // Only reload if not initial load (tab navigation)
      if (!isInitialLoad) {
        loadDashboard(true); // Silent reload - no shimmer
      }
    }, [isInitialLoad])
  );

  // Back button handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Show toast instead of exiting app
        setShowToast(true);
        toastAnim.setValue(0);

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
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setShowToast(false));

        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [])
  );

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    setCurrentTime(`${displayHours}:${minutes} ${ampm}`);
  };

  const loadUserName = async () => {
    const name = await (authService as any).getUserData('name');
    const firstName = name ? String(name).split(' ')[0] : 'User';
    setUserName(firstName);
  };

  const loadDashboard = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      // Fetch open conversations
      const openResult = await conversationService.getConversations({
        status: 'open',
        limit: 5,
      });

      // Fetch all conversations to count AI responses and online visitors
      const allConversations = await conversationService.getConversations({
        limit: 1000,
      });

      // Fetch closed conversations from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const closedResult = await conversationService.getConversations({
        status: 'closed',
        limit: 1000,
      });

      if (openResult.status === 'success') {
        setRecentConversations(openResult.conversations || []);

        // Calculate unread messages from open conversations
        const unreadCount = (openResult.conversations || []).reduce((sum: number, conv: any) => {
          return sum + (conv.unread_count || 0);
        }, 0);

        // Calculate closed today
        const closedToday = (closedResult.conversations || []).filter((conv: any) => {
          const closedAt = new Date(conv.updated_at);
          return closedAt >= today;
        }).length;

        // Count AI responses (messages with sender_type = 'bot')
        let aiResponseCount = 0;
        if (allConversations.status === 'success') {
          aiResponseCount = (allConversations.conversations || []).reduce((sum: number, conv: any) => {
            const botMessages = (conv.messages || []).filter((msg: any) => msg.sender_type === 'bot');
            return sum + botMessages.length;
          }, 0);
        }

        // Count online visitors (conversations with status = 'open' and active in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineCount = (openResult.conversations || []).filter((conv: any) => {
          const lastActivity = new Date(conv.last_message_at || conv.updated_at);
          return lastActivity >= fiveMinutesAgo;
        }).length;

        setOnlineVisitors(onlineCount);

        // Fetch wallet balance for refund display
        const profileData = await authService.getUserProfile();
        const walletBalance = profileData?.user?.wallet?.balance || '0.00';

        setRefundBalance(walletBalance);
        setStats({
          openChats: openResult.total || 0,
          unreadMessages: unreadCount,
          closedToday: closedToday,
          aiResponses: aiResponseCount,
        });
      }

      // Fetch fresh user profile with onboarding data (updates AsyncStorage automatically)
      const profileData = await authService.getUserProfile();

      if (profileData) {
        const completed = profileData.onboarding_completed;
        setOnboardingCompleted(completed);

        // Extract membership type and expiration
        if (profileData.user?.membership_type) {
          setMembershipType(profileData.user.membership_type);
        }

        if (profileData.user?.membership_expires_at) {
          // Store expiration date - the useEffect will handle the countdown calculation
          setMembershipExpiresAt(profileData.user.membership_expires_at);
        } else {
          // Clear countdown if no expiration date
          setMembershipExpiresAt(null);
          setDaysRemaining(null);
        }

        // Extract notification count from profile data
        if (profileData.user?.notifications) {
          const unreadCount = profileData.user.notifications.filter(
            (notif: any) => !notif.read_at
          ).length;
          setNotificationCount(unreadCount);
        }

        // Update setup cache with fresh server data
        const onboardingData = profileData.user.onboarding;
        if (onboardingData) {
          const SETUP_CACHE_KEY = 'setup_data';
          const formData = {
            company_name: onboardingData.company_name || '',
            industry: onboardingData.industry || 'E-commerce',
            team_size: onboardingData.team_size || '2-5 employees',
            website: onboardingData.website || '',
            primary_goal: onboardingData.primary_goal || 'Improve customer support',
            widget_position: onboardingData.widget_position || 'right',
            primary_color: onboardingData.primary_color || '#128C7E',
            chat_icon: onboardingData.chat_icon || 'comments',
            welcome_message: onboardingData.welcome_message || 'Hi there! How can I help you today?'
          };

          // Update setup cache with fresh server data
          await AsyncStorage.setItem(SETUP_CACHE_KEY, JSON.stringify({
            formData,
            currentStep: completed ? 4 : 1,
            isCompleted: completed
          }));
        }
      }
    } catch (error) {
      // Error handled silently
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitial = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'V';
  };

  const isOnline = (lastActivityTime: string) => {
    if (!lastActivityTime) return false;
    const now = new Date();
    const lastActive = new Date(lastActivityTime);
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / 60000);
    return diffMinutes < 5; // Online if active within last 5 minutes
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  const displayConversations = recentConversations;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A2540"
        translucent={false}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#0A2540', '#1E3A5F']}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => setDrawerVisible(true)}
          >
            <MenuIcon />
          </TouchableOpacity>
          <Text style={styles.time}>{currentTime}</Text>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => router.push('/notifications' as any)}
          >
            <BellIcon />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.greetRow}>
          <Text style={styles.greet}>{getGreeting()}, {userName}! 👋</Text>
        </View>

        {/* Membership Info Row */}
        <View style={styles.membershipRow}>
          <TouchableOpacity
            style={[
              styles.membershipBadge,
              membershipType === 'premium' && styles.membershipPremium,
              membershipType === 'enterprise' && styles.membershipEnterprise,
              membershipType === 'free' && styles.membershipFree,
            ]}
            onPress={() => router.push('/subscription' as any)}
            activeOpacity={0.7}
          >
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={membershipType === 'premium' ? '#F59E0B' : membershipType === 'enterprise' ? '#8B5CF6' : '#64748B'}
                stroke={membershipType === 'premium' ? '#F59E0B' : membershipType === 'enterprise' ? '#8B5CF6' : '#64748B'}
                strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.membershipText}>
              {membershipType.charAt(0).toUpperCase() + membershipType.slice(1)}
            </Text>
          </TouchableOpacity>

          {/* Expiration Countdown Timer or Upgrade/Renew Button */}
          {membershipType !== 'free' && daysRemaining !== null ? (
            <>
              <View style={[
                styles.countdownBadge,
                daysRemaining < 7 && styles.countdownBadgeUrgent
              ]}>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <Path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke={daysRemaining < 7 ? '#EF4444' : '#F59E0B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={[styles.countdownText, daysRemaining < 7 && styles.countdownTextUrgent]}>
                  {daysRemaining}d {hoursRemaining}h {minutesRemaining}m {secondsRemaining}s
                </Text>
              </View>
              {daysRemaining < 7 && (
                <TouchableOpacity
                  style={styles.renewButton}
                  onPress={() => router.push('/subscription' as any)}
                  activeOpacity={0.8}
                >
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <Path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                  <Text style={styles.renewButtonText}>Renew</Text>
                </TouchableOpacity>
              )}
            </>
          ) : membershipType === 'free' ? (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/subscription' as any)}
              activeOpacity={0.8}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d="M13 7L18 12M18 12L13 17M18 12H6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <View style={[styles.tagDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.tagText}>{stats.openChats} Active</Text>
          </View>
          <View style={styles.tag}>
            <View style={[styles.tagDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.tagText}>{onlineVisitors} Online</Text>
          </View>
          <TouchableOpacity
            style={styles.refundTag}
            onPress={() => router.push('/transactions' as any)}
            activeOpacity={0.8}
          >
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V12ZM21 12H16C14.8954 12 14 12.8954 14 14C14 15.1046 14.8954 16 16 16H21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.refundLabel}>Refund:</Text>
            <Text style={styles.refundAmount}>${parseFloat(refundBalance).toFixed(2)}</Text>
          </TouchableOpacity>
        </View>

        {/* Setup Button - Shows different design based on completion */}
        <TouchableOpacity
          style={onboardingCompleted ? styles.verifiedButton : styles.setupButton}
          onPress={() => router.push('/setup' as any)}
          activeOpacity={0.8}
        >
          <View style={onboardingCompleted ? styles.verifiedButtonIcon : styles.setupButtonIcon}>
            {onboardingCompleted ? (
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M9 12L11 14L15 10M7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.07989 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.07989 20 7.2 20Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            ) : (
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            )}
          </View>
          <View style={styles.setupButtonContent}>
            {onboardingCompleted ? (
              <>
                <Text style={styles.verifiedButtonTitle}>✓ Setup Verified</Text>
                <Text style={styles.verifiedButtonText}>Your business profile is complete • Tap to view</Text>
              </>
            ) : (
              <>
                <Text style={styles.setupButtonTitle}>Complete Your Setup</Text>
                <Text style={styles.setupButtonText}>Finish setting up your account to unlock all features</Text>
              </>
            )}
          </View>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path d="M9 18L15 12L9 6" stroke={onboardingCompleted ? "#10B981" : "#F59E0B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* 4 Stats Cards */}
        <View style={styles.statsContainer}>
          {loading ? (
            <>
              <View style={styles.statsRow}>
                <ShimmerPlaceholder style={styles.statShimmer} />
                <ShimmerPlaceholder style={styles.statShimmer} />
              </View>
              <View style={styles.statsRow}>
                <ShimmerPlaceholder style={styles.statShimmer} />
                <ShimmerPlaceholder style={styles.statShimmer} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={[styles.stat, styles.blue]}>
                  <View style={styles.statRow}>
                    <View>
                      <Text style={styles.statNum}>{stats.openChats}</Text>
                      <Text style={styles.statLbl}>Open Chats</Text>
                    </View>
                    <View style={styles.statIcon}>
                      <ChatBubbleIcon color="#3B82F6" />
                    </View>
                  </View>
                </View>

                <View style={[styles.stat, styles.green]}>
                  <View style={styles.statRow}>
                    <View>
                      <Text style={styles.statNum}>{stats.unreadMessages}</Text>
                      <Text style={styles.statLbl}>Unread</Text>
                    </View>
                    <View style={styles.statIcon}>
                      <UnreadIcon color="#10B981" />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.stat, styles.orange]}>
                  <View style={styles.statRow}>
                    <View>
                      <Text style={styles.statNum}>{stats.closedToday}</Text>
                      <Text style={styles.statLbl}>Closed Today</Text>
                    </View>
                    <View style={styles.statIcon}>
                      <CheckCircleIcon color="#F59E0B" />
                    </View>
                  </View>
                </View>

                <View style={[styles.stat, styles.purple]}>
                  <View style={styles.statRow}>
                    <View>
                      <Text style={styles.statNum}>{stats.aiResponses}</Text>
                      <Text style={styles.statLbl}>AI Responses</Text>
                    </View>
                    <View style={styles.statIcon}>
                      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.title}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actions}
        >
          <TouchableOpacity
            style={styles.action}
            onPress={() => router.push('/(tabs)/inbox' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path d="M8 10H16M8 14H16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.actionText}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.action}
            onPress={() => router.push('/(tabs)/agent' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path d="M9.75 17L9 20L10 21H14L15 20L14.25 17M3 13H21M5 17H19C20.1046 17 21 16.1046 21 15V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.actionText}>AI Agent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.action}
            onPress={() => router.push('/widget' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={styles.actionText}>Widget</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.action}
            onPress={() => router.push('/settings' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Enhanced Recent Activity */}
        <Text style={styles.title}>Recent Conversations</Text>
        <View style={styles.chatList}>
          {loading ? (
            <>
              <ShimmerPlaceholder style={styles.chatShimmer} />
              <ShimmerPlaceholder style={styles.chatShimmer} />
              <ShimmerPlaceholder style={styles.chatShimmer} />
            </>
          ) : displayConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <Path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyDesc}>New conversations will appear here</Text>
            </View>
          ) : (
            displayConversations.map((conv: any) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.chatCard}
                onPress={() => router.push(`/chat/${conv.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.chatLeft}>
                  <View style={styles.chatAvatarWrap}>
                    <View style={styles.chatAvatar}>
                      <Text style={styles.chatAvatarText}>{getInitial(conv.visitor_name)}</Text>
                    </View>
                    {isOnline(conv.last_message_at || conv.updated_at) && <View style={styles.chatOnline} />}
                  </View>
                </View>
                
                <View style={styles.chatContent}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>
                      {conv.visitor_name || `Visitor ${conv.id}`}
                    </Text>
                    <View style={styles.chatTimeWrap}>
                      <Text style={styles.chatTime}>
                        {formatTime(conv.last_message_at || conv.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chatMessageRow}>
                    <Text style={styles.chatMessage} numberOfLines={1}>
                      {conv.last_message?.content || 'New conversation'}
                    </Text>
                    {conv.unread_count > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{conv.unread_count}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Toast */}
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.toastContent}>
            <Text style={styles.toastIcon}>ℹ️</Text>
            <Text style={styles.toastText}>You're on the home screen</Text>
          </View>
        </Animated.View>
      )}
    </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0A2540',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  greetRow: {
    marginBottom: 12,
  },
  greet: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  membershipFree: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  membershipPremium: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  membershipEnterprise: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  membershipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 5,
  },
  countdownBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  countdownText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  countdownTextUrgent: {
    color: '#FEE2E2',
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    gap: 5,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  renewButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#10B981',
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tags: {
    flexDirection: 'row',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  refundTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  refundLabel: {
    color: '#FEF3C7',
    fontSize: 11,
    fontWeight: '600',
  },
  refundAmount: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 12,
  },
  setupButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupButtonContent: {
    flex: 1,
  },
  setupButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  setupButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  verifiedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 12,
  },
  verifiedButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  verifiedButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statShimmer: {
    flex: 1,
    height: 100,
    borderRadius: 14,
  },
  blue: {
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
  },
  green: {
    borderBottomWidth: 3,
    borderBottomColor: '#10B981',
  },
  orange: {
    borderBottomWidth: 3,
    borderBottomColor: '#F59E0B',
  },
  purple: {
    borderBottomWidth: 3,
    borderBottomColor: '#8B5CF6',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 26,
  },
  action: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 68,
    height: 68,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  chatList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chatShimmer: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chatLeft: {
    marginRight: 12,
  },
  chatAvatarWrap: {
    position: 'relative',
  },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  chatOnline: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  chatTimeWrap: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chatTime: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Toast styles
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toastIcon: {
    fontSize: 20,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 20,
  },
});