import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatSection from '../components/ChatSection';
import { Hexagon, HexBar, HexImage } from '../components/Hexagon';
import ParallaxDotBackground from '../components/ParallaxDotBackground';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const mainScrollRef = useRef<ScrollView>(null);

  // ── Animated values ─────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinReverseAnim = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pulse / breathing
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.2, duration: 2400,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 1, duration: 2400,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.94, duration: 2400,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.45, duration: 2400,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 2. CW orbit 24s
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1, duration: 24000,
        easing: Easing.linear, useNativeDriver: true,
      })
    ).start();

    // 3. CCW orbit 36s
    Animated.loop(
      Animated.timing(spinReverseAnim, {
        toValue: 1, duration: 36000,
        easing: Easing.linear, useNativeDriver: true,
      })
    ).start();

    // 4. Concentric expanding waves
    const runWave = (anim: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1, duration: 3300,
              easing: Easing.out(Easing.cubic), useNativeDriver: true,
            }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        ),
      ]).start();
    };
    runWave(wave1, 0);
    runWave(wave2, 1100);
    runWave(wave3, 2200);

    // Keyboard listeners for dynamic integration
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          mainScrollRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinReverse = spinReverseAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  const getWaveStyle = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.75] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0.9, 0.75, 0.25, 0] }),
  });

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" translucent />

      {/* ── 3D PARALLAX BACKGROUND (gyroscope-driven) ── */}
      <ParallaxDotBackground />

      {/* ── CENTRAL ZONE: CORE, RINGS, WAVES, EMBLEM & EXPANDABLE CHAT ── */}
      <ScrollView
        ref={mainScrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContentContainer,
          {
            paddingTop: Math.max(insets.top + 72, 80),
            paddingBottom: isKeyboardVisible ? 20 : Math.max(insets.bottom + 90, 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.coreContainer}>
          {/* Concentric waves */}
          <Animated.View style={[styles.waveCircle, styles.waveCyan, getWaveStyle(wave1)]} />
          <Animated.View style={[styles.waveCircle, styles.wavePurple, getWaveStyle(wave2)]} />
          <Animated.View style={[styles.waveCircle, styles.wavePink, getWaveStyle(wave3)]} />

          {/* Pulse aura ring */}
          <Animated.View
            style={[styles.pulseAuraRing, { transform: [{ scale: pulseAnim }], opacity: glowOpacity }]}
          />

          {/* Outer orbital ring CW */}
          <Animated.View style={[styles.orbitalOuterRing, { transform: [{ rotate: spin }] }]}>
            <View style={[styles.marker, styles.markerTop]} />
            <View style={[styles.marker, styles.markerBottom]} />
            <View style={[styles.marker, styles.markerLeft]} />
            <View style={[styles.marker, styles.markerRight]} />
          </Animated.View>

          {/* Inner dashed ring CCW */}
          <Animated.View style={[styles.orbitalInnerDashed, { transform: [{ rotate: spinReverse }] }]} />

          {/* Central emblem */}
          <TouchableOpacity style={styles.emblemWrapper} activeOpacity={0.9}>
            <Hexagon
              size={170}
              fill="#337418"
              stroke="#5DD62C"
              strokeWidth={3}
              style={styles.emblemHexGlow}
            >
              <Text style={styles.emblemLetterJ}>J</Text>
            </Hexagon>
          </TouchableOpacity>

          {/* HUD coordinates */}
          <View style={styles.coordsRow} pointerEvents="none">
            <Text style={styles.coordCyanText}>090°</Text>
            <Text style={styles.coordLavenderText}>270°</Text>
          </View>
        </View>

        {/* ── CHAT SECTION (EXPANDABLE, VOICE RECOGNITION, BLACK BACKGROUND, GREEN BORDERS) ── */}
        <ChatSection
          onFocusInput={() => {
            setTimeout(() => {
              mainScrollRef.current?.scrollToEnd({ animated: true });
            }, 150);
          }}
        />
      </ScrollView>

      {/* ── FLOATING HEADER ── */}
      <View style={[styles.floatingHeaderWrap, { top: Math.max(insets.top + 8, 18) }]}>
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
            <Text style={styles.headerTitle}>Jack</Text>
          </View>

          <View style={styles.headerRightGroup}>
            <View style={styles.latencyBadge}>
              <Text style={styles.latencyText}>12 ms</Text>
              <MaterialCommunityIcons name="wifi" size={15} color="#5DD62C" style={styles.wifiIcon} />
            </View>
            <Hexagon size={34} fill="#337418" stroke="#5DD62C" strokeWidth={1.5}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#5DD62C' }}>J</Text>
            </Hexagon>
          </View>
        </HexBar>
      </View>

      {/* ── FLOATING BOTTOM NAV ── */}
      {!isKeyboardVisible && (
        <View style={[styles.floatingBottomNavWrap, { bottom: Math.max(insets.bottom + 10, 18) }]}>
          <HexBar
            height={76}
            fill="rgba(32, 32, 32, 0.95)"
            stroke="rgba(93, 214, 44, 0.4)"
            contentStyle={styles.floatingBottomNavContent}
          >
            <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/pendientes')}>
              <MaterialIcons name="checklist" size={24} color="#5DD62C" />
              <Text style={styles.navItemLabel}>PENDIENTES</Text>
            </TouchableOpacity>

            <View style={styles.centerButtonContainer}>
              <View style={styles.centerButtonWrap}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }], position: 'absolute' }}>
                  <Hexagon
                    size={68}
                    fill="transparent"
                    stroke="rgba(93, 214, 44, 0.7)"
                    strokeWidth={1.5}
                  />
                </Animated.View>
                <Hexagon
                  size={60}
                  fill="#337418"
                  stroke="rgba(93, 214, 44, 0.9)"
                  strokeWidth={1.5}
                  style={styles.centerHexGlow}
                >
                  <MaterialIcons name="graphic-eq" size={28} color="#f8f8f8" />
                </Hexagon>
                <TouchableOpacity style={styles.boltBadgePos} activeOpacity={0.7}>
                  <Hexagon
                    size={22}
                    fill="#202020"
                    stroke="rgba(93, 214, 44, 0.8)"
                  >
                    <MaterialIcons name="bolt" size={13} color="#5DD62C" />
                  </Hexagon>
                </TouchableOpacity>
              </View>
              <Text style={styles.centerButtonLabel}>ASISTENTE</Text>
            </View>

            <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/cuentas')}>
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
    position: 'relative',
    overflow: 'hidden',
  },

  // ── CENTRAL ZONE ──────────────────────────────────────────────────────────
  scrollContainer: {
    flex: 1,
    zIndex: 10,
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  coreContainer: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },

  // PULSE AURA RING
  pulseAuraRing: {
    position: 'absolute',
    width: 260, height: 260, borderRadius: 130,
    borderWidth: 1.5, borderColor: 'rgba(93, 214, 44, 0.45)',
    backgroundColor: 'transparent',
    shadowColor: '#5DD62C', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 18,
  },

  // EXPANDING WAVES
  waveCircle: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    borderWidth: 1.5, backgroundColor: 'transparent',
  },
  waveCyan: { borderColor: 'rgba(93, 214, 44, 0.8)' },
  wavePurple: { borderColor: 'rgba(51, 116, 24, 0.7)' },
  wavePink: { borderColor: 'rgba(93, 214, 44, 0.5)' },

  // ORBITAL RINGS
  orbitalOuterRing: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    borderWidth: 1.5, borderColor: 'rgba(93, 214, 44, 0.3)',
    backgroundColor: 'transparent',
  },
  marker: { position: 'absolute', borderRadius: 2, shadowOpacity: 1, shadowRadius: 8 },
  markerTop: { top: -3, left: '50%', marginLeft: -5, width: 10, height: 4, backgroundColor: '#5DD62C', shadowColor: '#5DD62C' },
  markerBottom: { bottom: -3, left: '50%', marginLeft: -5, width: 10, height: 4, backgroundColor: '#337418', shadowColor: '#337418' },
  markerLeft: { left: -3, top: '50%', marginTop: -5, width: 4, height: 10, backgroundColor: '#5DD62C', shadowColor: '#5DD62C' },
  markerRight: { right: -3, top: '50%', marginTop: -5, width: 4, height: 10, backgroundColor: '#337418', shadowColor: '#337418' },
  orbitalInnerDashed: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    borderWidth: 1.5, borderColor: 'rgba(93, 214, 44, 0.4)',
    borderStyle: 'dashed', backgroundColor: 'transparent',
  },

  // CENTRAL EMBLEM
  emblemWrapper: {
    width: 250, height: 250, alignItems: 'center', justifyContent: 'center',
    zIndex: 15, backgroundColor: 'transparent',
  },
  emblemHexGlow: {
    shadowColor: '#5DD62C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 28,
    elevation: 16,
  },
  emblemLetterJ: {
    fontFamily: 'Demonized',
    fontSize: 90,
    fontWeight: '900',
    color: '#5DD62C',
    textShadowColor: 'rgba(93, 214, 44, 0.9)',
    textShadowRadius: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },

  // HUD COORDINATES
  coordsRow: {
    position: 'absolute', width: 300, flexDirection: 'row',
    justifyContent: 'space-between', paddingHorizontal: 8,
    zIndex: 20, backgroundColor: 'transparent',
  },
  coordCyanText: {
    fontSize: 11, fontWeight: '700', color: '#5DD62C', letterSpacing: -0.5,
    textShadowColor: 'rgba(93, 214, 44, 0.8)', textShadowRadius: 6,
  },
  coordLavenderText: {
    fontSize: 11, fontWeight: '700', color: '#f8f8f8', letterSpacing: -0.5,
    textShadowColor: 'rgba(248, 248, 248, 0.8)', textShadowRadius: 6,
  },


  // FLOATING HEADER
  floatingHeaderWrap: {
    position: 'absolute', left: 16, right: 16, zIndex: 50,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },
  floatingHeaderContent: {
    justifyContent: 'space-between',
  },
  menuButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Demonized',
    fontSize: 22, fontWeight: '700', color: '#f8f8f8', letterSpacing: -0.5,
  },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  latencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  latencyText: { fontSize: 11, fontWeight: '600', color: '#5DD62C', letterSpacing: -0.3 },
  wifiIcon: { shadowColor: '#5DD62C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6 },

  // FLOATING BOTTOM NAV
  floatingBottomNavWrap: {
    position: 'absolute', left: 16, right: 16, zIndex: 50,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65, shadowRadius: 20, elevation: 14,
  },
  floatingBottomNavContent: {
    justifyContent: 'space-around',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 68, paddingVertical: 6 },
  navItemLabel: { fontSize: 9, fontWeight: '700', color: '#5DD62C', marginTop: 4, letterSpacing: 0.8 },
  centerButtonContainer: { alignItems: 'center', marginTop: -28 },
  centerButtonWrap: {
    width: 68, height: 60, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  centerHexGlow: {
    shadowColor: '#337418', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8, shadowRadius: 16, elevation: 12,
  },
  boltBadgePos: {
    position: 'absolute', top: -2, right: -2,
  },
  centerButtonLabel: {
    fontSize: 9, fontWeight: '700', color: '#f8f8f8', marginTop: 4, letterSpacing: 1.2,
  },
});
