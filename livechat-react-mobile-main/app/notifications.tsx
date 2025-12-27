import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import authService from '../src/services/authService';

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SettingsIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TrashIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ShimmerItem = () => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
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
    <View style={styles.shimmer}>
      <Animated.View style={[styles.shimmerAvatar, { opacity }]} />
      <View style={styles.shimmerContent}>
        <Animated.View style={[styles.shimmerLine, { width: '60%', opacity }]} />
        <Animated.View style={[styles.shimmerLine, { width: '90%', marginTop: 8, opacity }]} />
      </View>
    </View>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [cache, setCache] = useState({});
  const [showActions, setShowActions] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('📱 NOTIFICATIONS: Screen focused, refreshing notifications');
      loadNotifications();
    }, [filter])
  );

  useEffect(() => {
    if (cache[filter]) {
      setNotifications(cache[filter]);
      setLoading(false);
    } else {
      setLoading(true);
      loadNotifications();
    }
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const token = await authService.getToken();
      const API_URL = authService.getApiUrl();
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const result = await response.json();

      if (result.status === 'success') {
        const parsedNotifications = result.notifications.map((notif: any) => ({
          ...notif,
          data: typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data,
        }));

        setNotifications(parsedNotifications);
        setCache(prev => ({ ...prev, [filter]: parsedNotifications }));
      }
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  const markAsRead = async (id: string) => {
    try {
      const token = await authService.getToken();
      const API_URL = authService.getApiUrl();
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      setNotifications(prev =>
        prev.map((n: any) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await authService.getToken();
      const API_URL = authService.getApiUrl();
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      setNotifications(prev =>
        prev.map((n: any) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setShowActions(false);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteAll = async () => {
    try {
      const token = await authService.getToken();
      const API_URL = authService.getApiUrl();
      await fetch(`${API_URL}/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      setNotifications([]);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to delete all:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = await authService.getToken();
      const API_URL = authService.getApiUrl();
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      setNotifications(prev => prev.filter((n: any) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationPress = (notif: any) => {
    if (!notif.read_at) {
      markAsRead(notif.id);
    }

    if (notif.data?.conversation_id) {
      router.push(`/chat/${notif.data.conversation_id}` as any);
    }
  };

  const filteredNotifications = notifications.filter((notif: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read_at;
    if (filter === 'read') return notif.read_at;
    return true;
  });

  const unreadCount = notifications.filter((n: any) => !n.read_at).length;

  const renderNotification = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.notif, !item.read_at && styles.notifUnread]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => deleteNotification(item.id)}
      activeOpacity={0.6}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, !item.read_at && styles.avatarUnread]}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </View>
        {!item.read_at && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle} numberOfLines={1}>
            {item.data?.title || 'Notification'}
          </Text>
          <Text style={[styles.notifTime, !item.read_at && styles.notifTimeUnread]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
        <Text style={[styles.notifBody, !item.read_at && styles.notifBodyUnread]} numberOfLines={2}>
          {item.data?.body || 'You have a new notification'}
        </Text>
        {item.data?.sender_name && (
          <Text style={styles.notifSender}>{item.data.sender_name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={() => setShowActions(!showActions)} style={styles.settingsBtn}>
            <SettingsIcon />
          </TouchableOpacity>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBanner}>
            <Text style={styles.unreadText}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
            <Text style={styles.actionBtnText}>Mark all read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={deleteAll}>
            <TrashIcon />
            <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.filters}>
        {['all', 'unread', 'read'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.shimmerContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <ShimmerItem key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#0A2540', paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center' },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  unreadBanner: { backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  unreadText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  actionsBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, backgroundColor: '#128C7E' },
  actionBtnDanger: { backgroundColor: '#EF4444' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  actionBtnDangerText: { color: '#fff' },
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  filterBtn: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 16, backgroundColor: 'transparent' },
  filterBtnActive: { backgroundColor: '#DCF8C6' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#075E54' },
  filterTextActive: { color: '#075E54' },
  list: { paddingBottom: 16, backgroundColor: '#F9FAFB' },
  shimmerContainer: { backgroundColor: '#F9FAFB' },
  shimmer: { flexDirection: 'row', padding: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECECEC', alignItems: 'center' },
  shimmerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB' },
  shimmerContent: { flex: 1, marginLeft: 12 },
  shimmerLine: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5 },
  notif: { flexDirection: 'row', padding: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECECEC', alignItems: 'center' },
  notifUnread: { backgroundColor: '#fff' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  avatarUnread: { backgroundColor: '#3B82F6' },
  unreadDot: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', borderWidth: 3, borderColor: '#fff' },
  notifContent: { flex: 1, paddingRight: 8 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 17, fontWeight: '600', color: '#000', flex: 1, marginRight: 8 },
  notifTime: { fontSize: 12, color: '#667781', fontWeight: '400' },
  notifTimeUnread: { color: '#25D366', fontWeight: '600' },
  notifBody: { fontSize: 14, color: '#667781', lineHeight: 18, marginBottom: 4 },
  notifBodyUnread: { color: '#111827', fontWeight: '500' },
  notifSender: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  empty: { padding: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
});
