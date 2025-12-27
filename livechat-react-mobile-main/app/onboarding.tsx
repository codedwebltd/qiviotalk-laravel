import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Connect with\nYour Customers',
    description: 'Engage with customers in real-time through seamless chat experiences',
    bgColor: '#0A2540',
    accentColor: '#1E3A5F',
  },
  {
    id: '2',
    title: 'Manage Everything\nin One Place',
    description: 'Handle all conversations efficiently with our intuitive dashboard',
    bgColor: '#0A2540',
    accentColor: '#1E3A5F',
  },
  {
    id: '3',
    title: 'Never Miss\na Message',
    description: 'Stay connected with instant notifications and automated responses',
    bgColor: '#0A2540',
    accentColor: '#1E3A5F',
  },
];

// Custom Illustration Components
const ChatIllustration = () => (
  <View style={illustrationStyles.chatContainer}>
    {/* Left chat bubble with dots */}
    <View style={illustrationStyles.leftBubble}>
      <View style={illustrationStyles.dotRow}>
        <View style={illustrationStyles.whiteDot} />
        <View style={illustrationStyles.whiteDot} />
        <View style={illustrationStyles.whiteDot} />
      </View>
    </View>
    
    {/* Center person */}
    <View style={illustrationStyles.personCenter}>
      <View style={illustrationStyles.personHead} />
      <View style={illustrationStyles.personBody} />
    </View>
    
    {/* Right wave bubble */}
    <View style={illustrationStyles.rightBubble}>
      <Text style={illustrationStyles.waveEmoji}>👋</Text>
    </View>
  </View>
);

const InboxIllustration = () => (
  <View style={illustrationStyles.inboxContainer}>
    <View style={[illustrationStyles.inboxCard, { backgroundColor: '#3B82F6' }]}>
      <View style={illustrationStyles.avatar} />
      <View style={illustrationStyles.cardContent}>
        <View style={[illustrationStyles.cardLine, { width: '70%' }]} />
        <View style={illustrationStyles.cardLineSmall} />
      </View>
    </View>
    <View style={[illustrationStyles.inboxCard, { backgroundColor: '#2563EB', opacity: 0.9 }]}>
      <View style={[illustrationStyles.avatar, { backgroundColor: '#10B981' }]} />
      <View style={illustrationStyles.cardContent}>
        <View style={[illustrationStyles.cardLine, { width: '80%' }]} />
        <View style={illustrationStyles.cardLineSmall} />
      </View>
    </View>
    <View style={[illustrationStyles.inboxCard, { backgroundColor: '#1D4ED8', opacity: 0.8 }]}>
      <View style={[illustrationStyles.avatar, { backgroundColor: '#F59E0B' }]} />
      <View style={illustrationStyles.cardContent}>
        <View style={[illustrationStyles.cardLine, { width: '65%' }]} />
        <View style={illustrationStyles.cardLineSmall} />
      </View>
    </View>
  </View>
);

const NotificationIllustration = () => (
  <View style={illustrationStyles.notifContainer}>
    <View style={illustrationStyles.bellContainer}>
      <Text style={illustrationStyles.bellIcon}>🔔</Text>
      <View style={illustrationStyles.badge}>
        <Text style={illustrationStyles.badgeText}>5</Text>
      </View>
    </View>
    <View style={illustrationStyles.notifCards}>
      <View style={illustrationStyles.notifCard} />
      <View style={[illustrationStyles.notifCard, { backgroundColor: '#10B981' }]} />
    </View>
  </View>
);

const illustrationStyles = StyleSheet.create({
  chatContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  leftBubble: {
    position: 'absolute',
    left: 20,
    top: 60,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
  },
  whiteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  personCenter: {
    alignItems: 'center',
    zIndex: 1,
  },
  personHead: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDB022',
  },
  personBody: {
    width: 120,
    height: 150,
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    marginTop: -15,
  },
  rightBubble: {
    position: 'absolute',
    right: 20,
    bottom: 50,
    backgroundColor: '#FDB022',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  waveEmoji: {
    fontSize: 28,
  },
  inboxContainer: {
    width: 280,
    height: 240,
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  inboxCard: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDB022',
  },
  cardContent: {
    flex: 1,
    gap: 10,
  },
  cardLine: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 5,
  },
  cardLineSmall: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    width: '50%',
  },
  notifContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 100,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0A2540',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  notifCards: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 50,
  },
  notifCard: {
    width: 90,
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ 
        index: currentIndex + 1,
        animated: true 
      });
    } else {
      router.replace('./login' as any);
    }
  };

  const handleSkip = () => {
    router.replace('./login' as any);
  };

  const renderIllustration = (index: number) => {
    if (index === 0) {
      return <ChatIllustration />;
    } else if (index === 1) {
      return <InboxIllustration />;
    } else {
      return <NotificationIllustration />;
    }
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0], index: number }) => (
    <View style={[styles.slide, { backgroundColor: item.bgColor }]}>
      <View style={styles.contentContainer}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          {renderIllustration(index)}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />
      
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            onPress={handleNext} 
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {currentIndex < slides.length - 1 ? (
            <TouchableOpacity 
              onPress={handleSkip} 
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => router.replace('./login' as any)} 
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Log in</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  slide: {
    width,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 180,
  },
illustrationContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  textContainer: {
    paddingHorizontal: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 30,
    paddingHorizontal: 30,
    backgroundColor: '#0A2540',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#10B981',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#0A2540',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});