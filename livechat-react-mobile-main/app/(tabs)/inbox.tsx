import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Platform, RefreshControl, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import conversationService from '../../src/services/conversationService';
import notificationService from '../../src/services/notificationService';
import pusherService from '../../src/services/pusherService';

const SearchIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
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

export default function InboxScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');
  const [cache, setCache] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const router = useRouter();
  const subscribedConvsRef = useRef(new Set());
  const callbackIdsRef = useRef({});

  // Initialize Pusher and subscribe to widget channel once
  useEffect(() => {
    pusherService.initialize();

    console.log('🚀 INBOX: Subscribing to widget channel for new conversations');

    // ✅ Subscribe to 'widget' channel for new conversations (matches Laravel backend)
    pusherService.subscribeToWidgetChannel({
      onNewConversation: (data) => {
        console.log('🆕 INBOX: New conversation from widget channel, refreshing list...');
        // Show notification for new conversation
        const visitorName = data.conversation?.visitor_name || 'New Visitor';
        notificationService.showNotification(visitorName, 'Started a new conversation');
        // Refresh the conversation list to get the full conversation data
        loadConversations();
      }
    });

    return () => {
      // Cleanup all conversation subscriptions
      subscribedConvsRef.current.forEach(convId => {
        const callbackId = callbackIdsRef.current[convId];
        if (callbackId) {
          pusherService.unsubscribeFromConversation(convId, callbackId);
        }
      });
      subscribedConvsRef.current.clear();
      callbackIdsRef.current = {};

      pusherService.unsubscribeFromWidgetChannel();
    };
  }, []);

  // Load conversations when filter changes
  useEffect(() => {
    if (cache[filter]) {
      setConversations(cache[filter]);
      setLoading(false);
    } else {
      setLoading(true);
      loadConversations();
    }
  }, [filter]);

  // Refresh inbox when screen gets focus (e.g., after closing/reopening conversation)
  useFocusEffect(
    useCallback(() => {
      console.log('📱 INBOX: Screen focused, refreshing conversations');
      loadConversations();
    }, [filter])
  );

  // Subscribe to new conversations when the list changes
  useEffect(() => {
    if (conversations.length === 0) {
      console.log(`⏭️ INBOX: No conversations to subscribe to yet`);
      return;
    }

    // ✅ PHASE 2: INBOX ENABLED - Multi-callback support allows both inbox and chat to subscribe
    console.log(`📡 INBOX: Checking subscriptions for ${conversations.length} conversations`);

    let newSubscriptions = 0;
    conversations.forEach(conv => {
      if (!subscribedConvsRef.current.has(conv.id)) {
        console.log(`📡 INBOX: NEW subscription to conversation ${conv.id}`);
        subscribedConvsRef.current.add(conv.id);
        const callbackId = pusherService.subscribeToConversation(conv.id, {
          onNewMessage: (msg) => {
            console.log(`💬 INBOX: Received message for conversation ${conv.id}:`, msg);
            // Show notification for visitor messages
            if (msg.sender_type === 'visitor') {
              const visitorName = conv.name || 'Visitor';
              const messagePreview = msg.content ? (msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content) : 'Sent a file';
              notificationService.showNotification(visitorName, messagePreview);
            }
            updateConversationMessage(conv.id, msg);
          },
          onTyping: (data) => {
            if (data.sender_type === 'visitor') {
              console.log(`⌨️ INBOX: Visitor typing in conversation ${conv.id}`);
              setTypingUsers(prev => ({ ...prev, [conv.id]: true }));
              setTimeout(() => {
                setTypingUsers(prev => ({ ...prev, [conv.id]: false }));
              }, 3000);
            }
          },
        });
        callbackIdsRef.current[conv.id] = callbackId;
        newSubscriptions++;
      }
    });

    if (newSubscriptions > 0) {
      console.log(`✅ INBOX: Added ${newSubscriptions} new subscriptions`);
    } else {
      console.log(`✅ INBOX: All conversations already subscribed`);
    }
  }, [conversations]);

  const handleNewConversation = (data) => {
    console.log('🆕 INBOX: handleNewConversation called with:', data);
    const newConv = data.conversation || data;
    const formatted = {
      id: newConv.id,
      name: newConv.visitor_name || `Visitor ${newConv.id}`,
      initial: (newConv.visitor_name || 'V').charAt(0).toUpperCase(),
      lastMessage: newConv.last_message?.content || 'New conversation',
      time: formatTime(newConv.last_message_at || newConv.created_at),
      unread: true,
      status: newConv.status,
      lastActivity: newConv.last_message_at || newConv.updated_at,
    };

    console.log('📝 INBOX: Formatted new conversation:', formatted);

    setConversations(prev => {
      const exists = prev.find(c => c.id === newConv.id);
      if (!exists) {
        console.log('✅ INBOX: Adding new conversation to list');
        const updated = [formatted, ...prev];
        setCache(c => ({ ...c, [filter]: updated }));
        return updated;
      }
      console.log('⚠️ INBOX: Conversation already exists, skipping');
      return prev;
    });
  };

  const loadConversations = async () => {
    try {
      const result = await conversationService.getConversations({ status: filter, limit: 50 });
      if (result.status === 'success') {
        const formatted = formatConversations(result.conversations || []);
        setConversations(formatted);
        setCache(prev => ({ ...prev, [filter]: formatted }));
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatConversations = (convs) => {
    return convs.map(c => ({
      id: c.id,
      name: c.visitor_name || `Visitor ${c.id}`,
      initial: (c.visitor_name || 'V').charAt(0).toUpperCase(),
      lastMessage: c.last_message?.content || 'New conversation',
      time: formatTime(c.last_message_at || c.created_at),
      unread: c.unread_count > 0,
      status: c.status,
      lastActivity: c.last_message_at || c.updated_at,
    }));
  };

  const isOnline = (lastActivityTime) => {
    if (!lastActivityTime) return false;
    const now = new Date();
    const lastActive = new Date(lastActivityTime);
    const diffMinutes = Math.floor((now - lastActive) / 60000);
    return diffMinutes < 5; // Online if active within last 5 minutes
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  const updateConversationMessage = (convId, message) => {
    console.log(`💬 INBOX: updateConversationMessage called for conv ${convId}:`, message);
    setConversations(prev => {
      // Find if conversation exists in current list
      const existingIndex = prev.findIndex(conv => conv.id === convId);

      if (existingIndex >= 0) {
        console.log(`✅ INBOX: Found conversation at index ${existingIndex}, updating...`);
        // Update existing conversation
        const updated = prev.map(conv => {
          if (conv.id === convId) {
            return {
              ...conv,
              lastMessage: message.content || message.file_name || 'New message',
              time: formatTime(message.created_at),
              unread: message.sender_type !== 'agent',
              lastActivity: message.created_at,
            };
          }
          return conv;
        });

        // Sort by most recent activity - move updated conversation to top
        const sortedUpdated = [...updated].sort((a, b) => {
          const timeA = new Date(a.lastActivity || 0).getTime();
          const timeB = new Date(b.lastActivity || 0).getTime();
          return timeB - timeA;
        });

        console.log(`✅ INBOX: Updated and sorted conversations`);
        setCache(c => ({ ...c, [filter]: sortedUpdated }));
        return sortedUpdated;
      }

      console.log(`⚠️ INBOX: Conversation ${convId} not found in current list`);
      return prev;
    });
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[styles.conv, item.unread && styles.convUnread]}
      onPress={() => router.push(`/chat/${item.id}`)}
      activeOpacity={0.6}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.initial}</Text>
        </View>
        {isOnline(item.lastActivity) && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.convContent}>
        <View style={styles.convHeader}>
          <Text style={styles.convName} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.convTime, item.unread && styles.convTimeUnread]}>{item.time}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={[styles.convMsg, item.unread && styles.convMsgUnread]} numberOfLines={2}>
            {typingUsers[item.id] ? 'Typing...' : item.lastMessage}
          </Text>
          {item.unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>1</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#075E54" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filters}>
        {['open', 'closed', 'archived'].map(f => (
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
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <ShimmerItem key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No conversations</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' }, //original color refrence #F9FAFB
  header: { backgroundColor: '#0A2540', paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, color: '#fff', fontSize: 15 },
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  filterBtn: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 16, backgroundColor: 'transparent' },
  filterBtnActive: { backgroundColor: '#DCF8C6' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#075E54' },
  filterTextActive: { color: '#075E54' },
  list: { paddingBottom: 20, backgroundColor: '#F9FAFB' },
  shimmerContainer: { backgroundColor: '#F9FAFB' },
  shimmer: { flexDirection: 'row', padding: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECECEC', alignItems: 'center' },
  shimmerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB' },
  shimmerContent: { flex: 1, marginLeft: 12 },
  shimmerLine: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5 },
  conv: { flexDirection: 'row', padding: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECECEC', alignItems: 'center' },
  convUnread: { backgroundColor: '#fff' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#128C7E', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#25D366', borderWidth: 3, borderColor: '#fff' },
  convContent: { flex: 1, paddingRight: 8 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  convName: { fontSize: 17, fontWeight: '600', color: '#000', flex: 1, marginRight: 8 },
  convTime: { fontSize: 12, color: '#667781', fontWeight: '400' },
  convTimeUnread: { color: '#25D366', fontWeight: '600' },
  messageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convMsg: { fontSize: 14, color: '#667781', flex: 1, lineHeight: 18 },
  convMsgUnread: { color: '#111827', fontWeight: '500' },
  unreadBadge: { backgroundColor: '#25D366', borderRadius: 11, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7, marginLeft: 8 },
  unreadCount: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
});
