import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import notificationService from '../src/services/notificationService';
import authService from '../src/services/authService';

export default function TestNotifications() {
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const testGetToken = async () => {
    addLog('🧪 Testing FCM token retrieval...');
    try {
      const authToken = await authService.getToken();
      addLog(`Auth token exists: ${!!authToken}`);

      const fcmToken = await notificationService.initialize(authToken || undefined);
      setToken(fcmToken);
      addLog(`FCM Token: ${fcmToken || 'NULL'}`);

      if (fcmToken) {
        addLog(`✅ SUCCESS: Got FCM token (${fcmToken.length} chars)`);
      } else {
        addLog('❌ FAILED: No FCM token received');
      }
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
    }
  };

  const testPermissions = async () => {
    addLog('🧪 Testing notification permissions...');
    try {
      const granted = await notificationService.requestPermissions();
      addLog(`Permissions granted: ${granted}`);
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
    }
  };

  const testRegisterToken = async () => {
    addLog('🧪 Testing token registration with backend...');
    try {
      const authToken = await authService.getToken();
      if (!authToken) {
        addLog('❌ Not logged in - please login first');
        return;
      }

      if (!token) {
        addLog('❌ No FCM token - run "Get FCM Token" first');
        return;
      }

      const success = await notificationService.updateToken(authToken);
      addLog(`Registration ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
    }
  };

  const testLocalNotification = async () => {
    addLog('🧪 Testing local notification...');
    try {
      await notificationService.showNotification(
        'Test Notification',
        'This is a test notification from the app',
        { type: 'new_message', conversation_id: '123' }
      );
      addLog('✅ Local notification sent');
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
    }
  };

  const checkAuthStatus = async () => {
    addLog('🧪 Checking authentication status...');
    try {
      const isAuth = await authService.isAuthenticated();
      const user = await authService.getCurrentUser();
      const authToken = await authService.getToken();

      addLog(`Authenticated: ${isAuth}`);
      addLog(`User: ${user ? JSON.stringify(user) : 'NULL'}`);
      addLog(`Token exists: ${!!authToken}`);
      if (authToken) {
        addLog(`Token preview: ${authToken.substring(0, 30)}...`);
      }
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Testing</Text>

      {token && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>FCM Token:</Text>
          <Text style={styles.tokenText} numberOfLines={3}>
            {token}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={checkAuthStatus}>
          <Text style={styles.buttonText}>Check Auth Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testPermissions}>
          <Text style={styles.buttonText}>Test Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testGetToken}>
          <Text style={styles.buttonText}>Get FCM Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testRegisterToken}>
          <Text style={styles.buttonText}>Register with Backend</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testLocalNotification}>
          <Text style={styles.buttonText}>Test Local Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  tokenContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logsScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
