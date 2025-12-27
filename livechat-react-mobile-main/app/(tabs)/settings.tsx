import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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

const ChevronRightIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

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

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Always fetch fresh data from API
      const profileData = await authService.getUserProfile();
      if (profileData && profileData.user) {
        setUserData(profileData.user);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2540" />
        <View style={styles.header}>
          <View style={styles.backBtn} />
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.shimmerItem}>
              <ShimmerBox width={40} height={40} style={{ borderRadius: 10, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <ShimmerBox width="60%" height={16} style={{ marginBottom: 8 }} />
                <ShimmerBox width="90%" height={12} />
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/edit?type=account')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Account</Text>
                <Text style={styles.menuItemSubtitle}>{userData?.email || 'Not set'}</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/setup')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#D1FAE5' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Business Setup</Text>
                <Text style={styles.menuItemSubtitle}>Update your business profile</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* Widget Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WIDGET</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/widget')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Chat Widget</Text>
                <Text style={styles.menuItemSubtitle}>Installation & setup</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/edit?type=appearance')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#E9D5FF' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M7 21H17C18.1046 21 19 20.1046 19 19V9.41421C19 9.149 18.8946 8.89464 18.7071 8.70711L13.2929 3.29289C13.1054 3.10536 12.851 3 12.5858 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M9 13H15M9 17H15M9 9H10" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Appearance</Text>
                <Text style={styles.menuItemSubtitle}>Colors, position & style</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/edit?type=notifications')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Notification Settings</Text>
                <Text style={styles.menuItemSubtitle}>Push, email & sound preferences</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADVANCED</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/ai-training')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2C12 2 8 4 8 8C8 12 6 14 4 14C4 14 4 18 8 18C12 18 12 22 12 22M12 2C12 2 16 4 16 8C16 12 18 14 20 14C20 14 20 18 16 18C12 18 12 22 12 22M12 2V22" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Train AI</Text>
                <Text style={styles.menuItemSubtitle}>Teach AI about your business</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/docs')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#E0E7FF' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M13.8284 10.1716C12.2663 8.60948 9.73367 8.60948 8.17157 10.1716C6.60948 11.7337 6.60948 14.2663 8.17157 15.8284C9.73367 17.3905 12.2663 17.3905 13.8284 15.8284C15.3905 14.2663 15.3905 11.7337 13.8284 10.1716ZM13.8284 10.1716L19 5M15 3H15.01M5 15H5.01M9 19H9.01" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Integrations</Text>
                <Text style={styles.menuItemSubtitle}>Connect external services</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/docs')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>API & Webhooks</Text>
                <Text style={styles.menuItemSubtitle}>Developer settings</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/docs')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M8.228 9C8.68993 7.82588 9.51749 6.84388 10.5811 6.20735C11.6447 5.57082 12.8862 5.31375 14.1127 5.47688C15.3392 5.64002 16.4759 6.21415 17.3298 7.10669C18.1838 7.99923 18.7041 9.15279 18.806 10.383C18.9079 11.6132 18.5851 12.8412 17.8925 13.8689C17.1999 14.8966 16.1772 15.6646 14.9875 16.0515C13.7977 16.4384 12.5132 16.4209 11.3342 15.9024C10.1552 15.3839 9.15326 14.4922 8.488 13.36M12 3V12L8 8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Help & Support</Text>
                <Text style={styles.menuItemSubtitle}>Get assistance</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 17.7956 12.6839 18.5587 12.1213 19.1213C11.5587 19.6839 10.7956 20 10 20H6C5.20435 20 4.44129 19.6839 3.87868 19.1213C3.31607 18.5587 3 17.7956 3 17V7C3 6.20435 3.31607 5.44129 3.87868 4.87868C4.44129 4.31607 5.20435 4 6 4H10C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7V8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, { color: '#DC2626' }]}>Logout</Text>
                <Text style={styles.menuItemSubtitle}>Sign out of your account</Text>
              </View>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
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
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  shimmerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
