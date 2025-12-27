import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import conversationService from '../../src/services/conversationService';
import pusherService from '../../src/services/pusherService';
import notificationService from '../../src/services/notificationService';

const conversationCache = {};

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SendIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlusIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const EmojiIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#6B7280" strokeWidth="2"/>
    <Path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M9 9H9.01M15 9H15.01" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const PhoneIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92V19.92C22 20.97 21.16 21.88 20.11 21.92C9.81 22.51 1.49 14.2 2.08 3.89C2.12 2.84 3.03 2 4.08 2H7.08C7.63 2 8.08 2.45 8.08 3C8.08 4.25 8.28 5.45 8.64 6.57C8.75 6.92 8.64 7.31 8.37 7.57L6.58 9.36C8.29 12.61 11.39 15.71 14.64 17.42L16.43 15.63C16.69 15.36 17.08 15.25 17.43 15.36C18.55 15.72 19.75 15.92 21 15.92C21.55 15.92 22 16.37 22 16.92Z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const VideoIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M23 7L16 12L23 17V7Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H14C15.1046 19 16 18.1046 16 17V7C16 5.89543 15.1046 5 14 5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MoreIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const FileIcon = () => (
  <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <Path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M13 2V9H20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DownloadIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 10L12 15L17 10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 15V3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CloseIcon = ({ color = "#EF4444" }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ReopenIcon = ({ color = "#10B981" }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M4 12L7 9M4 12L7 15M4 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Helper function to remove duplicate messages and temp messages
const deduplicateMessages = (messages) => {
  const seen = new Set();
  return messages.filter(msg => {
    // Remove temp messages (they shouldn't be in cache)
    if (msg.temp || String(msg.id).startsWith('temp-')) {
      return false;
    }
    // Remove duplicates
    if (seen.has(msg.id)) {
      return false;
    }
    seen.add(msg.id);
    return true;
  });
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [conv, setConv] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageMenuVisible, setMessageMenuVisible] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [oldestId, setOldestId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const callbackIdRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const convId = String(id);

    // ✅ Use cache for instant display, but ALWAYS refetch fresh messages
    if (conversationCache[convId]) {
      console.log(`⚡ CHAT SCREEN [${convId}]: Loading from cache (${conversationCache[convId].messages.length} messages)`);
      const dedupedMessages = deduplicateMessages(conversationCache[convId].messages);
      console.log(`🔍 After deduplication: ${dedupedMessages.length} messages`);
      setMessages(dedupedMessages);
      setConv(conversationCache[convId].conv);
      setHasMore(conversationCache[convId].hasMore || false);
      setOldestId(conversationCache[convId].oldestId || null);
      setLoading(false);

      // ✅ ALWAYS refetch to ensure we have latest messages (fixes stale cache issue)
      console.log(`🔄 CHAT SCREEN [${convId}]: Refetching fresh messages to update cache`);
      loadMessages();
    } else {
      console.log(`🔄 CHAT SCREEN [${convId}]: No cache, loading from API`);
      setLoading(true);
      loadMessages();
    }

    pusherService.initialize();

    console.log(`📡 CHAT SCREEN: Subscribing to conversation ${convId}`);

    callbackIdRef.current = pusherService.subscribeToConversation(convId, {
      onNewMessage: (msg) => {
        console.log(`💬 CHAT SCREEN [${convId}]: Received new message:`, msg);
        setMessages(prev => {
          console.log(`📊 CHAT SCREEN [${convId}]: Current messages count: ${prev.length}`);

          // Check if message already exists (prevent duplicates)
          const exists = prev.some(m => m.id === msg.id);
          if (exists) {
            console.log(`⚠️ CHAT SCREEN [${convId}]: Message ${msg.id} already exists, skipping`);
            return prev;
          }

          const updated = [...prev, msg];
          console.log(`✅ CHAT SCREEN [${convId}]: Added new message, total: ${updated.length}`);

          // Update cache with new message (deduplicated)
          if (conversationCache[convId]) {
            conversationCache[convId].messages = deduplicateMessages(updated);
            // Keep existing pagination metadata
          }
          return updated;
        });
        setIsTyping(false);
        // Update last activity when new message arrives
        if (msg.sender_type === 'visitor') {
          setConv(prev => prev ? { ...prev, lastActivity: msg.created_at || new Date().toISOString() } : prev);
          // Show notification for visitor messages
          const visitorName = conv?.name || 'Visitor';
          const messagePreview = msg.content ? (msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content) : 'Sent a file';
          notificationService.showNotification(visitorName, messagePreview);
        }
      },
      onTyping: (data) => {
        console.log(`⌨️ CHAT SCREEN [${convId}]: Typing event:`, data);
        if (data.sender_type === 'visitor') {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
          // Update last activity when visitor is typing
          setConv(prev => prev ? { ...prev, lastActivity: new Date().toISOString() } : prev);
        }
      },
    });

    console.log(`✅ CHAT SCREEN: Subscribed with callback ID: ${callbackIdRef.current}`);

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      console.log(`🧹 CHAT SCREEN: Cleaning up conversation ${convId}`);
      if (callbackIdRef.current) {
        pusherService.unsubscribeFromConversation(convId, callbackIdRef.current);
      }
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [id]);

  const loadMessages = async () => {
    try {
      const convId = String(id);
      console.log(`📥 CHAT SCREEN [${convId}]: Loading messages from API...`);

      // Get conversation details (without pagination)
      const convResult = await conversationService.getConversation(convId);

      // Get messages with pagination - start with 10 messages
      const msgResult = await conversationService.getMessages(convId, { limit: 10 });

      if (convResult.status === 'success' && msgResult.status === 'success') {
        const msgs = msgResult.messages || [];
        console.log(`✅ CHAT SCREEN [${convId}]: Loaded ${msgs.length} messages from API`);
        const conversation = convResult.conversation;
        const visitorName = conversation.visitor_name || `Visitor ${conversation.id}`;
        // Backend uses 'status' field, not 'state'
        const conversationStatus = conversation.status || conversation.state || 'active';
        console.log(`📊 CHAT SCREEN [${convId}]: Conversation status: ${conversationStatus}`);
        const convData = {
          name: visitorName,
          initial: visitorName.charAt(0).toUpperCase(),
          lastActivity: conversation.last_message_at || conversation.updated_at,
          state: conversationStatus,
        };
        setMessages(msgs);
        setConv(convData);
        setHasMore(msgResult.has_more || false);
        setOldestId(msgResult.oldest_message_id || null);

        // Cache messages with pagination metadata
        conversationCache[convId] = {
          messages: msgs,
          conv: convData,
          hasMore: msgResult.has_more || false,
          oldestId: msgResult.oldest_message_id || null,
        };
        setLoading(false);
      }
    } catch (error) {
      console.error(`❌ CHAT SCREEN [${convId}]: Error loading messages:`, error);
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !oldestId) return;

    setLoadingMore(true);
    try {
      const convId = String(id);
      console.log(`📥 CHAT SCREEN [${convId}]: Loading more messages before ID ${oldestId}...`);
      const result = await conversationService.getMessages(convId, {
        limit: 10,
        before_id: oldestId,
      });

      if (result.status === 'success') {
        const olderMsgs = result.messages || [];
        console.log(`✅ CHAT SCREEN [${convId}]: Loaded ${olderMsgs.length} older messages`);

        // Prepend older messages to existing messages
        const updatedMessages = deduplicateMessages([...olderMsgs, ...messages]);
        setMessages(updatedMessages);
        setHasMore(result.has_more || false);
        setOldestId(result.oldest_message_id || null);

        // Update cache with all loaded messages and pagination metadata
        if (conversationCache[convId]) {
          conversationCache[convId].messages = updatedMessages;
          conversationCache[convId].hasMore = result.has_more || false;
          conversationCache[convId].oldestId = result.oldest_message_id || null;
          console.log(`💾 CACHE UPDATED: ${updatedMessages.length} total messages cached`);
        }
      }
    } catch (error) {
      console.error(`❌ CHAT SCREEN: Error loading more messages:`, error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleTextChange = (newText) => {
    console.log(`⌨️ CHAT: handleTextChange called, text length: ${newText.length}`);
    setText(newText);
    const convId = String(id);

    if (newText.trim()) {
      // User is typing
      console.log(`⌨️ CHAT: Agent started typing in conversation ${convId}`);
      pusherService.sendTypingIndicator(convId, true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        console.log(`⌨️ CHAT: Auto-stopping typing indicator for conversation ${convId}`);
        pusherService.sendTypingIndicator(convId, false);
      }, 3000);
    } else {
      // User cleared the input
      console.log(`⌨️ CHAT: Agent cleared input in conversation ${convId}`);
      pusherService.sendTypingIndicator(convId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    const convId = String(id);
    setText('');

    // Stop typing indicator when sending message
    pusherService.sendTypingIndicator(convId, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const tempMsg = {
      id: `temp-${Date.now()}`,
      content,
      sender_type: 'agent',
      created_at: new Date().toISOString(),
      temp: true,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const result = await conversationService.sendMessage(convId, content);
      // Remove temp message - real message will come via Pusher
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  const handleCloseConversation = async () => {
    if (isClosing) return;
    setIsClosing(true);
    setMenuVisible(false);
    try {
      const convId = String(id);
      const result = await conversationService.closeConversation(convId);
      if (result.status === 'success') {
        setConv(prev => prev ? { ...prev, state: 'closed' } : prev);
        console.log('✅ Conversation closed successfully');
        // System message will come via Pusher, no need to reload
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopenConversation = async () => {
    if (isReopening) return;
    setIsReopening(true);
    setMenuVisible(false);
    try {
      const convId = String(id);
      const result = await conversationService.reopenConversation(convId);
      if (result.status === 'success') {
        setConv(prev => prev ? { ...prev, state: 'active' } : prev);
        console.log('✅ Conversation reopened successfully');
        // System message will come via Pusher, no need to reload
      }
    } catch (error) {
      console.error('Error reopening conversation:', error);
    } finally {
      setIsReopening(false);
    }
  };

  const handleCopyMessage = async () => {
    if (selectedMessage?.content) {
      await Clipboard.setStringAsync(selectedMessage.content);
    }
    setMessageMenuVisible(false);
    setSelectedMessage(null);
  };

  const handleShareMessage = async () => {
    if (selectedMessage?.content) {
      try {
        await Share.share({ message: selectedMessage.content });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    setMessageMenuVisible(false);
    setSelectedMessage(null);
  };

  const handleLongPress = (message) => {
    if (message.content) {
      setSelectedMessage(message);
      setMessageMenuVisible(true);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const isOnline = (lastActivityTime) => {
    if (!lastActivityTime) return false;
    const now = new Date();
    const lastActive = new Date(lastActivityTime);
    const diffMinutes = Math.floor((now - lastActive) / 60000);
    return diffMinutes < 5; // Online if active within last 5 minutes
  };

  const getFileType = (url) => {
    if (!url) return 'file';
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'file';
  };

  const renderMessage = ({ item }) => {
    const isAgent = item.sender_type === 'agent';
    const isBot = item.sender_type === 'bot';
    const isVisitor = item.sender_type === 'visitor';
    const isSystem = item.sender_type === 'system';
    const hasFile = item.file_url || item.attachment_url;
    const fileUrl = item.file_url || item.attachment_url;
    const fileType = getFileType(fileUrl);
    const fileName = item.file_name || item.attachment_name || 'File';

    return (
      <View style={[styles.msgWrap, isAgent && styles.msgWrapAgent]}>
        {!isAgent && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {isBot ? 'AI' : isSystem ? 'S' : (conv?.initial || 'V')}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.bubble, isAgent ? styles.bubbleAgent : styles.bubbleVisitor]}
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.8}
        >
          {hasFile && fileType === 'image' && (
            <TouchableOpacity onPress={() => Linking.openURL(fileUrl)} activeOpacity={0.8}>
              <Image
                source={{ uri: fileUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {hasFile && fileType !== 'image' && (
            <TouchableOpacity
              style={styles.fileContainer}
              onPress={() => Linking.openURL(fileUrl)}
              activeOpacity={0.7}
            >
              <FileIcon />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                <Text style={styles.fileAction}>
                  <DownloadIcon /> Tap to open
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {item.content && (
            <Text style={[styles.msgText, isAgent && styles.msgTextAgent, hasFile && styles.msgTextWithFile]}>
              {item.content}
            </Text>
          )}
          <Text style={[styles.time, isAgent && styles.timeAgent]}>{formatTime(item.created_at)}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} onPress={() => {}}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{conv?.initial || 'V'}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{conv?.name || 'Loading...'}</Text>
            <Text style={[styles.headerStatus, !isOnline(conv?.lastActivity) && styles.headerStatusOffline]}>
              {isTyping ? 'Typing...' : isOnline(conv?.lastActivity) ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <VideoIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <PhoneIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => setMenuVisible(true)}>
            <MoreIcon />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' }]}
              onPress={() => {
                setMenuVisible(false);
                router.push(`/visitor-info/${id}` as any);
              }}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <Text style={styles.menuItemText}>
                Visitor Information
              </Text>
            </TouchableOpacity>

            {(() => {
              console.log(`🔍 MENU: Conversation state is: ${conv?.state}`);
              return conv?.state === 'closed';
            })() ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleReopenConversation}
                disabled={isReopening}
                activeOpacity={0.6}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#ECFDF5' }]}>
                  <ReopenIcon color="#10B981" />
                </View>
                <Text style={styles.menuItemText}>
                  {isReopening ? 'Reopening...' : 'Reopen Conversation'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleCloseConversation}
                disabled={isClosing}
                activeOpacity={0.6}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#FEF2F2' }]}>
                  <CloseIcon color="#EF4444" />
                </View>
                <Text style={styles.menuItemText}>
                  {isClosing ? 'Closing...' : 'Close Conversation'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={messageMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMessageMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.messageMenuOverlay}
          activeOpacity={1}
          onPress={() => setMessageMenuVisible(false)}
        >
          <View style={styles.messageMenuContainer}>
            <TouchableOpacity
              style={[styles.messageMenuItem, { borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' }]}
              onPress={handleCopyMessage}
              activeOpacity={0.6}
            >
              <View style={[styles.messageMenuIcon, { backgroundColor: '#EFF6FF' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.083 2.57C15.7094 2.20466 15.2076 2.00007 14.685 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V4Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V9C4 8.46957 4.21071 7.96086 4.58579 7.58579C4.96086 7.21071 5.46957 7 6 7H8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <Text style={styles.messageMenuText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageMenuItem}
              onPress={handleShareMessage}
              activeOpacity={0.6}
            >
              <View style={[styles.messageMenuIcon, { backgroundColor: '#F0FDF4' }]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <Text style={styles.messageMenuText}>Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        inverted
        contentContainerStyle={[
          styles.msgList,
          Platform.OS === 'android' && keyboardHeight > 0 && { paddingTop: keyboardHeight + 130 }
        ]}
        style={styles.chatBg}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : null
        }
      />

      {isTyping && (
        <View style={[
          styles.typingContainerFixed,
          Platform.OS === 'android' && keyboardHeight > 0 && { bottom: keyboardHeight + 20 }
        ]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{conv?.initial || 'V'}</Text>
          </View>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, { marginLeft: 4 }]} />
            <View style={[styles.typingDot, { marginLeft: 4 }]} />
          </View>
        </View>
      )}

      <View style={[
        styles.inputContainer,
        Platform.OS === 'android' && keyboardHeight > 0 && {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          marginBottom: keyboardHeight,
        },
        Platform.OS === 'android' && keyboardHeight === 0 && {
          marginBottom: insets.bottom + 12
        }
      ]} pointerEvents="box-none">
        <TouchableOpacity style={styles.attachBtn}>
          <PlusIcon />
        </TouchableOpacity>
        <View style={styles.inputWrapper} pointerEvents="auto">
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.emojiBtn}>
            <EmojiIcon />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <SendIcon />
        </TouchableOpacity>
      </View>

      {(isClosing || isReopening) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              {isClosing ? 'Closing conversation...' : 'Reopening conversation...'}
            </Text>
          </View>
        </View>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A2540', paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 12, paddingHorizontal: 12 },
  backBtn: { marginRight: 8, padding: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerTextContainer: { flex: 1 },
  headerName: { fontSize: 17, fontWeight: '600', color: '#fff' },
  headerStatus: { fontSize: 12, color: '#10B981', marginTop: 1 },
  headerStatusOffline: { color: '#9CA3AF' },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerActionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chatBg: { flex: 1, backgroundColor: '#ECE5DD' },
  msgList: { padding: 12, paddingBottom: 16, flexGrow: 1 },
  msgWrap: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgWrapAgent: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  bubble: { maxWidth: '75%', borderRadius: 8, padding: 10, paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1 },
  bubbleVisitor: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 2 },
  bubbleAgent: { backgroundColor: '#DCF8C6', borderBottomRightRadius: 2 },
  msgText: { fontSize: 15, color: '#111827', marginBottom: 4, lineHeight: 20 },
  msgTextAgent: { color: '#111827' },
  time: { fontSize: 11, color: '#9CA3AF', alignSelf: 'flex-end' },
  timeAgent: { color: '#6B7280' },
  inputContainer: { flexDirection: 'row', padding: 8, paddingHorizontal: 12, backgroundColor: '#F3F4F6', alignItems: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 6 },
  input: { flex: 1, fontSize: 15, maxHeight: 100, paddingVertical: 6, color: '#111827' },
  emojiBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#9CA3AF' },
  typingContainer: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', marginLeft: 44 },
  typingContainerFixed: { position: 'absolute', bottom: 70, left: 12, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#ECE5DD', paddingVertical: 8 },
  typingBubble: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, paddingHorizontal: 16, alignItems: 'center', marginLeft: 8 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' },
  messageImage: { width: 200, height: 200, borderRadius: 8, marginBottom: 8 },
  fileContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginBottom: 8 },
  fileInfo: { flex: 1, marginLeft: 12 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  fileAction: { fontSize: 12, color: '#3B82F6', flexDirection: 'row', alignItems: 'center' },
  msgTextWithFile: { marginTop: 0 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: Platform.OS === 'ios' ? 112 : 74, paddingRight: 4 },
  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 14, minWidth: 250, paddingVertical: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 },
  menuIconContainer: { marginRight: 14, width: 38, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  menuItemText: { fontSize: 15.5, color: '#1F2937', fontWeight: '600', flex: 1, letterSpacing: 0.1 },
  menuItemDanger: { color: '#EF4444' },
  messageMenuOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 50 },
  messageMenuContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 280, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 20 },
  messageMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  messageMenuIcon: { marginRight: 16, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  messageMenuText: { fontSize: 16, color: '#1F2937', fontWeight: '600', letterSpacing: 0.2 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  loadingContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: '#111827' },
  loadMoreContainer: { alignItems: 'center', paddingVertical: 16, paddingBottom: 8 },
  loadMoreButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8, borderWidth: 1, borderColor: '#BFDBFE', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  loadMoreText: { fontSize: 14, fontWeight: '600', color: '#3B82F6', letterSpacing: 0.2 },
});
