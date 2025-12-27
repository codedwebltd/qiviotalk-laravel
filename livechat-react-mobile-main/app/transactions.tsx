import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

const WalletIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V12ZM21 12H16C14.8954 12 14 12.8954 14 14C14 15.1046 14.8954 16 16 16H21" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function TransactionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState('0.00');
  const [filter, setFilter] = useState('all');
  const [cache, setCache] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [filter])
  );

  useEffect(() => {
    if (cache[filter]) {
      setTransactions(cache[filter]);
      setLoading(false);
    } else {
      setLoading(true);
      loadTransactions();
    }
  }, [filter]);

  const loadTransactions = async (page = 1) => {
    try {
      const token = await authService.getToken();
      const API_URL = authService.getApiUrl();
      const response = await fetch(
        `${API_URL}/user/profile?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        const txData = result.transactions?.data || [];

        setTransactions(txData);
        setCache((prev) => ({ ...prev, [filter]: txData }));
        setWalletBalance(result.user?.wallet?.balance || '0.00');

        setPagination({
          currentPage: result.transactions?.current_page || 1,
          lastPage: result.transactions?.last_page || 1,
          perPage: result.transactions?.per_page || 15,
          total: result.transactions?.total || 0,
        });
      }
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(1);
  };

  const loadMore = async () => {
    if (loadingMore || pagination.currentPage >= pagination.lastPage) return;

    setLoadingMore(true);
    await loadTransactions(pagination.currentPage + 1);
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'refund':
        return '#10B981';
      case 'subscription':
      case 'subscription_renewal':
        return '#3B82F6';
      default:
        return '#94A3B8';
    }
  };

  const filteredTransactions = transactions.filter((tx: any) => {
    if (filter === 'all') return true;
    if (filter === 'refund') return tx.type === 'refund';
    if (filter === 'subscription') return tx.type === 'subscription' || tx.type === 'subscription_renewal';
    return true;
  });

  const handleTransactionPress = (item: any) => {
    router.push({
      pathname: '/transaction-details',
      params: {
        transaction: JSON.stringify(item),
      },
    });
  };

  const renderTransaction = ({ item }: any) => {
    const iconColor = getTransactionIcon(item.type);
    const isCredit = item.type === 'refund';

    return (
      <TouchableOpacity
        style={styles.transaction}
        activeOpacity={0.6}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: iconColor }]}>
            {item.type === 'refund' ? (
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 10H13M3 10L7 6M3 10L7 14M21 14H11M21 14L17 10M21 14L17 18"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ) : (
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>
        </View>
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.transactionTime}>{formatTime(item.created_at)}</Text>
          </View>
          <Text style={[styles.transactionAmount, isCredit && styles.creditAmount]}>
            {isCredit ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
          </Text>
          {item.status && (
            <Text style={styles.transactionStatus}>{item.status}</Text>
          )}
        </View>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M9 18L15 12L9 6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity style={styles.walletBtn}>
            <WalletIcon />
          </TouchableOpacity>
        </View>
        {walletBalance && (
          <View style={styles.balanceBanner}>
            <Text style={styles.balanceText}>
              Wallet Balance: ${parseFloat(walletBalance).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.filters}>
        {['all', 'refund', 'subscription'].map((f) => (
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShimmerItem key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.emptyText}>No transactions</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center' },
  walletBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  balanceText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  filterBtnActive: { backgroundColor: '#DCF8C6' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#075E54' },
  filterTextActive: { color: '#075E54' },
  list: { paddingBottom: 16, backgroundColor: '#F9FAFB' },
  shimmerContainer: { backgroundColor: '#F9FAFB' },
  shimmer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    alignItems: 'center',
  },
  shimmerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB' },
  shimmerContent: { flex: 1, marginLeft: 12 },
  shimmerLine: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5 },
  transaction: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    alignItems: 'center',
  },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContent: { flex: 1, paddingRight: 8 },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionTitle: { fontSize: 17, fontWeight: '600', color: '#000', flex: 1, marginRight: 8 },
  transactionTime: { fontSize: 12, color: '#667781', fontWeight: '400' },
  transactionAmount: {
    fontSize: 14,
    color: '#667781',
    lineHeight: 18,
    marginBottom: 4,
    fontWeight: '700',
  },
  creditAmount: { color: '#10B981' },
  transactionStatus: {
    fontSize: 12,
    color: '#667781',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  empty: { padding: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
});
