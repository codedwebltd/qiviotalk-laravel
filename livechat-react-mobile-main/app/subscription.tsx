import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Svg, { Path } from 'react-native-svg';
import authService from '../src/services/authService';

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const StarIcon = ({ color = "#F59E0B", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill={color} stroke={color} strokeWidth="1"/>
  </Svg>
);

const CheckIcon = ({ color = "#10B981" }: { color?: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 4L12 14.01L9 11.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const AlertCircleIcon = ({ color = "#F59E0B", size = 64 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 8V12M12 16H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Shimmer component matching AI training style
const ShimmerBox = ({ width = '100%', height = 20, style = {} }: any) => {
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

interface Plan {
  id: number;
  name: string;
  price: string;
  duration: string;
  duration_days: number;
  is_free_tier: boolean;
  features: string[];
  color: string;
  popular?: boolean;
}

type PaymentMethod = 'paypal' | 'card' | 'crypto' | null;

// PlanCard Component with countdown and renew button
const PlanCard = ({
  plan,
  isSelected,
  isCurrent,
  onSelect,
  onRenew,
  membershipExpiresAt,
}: {
  plan: Plan;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: (plan: Plan) => void;
  onRenew: (plan: Plan) => void;
  membershipExpiresAt: string | null;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [hoursRemaining, setHoursRemaining] = useState<number>(0);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Real-time countdown for active subscription
  useEffect(() => {
    if (!isCurrent || !membershipExpiresAt) return;

    const initCountdown = async () => {
      const cacheKey = `membership_expiry_cache`;
      const cached = await AsyncStorage.getItem(cacheKey);

      // Compare cached vs fresh API value
      if (cached !== membershipExpiresAt) {
        // API value changed, update cache
        await AsyncStorage.setItem(cacheKey, membershipExpiresAt);
        console.log('Updated cached membership expiry:', membershipExpiresAt);
      }

      // Countdown from membership_expires_at
      const updateCountdown = () => {
        const expiryDateStr = membershipExpiresAt.replace(' ', 'T');
        const expiryDate = new Date(expiryDateStr);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();

        if (diffTime <= 0) {
          setDaysRemaining(0);
          setHoursRemaining(0);
          setMinutesRemaining(0);
          setSecondsRemaining(0);
          return;
        }

        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

        setDaysRemaining(days);
        setHoursRemaining(hours);
        setMinutesRemaining(minutes);
        setSecondsRemaining(seconds);
      };

      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);

      return () => clearInterval(timer);
    };

    initCountdown();
  }, [isCurrent, membershipExpiresAt]);

  const handlePress = () => {
    if (!isCurrent) {
      onSelect(plan);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          isCurrent && styles.planCardCurrent,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        {plan.is_free_tier && !plan.popular && (
          <View style={styles.freeTierBadge}>
            <Text style={styles.freeTierText}>FREE TIER</Text>
          </View>
        )}

        {isCurrent && (
          <View style={styles.currentBadge}>
            <CheckIcon color="#fff" />
            <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planIconContainer}>
            <StarIcon color={plan.color} size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>${plan.price}</Text>
              <Text style={styles.planDuration}>/{plan.duration_days} days</Text>
            </View>
          </View>
          {isSelected && !isCurrent && (
            <View style={styles.selectedCheck}>
              <CheckIcon color="#10B981" />
            </View>
          )}
        </View>

        {/* Countdown timer for active subscription */}
        {isCurrent && daysRemaining !== null && (
          <View style={styles.countdownContainer}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.countdownText}>
              {daysRemaining}d {hoursRemaining}h {minutesRemaining}m {secondsRemaining}s remaining
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.featuresContainer}
          contentContainerStyle={styles.featuresContent}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <CheckIcon color={plan.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Renew button for all plans */}
        <TouchableOpacity
          style={[
            styles.renewBtn,
            isCurrent && styles.renewBtnCurrent,
            plan.name.toLowerCase() === 'free' && !isCurrent && styles.renewBtnDowngrade,
          ]}
          onPress={() => onRenew(plan)}
          activeOpacity={0.8}
        >
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            {plan.name.toLowerCase() === 'free' && !isCurrent ? (
              <Path d="M19 14L12 21M12 21L5 14M12 21V3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <Path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </Svg>
          <Text style={styles.renewBtnText}>
            {isCurrent
              ? 'Renew Plan'
              : plan.name.toLowerCase() === 'free'
                ? 'Downgrade to Free'
                : 'Switch & Renew'
            }
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentMembership, setCurrentMembership] = useState<string>('free');
  const [membershipExpiresAt, setMembershipExpiresAt] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ plan: Plan; action: string } | null>(null);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [cryptoPaymentUrl, setCryptoPaymentUrl] = useState<string | null>(null);
  const [cryptoOrderId, setCryptoOrderId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cryptoSlideAnim = useRef(new Animated.Value(0)).current;
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSubscriptions();
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const profileData = await authService.getUserProfile();
      if (profileData?.user?.membership_type) {
        setCurrentMembership(profileData.user.membership_type);
      }
      if (profileData?.user?.membership_expires_at) {
        setMembershipExpiresAt(profileData.user.membership_expires_at);
      }

      const token = await authService.getToken();
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const API_URL = authService.getApiUrl();
      const response = await fetch(`${API_URL}/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const fallbackPlans = [
        {
          id: 1,
          name: 'Free',
          price: '0',
          duration: '30 Days',
          duration_days: 30,
          is_free_tier: true,
          features: ['Up to 100 messages/month', 'Basic chat features', 'Email support'],
          color: '#64748B',
        },
        {
          id: 2,
          name: 'Premium',
          price: '9.99',
          duration: '30 Days',
          duration_days: 30,
          is_free_tier: false,
          features: ['Unlimited messages', 'AI bot', 'Priority support', 'Analytics dashboard'],
          color: '#F59E0B',
          popular: true,
        },
        {
          id: 3,
          name: 'Enterprise',
          price: '49.99',
          duration: '30 Days',
          duration_days: 30,
          is_free_tier: false,
          features: ['Everything in Premium', 'Custom branding', 'Dedicated support', 'API access', 'Advanced analytics'],
          color: '#8B5CF6',
        },
      ];

      if (response.ok) {
        const data = await response.json();
        if (data.subscriptions && data.subscriptions.length > 0) {
          setPlans(data.subscriptions);
        } else {
          setPlans(fallbackPlans);
        }
      } else {
        setPlans(fallbackPlans);
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (plan: Plan) => {
    const isCurrent = currentMembership.toLowerCase() === plan.name.toLowerCase();
    const isPaidPlan = parseFloat(plan.price) > 0;

    // Free plan special handling - always show auto-renew message
    if (plan.is_free_tier) {
      showToast('Free plan will automatically renew! We will notify you when it does.', 'success');
      return;
    }

    // Determine action type
    let action = 'upgrade';
    if (isCurrent) {
      action = 'renew';
    } else if (plan.name.toLowerCase() === 'free') {
      action = 'downgrade';
    }

    // Show confirmation modal
    setConfirmAction({ plan, action });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    setShowConfirmModal(false);
    if (!confirmAction) return;

    const { plan, action } = confirmAction;
    const isPaidPlan = parseFloat(plan.price) > 0;
    const isCurrent = currentMembership.toLowerCase() === plan.name.toLowerCase();

    // Show payment modal for NEW paid subscriptions (not renewals, not downgrades)
    if (isPaidPlan && !isCurrent && plan.name.toLowerCase() !== 'free') {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
      return;
    }

    // Process: renewals, downgrades
    processSubscription(plan);
  };

  const handleCryptoPayment = async (plan: Plan) => {
    try {
      setShowPaymentModal(false);
      setRenewing(true);

      const token = await authService.getToken();
      if (!token) {
        showToast('Authentication required', 'error');
        setRenewing(false);
        return;
      }

      const API_URL = authService.getApiUrl();
      const response = await fetch(`${API_URL}/crypto/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(plan.price),
          subscription_id: plan.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.payment_url) {
        setCryptoPaymentUrl(data.data.payment_url);
        setCryptoOrderId(data.data.order_id);
        setRenewing(false);
        setShowCryptoModal(true);

        // Animate the modal in
        Animated.spring(cryptoSlideAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();

        // Start polling for payment status
        startPaymentPolling(data.data.order_id);
      } else {
        setRenewing(false);
        showToast(data.message || 'Failed to create payment', 'error');
      }
    } catch (error) {
      console.error('Crypto payment error:', error);
      setRenewing(false);
      showToast('Failed to initiate payment', 'error');
    }
  };

  const startPaymentPolling = (orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const token = await authService.getToken();
        if (!token) return;

        const API_URL = authService.getApiUrl();
        const response = await fetch(`${API_URL}/crypto/payment/status`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_id: orderId }),
        });

        const data = await response.json();

        if (data.success && data.data?.status === 'paid') {
          // Payment successful!
          if (pollingInterval) clearInterval(pollingInterval);
          closeCryptoModal();
          showToast('Payment successful! Your subscription is now active.', 'success');

          // Refresh data
          setTimeout(() => {
            authService.getUserProfile();
            loadSubscriptions();
          }, 1000);
        } else if (data.data?.status === 'failed' || data.data?.status === 'cancelled' || data.data?.status === 'expired') {
          // Payment failed
          if (pollingInterval) clearInterval(pollingInterval);
          closeCryptoModal();
          showToast('Payment was not completed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };

  const closeCryptoModal = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    Animated.timing(cryptoSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowCryptoModal(false);
      setCryptoPaymentUrl(null);
      setCryptoOrderId(null);
    });
  };

  const handleOtherPaymentMethod = (method: 'paypal' | 'card') => {
    const methodName = method === 'paypal' ? 'PayPal' : 'Card';
    showToast(`${methodName} payment is coming soon. This payment method is currently under maintenance.`, 'error');
    // Keep modal open so user can try another method
  };

  const processSubscription = async (plan: Plan, paymentMethod?: PaymentMethod) => {
    const isCurrent = currentMembership.toLowerCase() === plan.name.toLowerCase();

    // Determine action text
    let actionText = 'upgraded to';
    if (isCurrent) {
      actionText = 'renewed';
    } else if (plan.name.toLowerCase() === 'free') {
      actionText = 'downgraded to';
    }

    setRenewing(true);
    setShowPaymentModal(false);

    try {
      const token = await authService.getToken();
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again to continue');
        setRenewing(false);
        return;
      }

      // Simulate payment gateway (as requested)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const API_URL = authService.getApiUrl();
      const response = await fetch(`${API_URL}/subscription/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: plan.id,
          payment_reference: `SIMULATED_${Date.now()}`,
          amount: parseFloat(plan.price),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Show toast with refund info if downgrading
        if (data.refund && data.refund.amount > 0) {
          showToast(`${data.refund.message} 💰`, 'success');
        } else {
          showToast(`Successfully ${actionText} ${plan.name} plan! 🎉`, 'success');
        }

        // Refresh data
        setTimeout(() => {
          authService.getUserProfile();
          loadSubscriptions();
        }, 1000);
      } else {
        const error = await response.json();
        Alert.alert('Failed', error.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setRenewing(false);
    }
  };

  const renderPlan = ({ item: plan }: { item: Plan }) => {
    return (
      <PlanCard
        plan={plan}
        isSelected={selectedPlan?.id === plan.id}
        isCurrent={currentMembership.toLowerCase() === plan.name.toLowerCase()}
        onSelect={setSelectedPlan}
        onRenew={handleRenew}
        membershipExpiresAt={membershipExpiresAt}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header with SafeArea for top */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0A2540' }}>
        <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <View style={{ width: 40 }} />
        </View>

        {/* Current Plan Info */}
        <View style={styles.currentPlanContainer}>
        <View style={styles.currentPlanBadge}>
          <StarIcon color={getPlanColor(currentMembership)} size={18} />
          <Text style={styles.currentPlanText}>
            Current: <Text style={styles.currentPlanName}>{currentMembership.charAt(0).toUpperCase() + currentMembership.slice(1)}</Text>
          </Text>
        </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <ScrollView
          style={styles.shimmerContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.planCard}>
              <ShimmerBox width="50%" height={18} style={{ marginBottom: 12 }} />
              <ShimmerBox width="100%" height={120} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={plans}
            renderItem={renderPlan}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            }
          />
        </Animated.View>
      )}

      {/* Toast */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            toastType === 'success' ? styles.toastSuccess : styles.toastError,
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0]
                })
              }]
            }
          ]}
        >
          {toastType === 'success' ? <CheckCircleIcon /> : null}
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && selectedPlan && (
        <View style={styles.loadingOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPaymentModal(false)}
          />
          <View style={styles.paymentModal}>
            <Text style={styles.paymentTitle}>Select Payment Method</Text>
            <Text style={styles.paymentSubtitle}>
              {selectedPlan.name} - {selectedPlan.is_free_tier ? 'FREE' : `$${parseFloat(selectedPlan.price).toFixed(2)}`}/{selectedPlan.duration_days} days
            </Text>

            <TouchableOpacity
              style={[styles.paymentBtn, styles.paymentBtnCrypto]}
              onPress={() => handleCryptoPayment(selectedPlan)}
            >
              <Text style={styles.paymentBtnText}>₿ Pay with Crypto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentBtn, styles.paymentBtnPaypal, styles.paymentBtnDisabled]}
              onPress={() => handleOtherPaymentMethod('paypal')}
            >
              <Text style={styles.paymentBtnText}>💳 Pay with PayPal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentBtn, styles.paymentBtnCard, styles.paymentBtnDisabled]}
              onPress={() => handleOtherPaymentMethod('card')}
            >
              <Text style={styles.paymentBtnText}>💳 Pay with Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentCancelBtn}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.paymentCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <View style={styles.loadingOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowConfirmModal(false)}
          />
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconContainer}>
              <AlertCircleIcon color="#F59E0B" size={64} />
            </View>

            <Text style={styles.confirmTitle}>Confirm Subscription {confirmAction.action === 'renew' ? 'Renewal' : confirmAction.action === 'downgrade' ? 'Downgrade' : 'Upgrade'}</Text>

            <Text style={styles.confirmMessage}>
              {confirmAction.action === 'renew'
                ? `You are about to renew your ${confirmAction.plan.name} plan${confirmAction.plan.is_free_tier ? '' : ` for $${parseFloat(confirmAction.plan.price).toFixed(2)}`}. Your subscription will be extended for another ${confirmAction.plan.duration_days} days.`
                : confirmAction.action === 'downgrade'
                ? `You are about to downgrade to the ${confirmAction.plan.name} plan. You may receive a refund for the unused portion of your current subscription. This change will take effect immediately.`
                : `You are about to upgrade to the ${confirmAction.plan.name} plan${confirmAction.plan.is_free_tier ? '' : ` for $${parseFloat(confirmAction.plan.price).toFixed(2)}`}/${confirmAction.plan.duration_days} days. You'll get access to all premium features immediately.`
              }
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmAction}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Crypto Payment Modal - Half screen that slides from bottom */}
      <Modal
        visible={showCryptoModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeCryptoModal}
      >
        <View style={styles.cryptoOverlay}>
          <TouchableOpacity
            style={styles.cryptoBackdrop}
            activeOpacity={1}
            onPress={closeCryptoModal}
          />
          <Animated.View
            style={[
              styles.cryptoModal,
              {
                transform: [{
                  translateY: cryptoSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.cryptoHeader}>
              <View style={styles.cryptoHandle} />
              <View style={styles.cryptoHeaderContent}>
                <Text style={styles.cryptoTitle}>Complete Payment</Text>
                <TouchableOpacity onPress={closeCryptoModal} style={styles.cryptoCloseBtn}>
                  <CloseIcon />
                </TouchableOpacity>
              </View>
              <Text style={styles.cryptoSubtitle}>Waiting for payment confirmation...</Text>
            </View>

            {cryptoPaymentUrl && (
              <WebView
                source={{ uri: cryptoPaymentUrl }}
                style={styles.cryptoWebView}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text style={styles.webViewLoadingText}>Loading payment page...</Text>
                  </View>
                )}
              />
            )}

            <SafeAreaView edges={['bottom']} style={styles.cryptoFooterSafeArea}>
              <View style={styles.cryptoFooter}>
                <View style={styles.cryptoInfoBox}>
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M12 16V12M12 8H12.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                  <Text style={styles.cryptoInfoText}>Payment will be verified automatically. Do not close this window.</Text>
                </View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>

      {/* Loading overlay for renewals */}
      {renewing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Processing payment...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getPlanColor = (planName: string) => {
  if (planName.toLowerCase() === 'premium') return '#F59E0B';
  if (planName.toLowerCase() === 'enterprise') return '#8B5CF6';
  return '#64748B';
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'android' ? 15 : 0,
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
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
  },
  currentPlanContainer: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  currentPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  currentPlanText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  currentPlanName: {
    fontWeight: '700',
    color: '#fff',
  },
  shimmerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  planCardCurrent: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  freeTierBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  freeTierText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  selectedCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    fontVariant: ['tabular-nums'],
  },
  featuresContainer: {
    marginBottom: 16,
    maxHeight: 180,
    flexGrow: 0,
  },
  featuresContent: {
    paddingRight: 4,
    flexGrow: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  renewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  renewBtnCurrent: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
  },
  renewBtnDowngrade: {
    backgroundColor: '#6B7280',
    shadowColor: '#6B7280',
  },
  renewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  toastSuccess: {
    backgroundColor: '#10B981',
  },
  toastError: {
    backgroundColor: '#EF4444',
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  paymentModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 300,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  paymentBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentBtnPaypal: {
    backgroundColor: '#0070BA',
  },
  paymentBtnCard: {
    backgroundColor: '#10B981',
  },
  paymentBtnCrypto: {
    backgroundColor: '#F59E0B',
  },
  paymentBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  paymentCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  paymentCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  paymentBtnDisabled: {
    opacity: 0.5,
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    maxWidth: 400,
  },
  confirmIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cryptoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  cryptoBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cryptoModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  cryptoHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cryptoHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  cryptoHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cryptoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  cryptoCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cryptoWebView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 16,
  },
  webViewLoadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  cryptoFooterSafeArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cryptoFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cryptoInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  cryptoInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
    lineHeight: 18,
  },
});
