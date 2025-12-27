import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import authService from '../src/services/authService';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const [versionChecked, setVersionChecked] = useState(false);

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Check version then auth
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      await checkAppVersion();
    };

    init();
  }, []);

  const checkAppVersion = async () => {
    try {
      // Skip version check in Expo Go (development)
      if (__DEV__ || Constants.appOwnership === 'expo') {
        console.log('Skipping version check in development/Expo Go');
        proceedToApp();
        return;
      }

      const versionName = Constants.expoConfig?.version || '1.0.0';
      // Get versionCode from manifest (Android) or parse from version string
      const versionCode = Platform.OS === 'android'
        ? (Constants.expoConfig?.android?.versionCode || 1)
        : parseInt(versionName.split('.')[0]) || 1;
      const platform = Platform.OS === 'android' ? 'android' : 'ios';

      console.log('Checking version:', { versionCode, versionName, platform });

      const API_URL = authService.getApiUrl();
      const response = await fetch(`${API_URL}/version/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          version_code: versionCode,
          version_name: versionName,
          platform: platform,
        }),
      });

      const result = await response.json();
      console.log('Version check result:', result);

      if (result.status === 'success' && result.update_available) {
        handleUpdateAvailable(result);
      } else {
        proceedToApp();
      }
    } catch (error) {
      console.error('Version check failed:', error);
      // Continue to app on error
      proceedToApp();
    }
  };

  const handleUpdateAvailable = (versionData: any) => {
    const { is_mandatory, message, latest_version } = versionData;

    const changelog = latest_version?.changelog || '';
    const downloadUrl = latest_version?.download_url || '';
    const versionName = latest_version?.name || '';

    // Format changelog with better spacing for readability
    const formattedChangelog = changelog
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');

    const fullMessage = `${message}\n\nVersion: ${versionName}\n\n${formattedChangelog}`;

    Alert.alert(
      'Update Available',
      fullMessage,
      [
        ...(!is_mandatory ? [{
          text: 'Later',
          onPress: () => proceedToApp(),
          style: 'cancel' as const,
        }] : []),
        {
          text: 'Update',
          onPress: () => {
            if (downloadUrl) {
              Linking.openURL(downloadUrl);
            }
            if (!is_mandatory) {
              proceedToApp();
            }
          },
        },
      ],
      { cancelable: !is_mandatory }
    );
  };

  const proceedToApp = async () => {
    setVersionChecked(true);
    const isAuth = await authService.isAuthenticated();

    if (isAuth) {
      router.replace('/(tabs)' as any);
    } else {
      router.replace('./onboarding' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoBox}>
          <Text style={styles.bracket}>{'<'}</Text>
          <Text style={styles.logoText}>LiveChat</Text>
          <Text style={styles.bracket}>{'/>'}</Text>
        </View>
        <Text style={styles.tagline}>Real-time customer support</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A2540',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bracket: {
    fontSize: 56,
    fontWeight: '800',
    color: '#fff',
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#fff',
    marginHorizontal: 8,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});