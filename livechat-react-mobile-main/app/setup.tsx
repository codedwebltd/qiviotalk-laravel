import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
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
import Svg, { Circle, Path } from 'react-native-svg';
import authService from '../src/services/authService';

const CACHE_KEY = 'setup_data';

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const VerifiedBadgeIcon = () => (
  <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <Path d="M9 12L11 14L15 10M7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.07989 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.07989 20 7.2 20Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 4L12 14.01L9 11.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const AlertCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 8V12M12 16H12.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function SetupScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'warning'>('error');
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Override back button on preview mode - MUST be before any conditional returns
  useFocusEffect(
    useCallback(() => {
      if (isCompleted) {
        const onBackPress = () => {
          // Navigate to dashboard instead of going back
          router.replace('/dashboard' as any);
          return true; // Prevent default back behavior
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => backHandler.remove();
      }
    }, [isCompleted, router])
  );

  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'E-commerce',
    team_size: '2-5 employees',
    website: '',
    primary_goal: 'Improve customer support',
    widget_position: 'right',
    primary_color: '#128C7E',
    chat_icon: 'comments',
    welcome_message: 'Hi there! How can I help you today?'
  });

  const industries = [
    'E-commerce', 'SaaS', 'Healthcare', 'Finance', 'Education',
    'Real Estate', 'Travel', 'Retail', 'Other'
  ];

  const teamSizes = [
    'Just me', '2-5 employees', '6-20 employees',
    '21-100 employees', '100+ employees'
  ];

  const goals = [
    'Improve customer support',
    'Increase sales conversions',
    'Automate repetitive questions',
    'Collect user feedback',
    'Reduce support costs'
  ];

  const chatIcons = [
    { id: 'comments', name: 'Chat' },
    { id: 'headset', name: 'Support' },
    { id: 'comment-dots', name: 'Message' },
    { id: 'concierge-bell', name: 'Bell' },
    { id: 'user-circle', name: 'User' },
  ];

  useEffect(() => {
    // Load cached data immediately (no spinner)
    loadCachedData();

    // Then fetch fresh data in background
    loadSetupData();

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
  }, []);

  useEffect(() => {
    if (showToast) {
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
        setShowToast(false);
        setToastMessage('');
      });
    }
  }, [showToast]);

  const showToastMessage = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    toastAnim.setValue(0);
  };

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        setFormData(data.formData || formData);
        setCurrentStep(data.currentStep || 1);
        // DON'T set isCompleted from cache - always get fresh from server
        // setIsCompleted(data.isCompleted || false);
      }
    } catch (error) {
      console.error('Failed to load cached setup:', error);
    }
  };

  const loadSetupData = async (silent = false) => {
    if (!silent) {
      setRefreshing(true);
    }

    try {
      // Use getUserProfile for consistency - it updates AsyncStorage automatically
      const profileData = await authService.getUserProfile();

      console.log('🔍 Setup screen - Profile data:', profileData);
      console.log('🔍 Setup screen - Onboarding completed:', profileData?.onboarding_completed);

      if (profileData) {
        const completed = profileData.onboarding_completed;
        const result = profileData.user?.onboarding;

        console.log('🔍 Setup screen - Setting isCompleted to:', completed);

        if (result) {
          const data = {
            company_name: result.company_name || '',
            industry: result.industry || 'E-commerce',
            team_size: result.team_size || '2-5 employees',
            website: result.website || '',
            primary_goal: result.primary_goal || 'Improve customer support',
            widget_position: result.widget_position || 'right',
            primary_color: result.primary_color || '#128C7E',
            chat_icon: result.chat_icon || 'comments',
            welcome_message: result.welcome_message || 'Hi there! How can I help you today?'
          };

          setFormData(data);
          setIsCompleted(completed);

          // Determine current step if not completed
          if (!completed) {
            if (!result.company_name) setCurrentStep(1);
            else if (!result.website) setCurrentStep(2);
            else if (!result.primary_color) setCurrentStep(3);
            else setCurrentStep(4);
          }

          // Cache the data (but NOT the isCompleted status)
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            formData: data,
            currentStep: !completed ? (result.company_name ? (result.website ? (result.primary_color ? 4 : 3) : 2) : 1) : 4,
            // Don't cache isCompleted - always get from server
          }));
        }
      } else {
        console.log('❌ Setup screen - No profile data received');
      }
    } catch (error) {
      console.error('❌ Setup screen - Failed to load setup data:', error);
    } finally {
      setInitialLoading(false);
      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  const updateField = async (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: false });
    }

    // Update cache
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      formData: updated,
      currentStep,
      isCompleted
    }));
  };

  const saveCurrentStep = async () => {
    setSaveLoading(true);
    try {
      const stepMap = ['company', 'website', 'appearance', 'finish'];
      const result = await authService.updateOnboarding({
        ...formData,
        current_step: stepMap[currentStep - 1]
      });

      if (!result.success) {
        console.error('Failed to save setup:', result.message);
        showToastMessage(result.message || 'Failed to save progress', 'error');
      } else {
        showToastMessage('Progress saved successfully!', 'success');
      }
    } catch (error: any) {
      console.error('Error saving setup:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'An error occurred while saving';
      showToastMessage(errorMsg, 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNext = async () => {
    await saveCurrentStep();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const validateAllSteps = () => {
    const errors = {};
    let firstInvalidStep = null;

    // Step 1 validation
    if (!formData.company_name) {
      errors.company_name = true;
      if (!firstInvalidStep) firstInvalidStep = 1;
    }

    // Step 2 validation
    if (!formData.website || !formData.website.startsWith('https://')) {
      errors.website = true;
      if (!firstInvalidStep) firstInvalidStep = 2;
    }

    // Step 3 validation
    if (!formData.primary_color) {
      errors.primary_color = true;
      if (!firstInvalidStep) firstInvalidStep = 3;
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, firstInvalidStep };
  };

  const handleFinish = async () => {
    // Validate all fields first
    const { isValid, firstInvalidStep } = validateAllSteps();

    if (!isValid) {
      // Navigate to first step with errors
      setCurrentStep(firstInvalidStep);
      showToastMessage('Please complete all required fields before finishing', 'error');
      return;
    }

    setRefreshing(true);
    try {
      const result = await authService.updateOnboarding({
        ...formData,
        current_step: 'finish'
      });

      if (!result.success) {
        showToastMessage(result.message || 'Failed to complete setup', 'error');
        return;
      }

      await authService.setOnboardingComplete(true);
      setIsCompleted(true);

      // Update cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        formData,
        currentStep: 4,
        isCompleted: true
      }));

      showToastMessage('Setup completed successfully!', 'success');

      // Reload to show preview mode
      await loadSetupData(true);
    } catch (error: any) {
      console.error('Error completing setup:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'An error occurred while completing setup';
      showToastMessage(errorMsg, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSkip = async () => {
    setRefreshing(true);
    try {
      await authService.skipOnboarding();
      await AsyncStorage.removeItem(CACHE_KEY);
      router.replace('/dashboard' as any);
    } catch (error) {
      console.error('Error skipping setup:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.company_name && formData.industry && formData.team_size;
    } else if (currentStep === 2) {
      return formData.website && formData.website.startsWith('https://') && formData.primary_goal;
    } else if (currentStep === 3) {
      return formData.primary_color && formData.chat_icon;
    }
    return true;
  };

  // LOADING STATE - Wait for fresh server data before showing anything
  if (initialLoading) {
    console.log('🔄 Rendering: Loading state');
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <ShimmerBox width={40} height={40} style={{ borderRadius: 20 }} />
            <ShimmerBox width={120} height={20} style={{ marginLeft: 'auto', marginRight: 'auto' }} />
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Progress Bar Shimmer */}
        <View style={styles.progressContainer}>
          <ShimmerBox width="100%" height={6} style={{ borderRadius: 3, marginBottom: 8 }} />
          <ShimmerBox width="30%" height={12} style={{ alignSelf: 'center' }} />
        </View>

        {/* Form Shimmer */}
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.stepContainer}>
            {/* Step Header */}
            <View style={styles.stepHeader}>
              <ShimmerBox width={56} height={56} style={{ borderRadius: 28, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <ShimmerBox width="60%" height={20} style={{ marginBottom: 6 }} />
                <ShimmerBox width="80%" height={14} />
              </View>
            </View>

            <View style={styles.form}>
              {/* Field 1 */}
              <View style={styles.field}>
                <ShimmerBox width="35%" height={14} style={{ marginBottom: 8 }} />
                <ShimmerBox width="100%" height={52} style={{ borderRadius: 12 }} />
              </View>

              {/* Field 2 - Options */}
              <View style={styles.field}>
                <ShimmerBox width="25%" height={14} style={{ marginBottom: 8 }} />
                <View style={styles.pickerContainer}>
                  {[1, 2, 3, 4].map((i) => (
                    <ShimmerBox key={i} width="100%" height={52} style={{ marginBottom: 8, borderRadius: 12 }} />
                  ))}
                </View>
              </View>

              {/* Field 3 - Options */}
              <View style={styles.field}>
                <ShimmerBox width="30%" height={14} style={{ marginBottom: 8 }} />
                <View style={styles.pickerContainer}>
                  {[1, 2, 3].map((i) => (
                    <ShimmerBox key={i} width="100%" height={52} style={{ marginBottom: 8, borderRadius: 12 }} />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Button Shimmer */}
          <ShimmerBox width="100%" height={56} style={{ borderRadius: 14 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PREVIEW MODE - When setup is completed
  console.log('🔄 Rendering: isCompleted =', isCompleted);
  if (isCompleted) {
    console.log('✅ Rendering: Preview Mode (Setup Verified)');
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.replace('/dashboard' as any)} style={styles.backBtn}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Setup Overview</Text>
            <TouchableOpacity
              onPress={() => loadSetupData()}
              style={styles.refreshBtn}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93433 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Verified Badge */}
            <View style={styles.verifiedCard}>
              <VerifiedBadgeIcon />
              <Text style={styles.verifiedTitle}>Setup Verified</Text>
              <Text style={styles.verifiedDesc}>Your business profile is complete</Text>
            </View>

            {/* Company Info */}
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H21M19 21H14M5 21H3M5 21H10M10 21V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V21M10 21H14M9 8H10M9 12H10M14 8H15M14 12H15" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.previewHeaderText}>Company Information</Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Company Name</Text>
                <Text style={styles.previewValue}>{formData.company_name}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Industry</Text>
                <Text style={styles.previewValue}>{formData.industry}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Team Size</Text>
                <Text style={styles.previewValue}>{formData.team_size}</Text>
              </View>
            </View>

            {/* Website & Goals */}
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M3.6 9H20.4M3.6 15H20.4M12 3C14.5013 5.73835 15.9228 9.29203 16 13C15.9228 16.708 14.5013 20.2616 12 23M12 3C9.49872 5.73835 8.07725 9.29203 8 13C8.07725 16.708 9.49872 20.2616 12 23" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.previewHeaderText}>Website & Goals</Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Website</Text>
                <Text style={[styles.previewValue, styles.previewLink]}>{formData.website}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Primary Goal</Text>
                <Text style={styles.previewValue}>{formData.primary_goal}</Text>
              </View>
            </View>

            {/* Widget Appearance */}
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M7 21H17C18.1046 21 19 20.1046 19 19V9.41421C19 9.149 18.8946 8.89464 18.7071 8.70711L13.2929 3.29289C13.1054 3.10536 12.851 3 12.5858 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M9 13H15M9 17H15M9 9H10" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.previewHeaderText}>Widget Appearance</Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Primary Color</Text>
                <View style={styles.colorRow}>
                  <View style={[styles.colorDot, { backgroundColor: formData.primary_color }]} />
                  <Text style={styles.previewValueColor} numberOfLines={1}>{formData.primary_color}</Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Position</Text>
                <Text style={styles.previewValue}>{formData.widget_position === 'right' ? 'Bottom Right' : 'Bottom Left'}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Chat Icon</Text>
                <Text style={styles.previewValue}>{chatIcons.find(i => i.id === formData.chat_icon)?.name || 'Chat'}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Welcome Message</Text>
                <Text style={styles.previewValue}>{formData.welcome_message}</Text>
              </View>
            </View>

            {/* Back to Dashboard Button */}
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={() => router.replace('/dashboard' as any)}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H10M19 10L21 12M19 10V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H14M10 22C10.5304 22 11.0391 21.7893 11.4142 21.4142C11.7893 21.0391 12 20.5304 12 20V16C12 15.4696 12.2107 14.9609 12.5858 14.5858C12.9609 14.2107 13.4696 14 14 14C14.5304 14 15.0391 14.2107 15.4142 14.5858C15.7893 14.9609 16 15.4696 16 16V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22M10 22H14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </Animated.View>
        </ScrollView>

        {/* Toast Notification */}
        {showToast && (
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
            {toastType === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </SafeAreaView>
    );
  }

  // WIZARD MODE - When setup is not completed
  console.log('📝 Rendering: Wizard Mode');
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Setup</Text>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${(currentStep / 4) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 4</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Step 1: Company */}
            {currentStep === 1 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <Path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H21M19 21H14M5 21H3M5 21H10M10 21V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V21M10 21H14M9 8H10M9 12H10M14 8H15M14 12H15" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                  <View style={styles.stepHeaderText}>
                    <Text style={styles.stepTitle}>Company Information</Text>
                    <Text style={styles.stepDesc}>Tell us about your business</Text>
                  </View>
                </View>

                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Company Name *</Text>
                    <TextInput
                      style={[styles.input, validationErrors.company_name && styles.inputError]}
                      value={formData.company_name}
                      onChangeText={(v) => updateField('company_name', v)}
                      placeholder="Your Company Name"
                      placeholderTextColor="#9CA3AF"
                    />
                    {validationErrors.company_name && (
                      <Text style={styles.errorText}>Company name is required</Text>
                    )}
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Industry *</Text>
                    <View style={styles.pickerContainer}>
                      {industries.map((industry) => (
                        <TouchableOpacity
                          key={industry}
                          style={[
                            styles.option,
                            formData.industry === industry && styles.optionActive
                          ]}
                          onPress={() => updateField('industry', industry)}
                        >
                          <Text style={[
                            styles.optionText,
                            formData.industry === industry && styles.optionTextActive
                          ]}>
                            {industry}
                          </Text>
                          {formData.industry === industry && <CheckIcon />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Team Size *</Text>
                    <View style={styles.pickerContainer}>
                      {teamSizes.map((size) => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.option,
                            formData.team_size === size && styles.optionActive
                          ]}
                          onPress={() => updateField('team_size', size)}
                        >
                          <Text style={[
                            styles.optionText,
                            formData.team_size === size && styles.optionTextActive
                          ]}>
                            {size}
                          </Text>
                          {formData.team_size === size && <CheckIcon />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Step 2: Website & Goals */}
            {currentStep === 2 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <Path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M3.6 9H20.4M3.6 15H20.4M12 3C14.5013 5.73835 15.9228 9.29203 16 13C15.9228 16.708 14.5013 20.2616 12 23M12 3C9.49872 5.73835 8.07725 9.29203 8 13C8.07725 16.708 9.49872 20.2616 12 23" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                  <View style={styles.stepHeaderText}>
                    <Text style={styles.stepTitle}>Website & Goals</Text>
                    <Text style={styles.stepDesc}>Where will you use LiveChat?</Text>
                  </View>
                </View>

                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Website URL *</Text>
                    <TextInput
                      style={[styles.input, validationErrors.website && styles.inputError]}
                      value={formData.website}
                      onChangeText={(v) => updateField('website', v)}
                      placeholder="https://example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                    {validationErrors.website ? (
                      <Text style={styles.errorText}>Website URL is required and must start with https://</Text>
                    ) : (
                      <Text style={styles.hint}>Must start with https://</Text>
                    )}
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Primary Goal *</Text>
                    <View style={styles.pickerContainer}>
                      {goals.map((goal) => (
                        <TouchableOpacity
                          key={goal}
                          style={[
                            styles.option,
                            formData.primary_goal === goal && styles.optionActive
                          ]}
                          onPress={() => updateField('primary_goal', goal)}
                        >
                          <Text style={[
                            styles.optionText,
                            formData.primary_goal === goal && styles.optionTextActive
                          ]}>
                            {goal}
                          </Text>
                          {formData.primary_goal === goal && <CheckIcon />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>💡</Text>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>Why this matters</Text>
                      <Text style={styles.infoText}>
                        Understanding your goals helps us configure your dashboard for optimal results.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Step 3: Appearance */}
            {currentStep === 3 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <Path d="M7 21H17C18.1046 21 19 20.1046 19 19V9.41421C19 9.149 18.8946 8.89464 18.7071 8.70711L13.2929 3.29289C13.1054 3.10536 12.851 3 12.5858 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M9 13H15M9 17H15M9 9H10" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                  <View style={styles.stepHeaderText}>
                    <Text style={styles.stepTitle}>Widget Appearance</Text>
                    <Text style={styles.stepDesc}>Customize how your chat looks</Text>
                  </View>
                </View>

                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Primary Color *</Text>
                    <View style={styles.colorContainer}>
                      <View style={[styles.colorPreview, { backgroundColor: formData.primary_color }]} />
                      <TextInput
                        style={[styles.colorInputFull, validationErrors.primary_color && styles.inputError]}
                        value={formData.primary_color}
                        onChangeText={(v) => updateField('primary_color', v)}
                        placeholder="#128C7E"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                      />
                    </View>
                    {validationErrors.primary_color && (
                      <Text style={styles.errorText}>Primary color is required</Text>
                    )}
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Widget Position</Text>
                    <View style={styles.positionContainer}>
                      <TouchableOpacity
                        style={[
                          styles.positionOption,
                          formData.widget_position === 'right' && styles.positionActive
                        ]}
                        onPress={() => updateField('widget_position', 'right')}
                      >
                        <View style={styles.positionPreview}>
                          <View style={[styles.positionBubble, { position: 'absolute', right: 8, bottom: 8 }]} />
                        </View>
                        <Text style={[
                          styles.positionLabel,
                          formData.widget_position === 'right' && styles.positionLabelActive
                        ]}>Bottom Right</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.positionOption,
                          formData.widget_position === 'left' && styles.positionActive
                        ]}
                        onPress={() => updateField('widget_position', 'left')}
                      >
                        <View style={styles.positionPreview}>
                          <View style={[styles.positionBubble, { position: 'absolute', left: 8, bottom: 8 }]} />
                        </View>
                        <Text style={[
                          styles.positionLabel,
                          formData.widget_position === 'left' && styles.positionLabelActive
                        ]}>Bottom Left</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Chat Icon</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.iconScrollContent}
                      style={styles.iconScrollContainer}
                    >
                      {chatIcons.map((icon) => (
                        <TouchableOpacity
                          key={icon.id}
                          style={[
                            styles.iconOption,
                            formData.chat_icon === icon.id && styles.iconActive
                          ]}
                          onPress={() => updateField('chat_icon', icon.id)}
                        >
                          <View style={[styles.iconCircle, { backgroundColor: formData.primary_color }]}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <Path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </Svg>
                          </View>
                          <Text style={[
                            styles.iconLabel,
                            formData.chat_icon === icon.id && styles.iconLabelActive
                          ]}>{icon.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Welcome Message</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.welcome_message}
                      onChangeText={(v) => updateField('welcome_message', v)}
                      placeholder="Hi there! How can I help you today?"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Step 4: Finish */}
            {currentStep === 4 && (
              <View style={styles.finishContainer}>
                <View style={styles.successIcon}>
                  <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
                    <Path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>

                <Text style={styles.finishTitle}>Setup Complete!</Text>
                <Text style={styles.finishDesc}>
                  You're all set to start providing amazing customer support with LiveChat!
                </Text>

                <View style={styles.nextStepsCard}>
                  <Text style={styles.nextStepsTitle}>✨ Next Steps</Text>

                  <View style={styles.nextStep}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" fill="#10B981" stroke="#10B981" strokeWidth="2"/>
                      <Path d="M8 12L11 15L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                    <Text style={styles.nextStepText}>Set up your LiveChat account</Text>
                  </View>

                  <View style={styles.nextStep}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" fill="#10B981" stroke="#10B981" strokeWidth="2"/>
                      <Path d="M8 12L11 15L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                    <Text style={styles.nextStepText}>Configure widget appearance</Text>
                  </View>

                  <View style={styles.nextStep}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="2"/>
                      <Text x="12" y="16" textAnchor="middle" fontSize="14" fill="#9CA3AF">→</Text>
                    </Svg>
                    <Text style={[styles.nextStepText, styles.nextStepPending]}>Install widget on website</Text>
                  </View>

                  <View style={styles.nextStep}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="2"/>
                      <Text x="12" y="16" textAnchor="middle" fontSize="14" fill="#9CA3AF">→</Text>
                    </Svg>
                    <Text style={[styles.nextStepText, styles.nextStepPending]}>Set up AI agent automation</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          {currentStep < 4 ? (
            <View style={styles.footerRow}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep(currentStep - 1)}
                  disabled={saveLoading}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  currentStep === 1 && styles.nextButtonFull,
                  (!isStepValid() || saveLoading) && styles.buttonDisabled
                ]}
                onPress={handleNext}
                disabled={!isStepValid() || saveLoading}
              >
                {saveLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.finishButton, refreshing && styles.buttonDisabled]}
              onPress={handleFinish}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.finishButtonText}>Complete Setup</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
      {showToast && (
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
          {toastType === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
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
    marginBottom: 20,
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
  skipBtn: {
    width: 60,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.8,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#128C7E',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Wizard Mode Styles
  stepContainer: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    gap: 20,
    width: '100%',
  },
  field: {
    marginBottom: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 90,
    maxHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  pickerContainer: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionActive: {
    borderColor: '#128C7E',
    backgroundColor: '#E8F5F3',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#128C7E',
    fontWeight: '600',
  },
  colorContainer: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  colorInputFull: {
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
  positionContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  positionOption: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  positionActive: {
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
    shadowColor: '#128C7E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  positionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  positionLabelActive: {
    color: '#128C7E',
  },
  iconScrollContainer: {
    maxHeight: 120,
  },
  iconScrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  iconOption: {
    width: 100,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconActive: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  iconLabelActive: {
    color: '#128C7E',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 26,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
  },
  finishContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 28,
  },
  finishTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  finishDesc: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  nextStepText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  nextStepPending: {
    color: '#9CA3AF',
  },

  // Preview Mode Styles
  verifiedCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  verifiedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  verifiedDesc: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  previewCard: {
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
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  previewHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  previewValueColor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
  },
  previewLink: {
    color: '#128C7E',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  colorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#128C7E',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: '#128C7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Footer
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
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
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  finishButton: {
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
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Toast styles
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
});
