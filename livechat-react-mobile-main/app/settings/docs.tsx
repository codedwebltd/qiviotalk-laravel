import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChevronDownIcon = ({ color = "#6B7280" }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const steps = [
  {
    id: 1,
    title: 'Create Your Account',
    icon: 'user',
    description: 'Sign up with your email and create a secure password',
    details: 'Visit our website and click "Sign Up". Provide your email address and create a strong password. You\'ll receive a confirmation email to verify your account.',
    tip: { emoji: '✨', text: 'Use a business email for better organization' },
    color: '#3B82F6',
  },
  {
    id: 2,
    title: 'Sign In to Dashboard',
    icon: 'login',
    description: 'Access your account and start the setup process',
    details: 'After verifying your email, sign in to your LiveChat account using your credentials. This will automatically take you to the onboarding wizard.',
    color: '#8B5CF6',
  },
  {
    id: 3,
    title: 'Complete Business Setup',
    icon: 'settings',
    description: '4-step wizard to configure your LiveChat',
    details: 'Complete the onboarding wizard with your company information, website details, and widget appearance preferences.',
    subSteps: [
      'Company Information - Name, industry, team size',
      'Website & Goals - URL and primary objectives',
      'Widget Appearance - Colors, position, and icon',
      'Review & Finish - Complete your configuration',
    ],
    action: { label: 'Open Setup', route: '/setup' },
    color: '#10B981',
  },
  {
    id: 4,
    title: 'Copy Widget Code',
    icon: 'code',
    description: 'Get your unique widget installation code',
    details: 'Navigate to the Widget page and copy your unique widget code with a single tap.',
    action: { label: 'View Widget', route: '/widget' },
    color: '#F59E0B',
  },
  {
    id: 5,
    title: 'Install on Website',
    icon: 'website',
    description: 'Add the code before closing </body> tag',
    details: 'Paste the widget code into your website\'s HTML, just before the closing </body> tag. This ensures optimal loading performance.',
    warning: { emoji: '⚠️', text: 'Must be placed before </body> tag, not in <head>' },
    code: `<!-- Add before </body> tag -->
<script src="...widget-xxx.js" async></script>
</body>`,
    color: '#EF4444',
  },
  {
    id: 6,
    title: 'Refresh Your Page',
    icon: 'refresh',
    description: 'See your widget appear instantly',
    details: 'After adding the code, refresh your website. The chat widget will appear in your configured position.',
    tip: { emoji: '💡', text: 'Use Ctrl+Shift+R (Cmd+Shift+R on Mac) for hard refresh' },
    color: '#06B6D4',
  },
  {
    id: 7,
    title: 'Auto Verification',
    icon: 'heartbeat',
    description: 'System verifies installation automatically',
    details: 'Your website sends heartbeat signals to our servers, verifying proper installation. This takes 30-60 seconds.',
    color: '#EC4899',
  },
  {
    id: 8,
    title: 'Widget Verified',
    icon: 'check',
    description: 'Green badge confirms your widget is active',
    details: 'Once verified, the mobile app marks your widget as "Active" with a green verification badge.',
    color: '#10B981',
  },
  {
    id: 9,
    title: 'Receive Live Chats',
    icon: 'chat',
    description: 'Start engaging with customers instantly',
    details: 'You\'re all set! Receive instant notifications when visitors start conversations.',
    features: [
      'Instant push notifications',
      'Real-time messaging',
      '24/7 customer engagement',
    ],
    color: '#8B5CF6',
  },
];

const StepIcon = ({ icon, color }: { icon: string; color: string }) => {
  const iconProps = { stroke: color, strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  const icons = {
    user: <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" {...iconProps} />,
    login: <Path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" {...iconProps} />,
    settings: <><Circle cx="12" cy="12" r="3" {...iconProps} /><Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" {...iconProps} /></>,
    code: <Path d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8" {...iconProps} />,
    website: <><Path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" {...iconProps} /><Path d="M3.6 9H20.4M3.6 15H20.4M12 3C14.5013 5.73835 15.9228 9.29203 16 13C15.9228 16.708 14.5013 20.2616 12 23M12 3C9.49872 5.73835 8.07725 9.29203 8 13C8.07725 16.708 9.49872 20.2616 12 23" {...iconProps} /></>,
    refresh: <Path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93433 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" {...iconProps} />,
    heartbeat: <Path d="M22 12H18L15 21L9 3L6 12H2" {...iconProps} />,
    check: <><Circle cx="12" cy="12" r="10" {...iconProps} /><Path d="M8 12L11 15L16 9" {...iconProps} /></>,
    chat: <Path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" {...iconProps} />,
  };

  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {icons[icon] || icons.user}
    </Svg>
  );
};

const StepCard = ({ step, index, isExpanded, onToggle, router }) => {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        useNativeDriver: false,
        friction: 8,
      }),
    ]).start();
  }, [isExpanded]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onToggle}
      style={[styles.stepCard, { borderLeftColor: step.color, borderLeftWidth: 4 }]}
    >
      {/* Step Header */}
      <View style={styles.stepCardHeader}>
        <View style={styles.stepCardLeft}>
          <View style={[styles.stepIconCircle, { backgroundColor: `${step.color}15` }]}>
            <StepIcon icon={step.icon} color={step.color} />
          </View>
          <View style={styles.stepCardHeaderText}>
            <View style={styles.stepNumberRow}>
              <Text style={[styles.stepNumberBadge, { backgroundColor: step.color }]}>
                {step.id}
              </Text>
              <Text style={styles.stepCardTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepCardDescription}>{step.description}</Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDownIcon color={step.color} />
        </Animated.View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View style={[styles.stepCardContent, { opacity: heightAnim }]}>
          <View style={styles.divider} />

          <Text style={styles.stepDetails}>{step.details}</Text>

          {step.subSteps && (
            <View style={styles.subStepsContainer}>
              {step.subSteps.map((subStep, idx) => (
                <View key={idx} style={styles.subStepItem}>
                  <View style={[styles.subStepDot, { backgroundColor: step.color }]} />
                  <Text style={styles.subStepText}>{subStep}</Text>
                </View>
              ))}
            </View>
          )}

          {step.code && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{step.code}</Text>
            </View>
          )}

          {step.features && (
            <View style={styles.featuresContainer}>
              {step.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Text style={[styles.featureCheck, { color: step.color }]}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {step.tip && (
            <View style={styles.tipBox}>
              <Text style={styles.tipEmoji}>{step.tip.emoji}</Text>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Tip: </Text>
                {step.tip.text}
              </Text>
            </View>
          )}

          {step.warning && (
            <View style={styles.warningBox}>
              <Text style={styles.warningEmoji}>{step.warning.emoji}</Text>
              <Text style={styles.warningText}>
                <Text style={styles.warningBold}>Important: </Text>
                {step.warning.text}
              </Text>
            </View>
          )}

          {step.action && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: step.color }]}
              onPress={() => router.push(step.action.route)}
            >
              <Text style={styles.actionButtonText}>{step.action.label}</Text>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

export default function DocsScreen() {
  const router = useRouter();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
  }, []);

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const completedSteps = 0;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0A2540', '#1E3A5F']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Installation Guide</Text>
            <Text style={styles.headerSubtitle}>9 simple steps to go live</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>
            {completedSteps} of {steps.length} steps completed
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#128C7E', '#0D6D61']}
              style={styles.heroGradient}
            >
              <Svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.heroTitle}>Get Live in Minutes</Text>
              <Text style={styles.heroDesc}>
                Follow these interactive steps to install LiveChat on your website
              </Text>
            </LinearGradient>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isExpanded={expandedSteps.has(step.id)}
                onToggle={() => toggleStep(step.id)}
                router={router}
              />
            ))}
          </View>

          {/* Help Card */}
          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>
              <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#128C7E" strokeWidth="2"/>
                <Path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpDesc}>
              Our support team is available 24/7 to assist you
            </Text>
            <TouchableOpacity style={styles.helpButton}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#128C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.helpButtonText}>Contact Support</Text>
            </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },

  // Progress
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Hero Card
  heroCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#128C7E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Steps
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCardHeaderText: {
    flex: 1,
  },
  stepNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    overflow: 'hidden',
  },
  stepCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  stepCardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Expanded Content
  stepCardContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  stepDetails: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },

  // Sub Steps
  subStepsContainer: {
    gap: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  subStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  subStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  subStepText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Code Block
  codeBlock: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#34D399',
    lineHeight: 18,
  },

  // Features
  featuresContainer: {
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheck: {
    fontSize: 18,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // Tip Box
  tipBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  tipEmoji: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 19,
  },
  tipBold: {
    fontWeight: '700',
  },

  // Warning Box
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  warningEmoji: {
    fontSize: 18,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 19,
  },
  warningBold: {
    fontWeight: '700',
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // Help Card
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  helpIcon: {
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  helpDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#128C7E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#128C7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
