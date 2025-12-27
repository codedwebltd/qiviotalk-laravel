//_layout.tsx file
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import authService from '../src/services/authService';
import notificationService from '../src/services/notificationService';

// Prevent the splash screen from auto-hiding (removes Expo animation)
SplashScreen.preventAutoHideAsync();

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F9FAFB',
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Setup axios interceptors when app loads
    authService.setupAxiosInterceptors();

    // Initialize notifications if user is already logged in
    const initNotifications = async () => {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const token = await authService.getToken();
        console.log('🔔 APP STARTUP: User is logged in, initializing notifications...');
        notificationService.initialize(token || undefined).catch(err => {
          console.error('❌ APP STARTUP: Failed to initialize notifications:', err);
        });
      } else {
        console.log('ℹ️ APP STARTUP: User not logged in, skipping notification init');
      }
    };
    initNotifications();

    // Set Android navigation bar color (for edge-to-edge mode)
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#000000');
      NavigationBar.setButtonStyleAsync('dark');
    }

    // Hide native splash screen immediately to show only custom <Livechat/> splash
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider style={{ backgroundColor: '#F9FAFB' }}>
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <ThemeProvider value={customTheme}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F9FAFB' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat/[id]" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}