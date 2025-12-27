import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Clipboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 4L12 14.01L9 11.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DownloadIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SupportIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CopyIcon = ({ color = "#6B7280" }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M8 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V16M12 4H18C19.1046 4 20 4.89543 20 6V12C20 13.1046 19.1046 14 18 14H12C10.8954 14 10 13.1046 10 12V6C10 4.89543 10.8954 4 12 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const BitcoinIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.5 17H11.5V18H10.5V17H9V16H10V8H9V7H10.5V6H11.5V7H12C13.1046 7 14 7.89543 14 9C14 9.73478 13.5978 10.3711 13 10.7324V10.7324C13.5978 11.0936 14 11.73 14 12.4648C14 13.5694 13.1046 14.4648 12 14.4648H11.5V16H13.5V17Z" stroke="#F59E0B" strokeWidth="1.5" fill="#FEF3C7"/>
  </Svg>
);

const ClockIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const transaction = params.transaction ? JSON.parse(params.transaction as string) : null;

  React.useEffect(() => {
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

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const showToast = (message: string) => {
    setToastVisible(true);
    Animated.sequence([
      Animated.spring(toastAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastVisible(false);
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    showToast(`${label} copied`);
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { color: '#10B981', bg: '#D1FAE5', label: 'Completed', gradient: ['#10B981', '#059669'] };
      case 'pending':
        return { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending', gradient: ['#F59E0B', '#D97706'] };
      case 'cancelled':
      case 'cancel':
        return { color: '#6B7280', bg: '#F3F4F6', label: 'Cancelled', gradient: ['#6B7280', '#4B5563'] };
      case 'failed':
        return { color: '#EF4444', bg: '#FEE2E2', label: 'Failed', gradient: ['#EF4444', '#DC2626'] };
      default:
        return { color: '#6B7280', bg: '#F3F4F6', label: status || 'Unknown', gradient: ['#6B7280', '#4B5563'] };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'refund':
        return { color: '#10B981', bg: '#D1FAE5', icon: '+', gradient: ['#10B981', '#059669'] };
      case 'subscription':
      case 'subscription_renewal':
        return { color: '#3B82F6', bg: '#DBEAFE', icon: '★', gradient: ['#3B82F6', '#2563EB'] };
      default:
        return { color: '#6B7280', bg: '#F3F4F6', icon: '•', gradient: ['#6B7280', '#4B5563'] };
    }
  };

  const isCredit = transaction.type === 'refund';
  const statusConfig = getStatusConfig(transaction.status);
  const typeConfig = getTypeConfig(transaction.type);
  const metadata = transaction.metadata || {};
  const webhookData = metadata.webhook_response || {};

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Fixed Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0A2540' }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero Amount Display */}
          <View style={styles.heroAmount}>
            <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusPillText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
            <Text style={styles.currencyLabel}>{transaction.currency}</Text>
            <Text style={styles.amountText}>
              {isCredit ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Transaction Overview Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: typeConfig.bg }]}>
                <Text style={[styles.cardIconText, { color: typeConfig.color }]}>{typeConfig.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Transaction Overview</Text>
                <Text style={styles.cardSubtitle}>{transaction.description}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <DetailRow label="Transaction ID" value={transaction.uuid} copyable onCopy={() => copyToClipboard(transaction.uuid, 'ID')} />
            <DetailRow label="Reference" value={transaction.reference} copyable onCopy={() => copyToClipboard(transaction.reference, 'Reference')} />
            <DetailRow label="Type" value={transaction.type.replace('_', ' ').toUpperCase()} />
            <DetailRow label="Status" value={statusConfig.label} badge badgeColor={statusConfig.color} badgeBg={statusConfig.bg} />
            <DetailRow label="Currency" value={transaction.currency} />
          </View>

          {/* Date & Time Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ClockIcon />
              <Text style={styles.cardTitle}>Timeline</Text>
            </View>

            <View style={styles.divider} />

            <TimelineItem
              label="Created"
              date={formatDate(transaction.created_at)}
              time={formatTime(transaction.created_at)}
              isFirst
            />
            {transaction.updated_at !== transaction.created_at && (
              <TimelineItem
                label="Last Updated"
                date={formatDate(transaction.updated_at)}
                time={formatTime(transaction.updated_at)}
              />
            )}
            {metadata.cancelled_at && (
              <TimelineItem
                label="Cancelled"
                date={formatDate(metadata.cancelled_at)}
                time={formatTime(metadata.cancelled_at)}
                isLast
              />
            )}
          </View>

          {/* Payment Details Card (if available) */}
          {metadata.payment_method && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
                  <BitcoinIcon />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Payment Details</Text>
                  <Text style={styles.cardSubtitle}>{metadata.payment_method}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {metadata.order_id && <DetailRow label="Order ID" value={metadata.order_id} copyable onCopy={() => copyToClipboard(metadata.order_id, 'Order ID')} />}
              <DetailRow label="Payment Method" value={metadata.payment_method} />
              {metadata.subscription_id && <DetailRow label="Subscription ID" value={`#${metadata.subscription_id}`} />}
            </View>
          )}

          {/* Crypto Payment Breakdown (if available) */}
          {webhookData.payer_currency && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.cardIconText}>₿</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Cryptocurrency Details</Text>
                  <Text style={styles.cardSubtitle}>Blockchain Payment Information</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {webhookData.payer_currency && (
                <DetailRow label="Paid Currency" value={webhookData.payer_currency} badge badgeColor="#F59E0B" badgeBg="#FEF3C7" />
              )}
              {webhookData.payer_amount && (
                <DetailRow
                  label="Crypto Amount"
                  value={`${parseFloat(webhookData.payer_amount).toFixed(8)} ${webhookData.payer_currency}`}
                  highlight
                  highlightColor="#F59E0B"
                />
              )}
              {webhookData.network && (
                <DetailRow label="Network" value={webhookData.network.toUpperCase()} />
              )}
              {webhookData.payer_amount_exchange_rate && (
                <DetailRow
                  label="Exchange Rate"
                  value={`1 ${webhookData.payer_currency} = $${parseFloat(webhookData.payer_amount_exchange_rate).toLocaleString()}`}
                />
              )}
              {webhookData.payment_amount_usd && (
                <DetailRow label="Payment Amount (USD)" value={`$${parseFloat(webhookData.payment_amount_usd).toFixed(2)}`} />
              )}
              {webhookData.merchant_amount && (
                <DetailRow label="Merchant Receives" value={`${parseFloat(webhookData.merchant_amount).toFixed(8)} ${webhookData.payer_currency}`} />
              )}
              {webhookData.commission && (
                <DetailRow label="Network Fee" value={`${parseFloat(webhookData.commission).toFixed(8)} ${webhookData.payer_currency}`} />
              )}
              {webhookData.from && (
                <DetailRow
                  label="From Address"
                  value={`${webhookData.from.substring(0, 10)}...${webhookData.from.substring(webhookData.from.length - 10)}`}
                  copyable
                  onCopy={() => copyToClipboard(webhookData.from, 'Address')}
                />
              )}
            </View>
          )}

          {/* Financial Summary Card */}
          <View style={[styles.card, { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2', borderColor: isCredit ? '#10B981' : '#EF4444', borderWidth: 1 }]}>
            <Text style={styles.cardTitle}>Financial Summary</Text>
            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Transaction Amount</Text>
              <Text style={[styles.summaryValue, { color: isCredit ? '#10B981' : '#EF4444' }]}>
                {isCredit ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
              </Text>
            </View>

            {webhookData.commission && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Network Fee</Text>
                <Text style={styles.summaryValueSmall}>
                  ${(parseFloat(webhookData.commission) * parseFloat(webhookData.payer_amount_exchange_rate || 0)).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.divider, { marginVertical: 12 }]} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Total</Text>
              <Text style={[styles.summaryValueBold, { color: isCredit ? '#10B981' : '#EF4444' }]}>
                {isCredit ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)} {transaction.currency}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.primaryBtn}>
              <DownloadIcon />
              <Text style={styles.primaryBtnText}>Download Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn}>
              <SupportIcon />
              <Text style={styles.secondaryBtnText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M12 16V12M12 8H12.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.infoText}>
              All transactions are secured and encrypted. For questions about this transaction, please contact our support team with the transaction ID.
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Toast */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
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
          <CheckCircleIcon />
          <Text style={styles.toastText}>Copied to clipboard</Text>
        </Animated.View>
      )}
    </View>
  );
}

// Timeline Item Component
const TimelineItem = ({
  label,
  date,
  time,
  isFirst = false,
  isLast = false,
}: {
  label: string;
  date: string;
  time: string;
  isFirst?: boolean;
  isLast?: boolean;
}) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeftSide}>
      <View style={[styles.timelineDot, isFirst && styles.timelineDotActive]} />
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <Text style={styles.timelineLabel}>{label}</Text>
      <Text style={styles.timelineDate}>{date}</Text>
      <Text style={styles.timelineTime}>{time}</Text>
    </View>
  </View>
);

// Detail Row Component
const DetailRow = ({
  label,
  value,
  copyable = false,
  onCopy,
  badge = false,
  badgeColor = '#111827',
  badgeBg = '#F3F4F6',
  highlight = false,
  highlightColor = '#111827',
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  badge?: boolean;
  badgeColor?: string;
  badgeBg?: string;
  highlight?: boolean;
  highlightColor?: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueContainer}>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{value}</Text>
        </View>
      ) : (
        <Text
          style={[
            styles.detailValue,
            highlight && { color: highlightColor, fontWeight: '700' },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {copyable && (
        <TouchableOpacity onPress={onCopy} style={styles.copyBtn}>
          <CopyIcon color="#3B82F6" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 32,
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
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  heroAmount: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  currencyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1.2,
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyBtn: {
    padding: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  timelineLeftSide: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#fff',
  },
  timelineDotActive: {
    backgroundColor: '#3B82F6',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 8,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryValueBold: {
    fontSize: 20,
    fontWeight: '800',
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
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
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
