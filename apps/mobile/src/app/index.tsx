import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { DynamicOrb } from '../components/DynamicOrb';
import ChatSection from '../components/ChatSection';
import { Hexagon, HexBar } from '../components/Hexagon';
import ParallaxDotBackground from '../components/ParallaxDotBackground';
import { useAssistant } from '../hooks/useAssistant';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state: voiceState, toggleListening } = useAssistant();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const mainScrollRef = useRef<ScrollView>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.96,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        if (e.endCoordinates?.height) {
          setKeyboardHeight(e.endCoordinates.height);
        }
        setTimeout(() => {
          mainScrollRef.current?.scrollToEnd({ animated: true });
        }, 50);
        setTimeout(() => {
          mainScrollRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      mainScrollRef.current?.scrollToEnd({ animated: true });
    }, 60);
    setTimeout(() => {
      mainScrollRef.current?.scrollToEnd({ animated: true });
    }, 220);
  };

  const headerTop = Math.max(insets.top + 8, 18);
  const bottomNavBottom = Math.max(insets.bottom + 10, 18);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerTop + 60 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" translucent />

      {/* ── 3D PARALLAX BACKGROUND ── */}
      <ParallaxDotBackground />

      {/* ── CENTRAL ZONE: DYNAMIC ORB & CHAT ── */}
      <ScrollView
        ref={mainScrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContentContainer,
          {
            paddingTop: isKeyboardVisible ? headerTop + 60 : headerTop + 85,
            paddingBottom: isKeyboardVisible ? 120 : bottomNavBottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={[styles.coreContainer, isKeyboardVisible && styles.coreContainerCompact]}>
          {/* Glowing Siri-Style Dynamic Orb Hero */}
          <TouchableOpacity
            style={styles.orbCenterWrap}
            activeOpacity={0.85}
            onPress={toggleListening}
          >
            <DynamicOrb state={voiceState} size={isKeyboardVisible ? 90 : 160} />
          </TouchableOpacity>
        </View>

        {/* ── CHAT SECTION ── */}
        <ChatSection onFocusInput={scrollToBottom} />
      </ScrollView>

      {/* ── FLOATING HEADER ── */}
      <View style={[styles.floatingHeaderWrap, { top: headerTop }]}>
        <HexBar
          height={62}
          fill="rgba(32, 32, 32, 0.95)"
          stroke="rgba(93, 214, 44, 0.4)"
          contentStyle={styles.floatingHeaderContent}
        >
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#f8f8f8" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>JACK</Text>
          </View>

          <View style={styles.headerRightGroup}>
            <View style={styles.latencyBadge}>
              <Text style={styles.latencyText}>12 ms</Text>
              <MaterialCommunityIcons name="wifi" size={15} color="#5DD62C" style={styles.wifiIcon} />
            </View>
            <Hexagon size={34} fill="#337418" stroke="#5DD62C" strokeWidth={1.5}>
              <Text style={styles.headerAvatarLetter}>J</Text>
            </Hexagon>
          </View>
        </HexBar>
      </View>

      {/* ── FLOATING BOTTOM NAV (Hidden automatically when keyboard is typing) ── */}
      {!isKeyboardVisible && (
        <View style={[styles.floatingBottomNavWrap, { bottom: bottomNavBottom }]}>
          <HexBar
            height={76}
            fill="rgba(32, 32, 32, 0.95)"
            stroke="rgba(93, 214, 44, 0.4)"
            contentStyle={styles.floatingBottomNavContent}
          >
            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => router.replace('/pendientes')}
            >
              <MaterialIcons name="checklist" size={24} color="#5DD62C" />
              <Text style={styles.navItemLabel}>PENDIENTES</Text>
            </TouchableOpacity>

            <View style={styles.centerButtonContainer}>
              <TouchableOpacity
                style={styles.centerButtonWrap}
                activeOpacity={0.8}
                onPress={toggleListening}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }], position: 'absolute' }}>
                  <Hexagon
                    size={68}
                    fill="transparent"
                    stroke={voiceState === 'listening' ? '#ec4899' : 'rgba(93, 214, 44, 0.7)'}
                    strokeWidth={1.5}
                  />
                </Animated.View>
                <Hexagon
                  size={60}
                  fill={voiceState === 'listening' ? '#ec4899' : '#337418'}
                  stroke={voiceState === 'listening' ? '#ec4899' : 'rgba(93, 214, 44, 0.9)'}
                  strokeWidth={1.5}
                  style={styles.centerHexGlow}
                >
                  <MaterialIcons
                    name={voiceState === 'listening' ? 'mic' : 'graphic-eq'}
                    size={28}
                    color="#f8f8f8"
                  />
                </Hexagon>
                <View style={styles.boltBadgePos}>
                  <Hexagon
                    size={22}
                    fill="#202020"
                    stroke="rgba(93, 214, 44, 0.8)"
                  >
                    <MaterialIcons name="bolt" size={13} color="#5DD62C" />
                  </Hexagon>
                </View>
              </TouchableOpacity>
              <Text style={styles.centerButtonLabel}>ASISTENTE</Text>
            </View>

            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => router.replace('/cuentas')}
            >
              <MaterialIcons name="account-balance-wallet" size={24} color="#5DD62C" />
              <Text style={styles.navItemLabel}>CUENTAS</Text>
            </TouchableOpacity>
          </HexBar>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollContainer: {
    flex: 1,
    zIndex: 10,
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  coreContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  coreContainerCompact: {
    width: 100,
    height: 100,
    marginVertical: 4,
  },
  orbCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },

  // FLOATING HEADER
  floatingHeaderWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingHeaderContent: {
    justifyContent: 'space-between',
  },
  menuButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Demonized',
    fontSize: 22,
    fontWeight: '700',
    color: '#f8f8f8',
    letterSpacing: 1.5,
  },
  headerAvatarLetter: {
    fontSize: 16,
    fontWeight: '900',
    color: '#5DD62C',
    fontFamily: 'Demonized',
  },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  latencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  latencyText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '600',
    color: '#5DD62C',
    letterSpacing: -0.3,
  },
  wifiIcon: { shadowColor: '#5DD62C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6 },

  // FLOATING BOTTOM NAV
  floatingBottomNavWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 14,
  },
  floatingBottomNavContent: {
    justifyContent: 'space-around',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 68, paddingVertical: 6 },
  navItemLabel: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#5DD62C',
    marginTop: 4,
    letterSpacing: 0.8,
  },
  centerButtonContainer: { alignItems: 'center', marginTop: -28 },
  centerButtonWrap: {
    width: 68,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerHexGlow: {
    shadowColor: '#337418',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  boltBadgePos: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  centerButtonLabel: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#f8f8f8',
    marginTop: 4,
    letterSpacing: 1.2,
  },
});
