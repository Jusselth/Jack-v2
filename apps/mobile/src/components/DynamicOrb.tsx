import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { VoiceState } from '../hooks/useVoiceEngine';

interface DynamicOrbProps {
  state: VoiceState;
  size?: number;
}

export const DynamicOrb: React.FC<DynamicOrbProps> = ({ state, size = 180 }) => {
  // Core sphere animation values
  const coreScale = useRef(new Animated.Value(1)).current;
  const coreGlowScale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const colorProgress = useRef(new Animated.Value(0)).current;

  // 3 Concentric Siri-style Ripple Wave Rings
  const wave1Scale = useRef(new Animated.Value(1)).current;
  const wave1Opacity = useRef(new Animated.Value(0.7)).current;

  const wave2Scale = useRef(new Animated.Value(1)).current;
  const wave2Opacity = useRef(new Animated.Value(0.7)).current;

  const wave3Scale = useRef(new Animated.Value(1)).current;
  const wave3Opacity = useRef(new Animated.Value(0.7)).current;

  const currentLoop = useRef<Animated.CompositeAnimation | null>(null);
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (currentLoop.current) currentLoop.current.stop();
    if (spinLoop.current) spinLoop.current.stop();

    let targetColor = 0;
    let waveDuration = 2400;
    let coreDuration = 1800;
    let maxWaveScale = 1.9;
    let spinDuration = 16000;

    if (state === 'idle') {
      targetColor = 0;
      waveDuration = 2600;
      coreDuration = 1800;
      maxWaveScale = 1.7;
      spinDuration = 16000;
    } else if (state === 'listening') {
      targetColor = 1;
      waveDuration = 1200;
      coreDuration = 600;
      maxWaveScale = 2.3;
      spinDuration = 4000;
    } else if (state === 'processing') {
      targetColor = 2;
      waveDuration = 900;
      coreDuration = 450;
      maxWaveScale = 2.1;
      spinDuration = 1500;
    } else if (state === 'speaking') {
      targetColor = 3;
      waveDuration = 1400;
      coreDuration = 500;
      maxWaveScale = 2.2;
      spinDuration = 6000;
    }

    // Color transition
    Animated.timing(colorProgress, {
      toValue: targetColor,
      duration: 350,
      useNativeDriver: false,
    }).start();

    // Helper for creating continuous ripple waves
    const createWaveLoop = (scaleAnim: Animated.Value, opacityAnim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 0,
                useNativeDriver: false,
              }),
              Animated.timing(scaleAnim, {
                toValue: maxWaveScale,
                duration: waveDuration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
              }),
            ]),
            Animated.sequence([
              Animated.timing(opacityAnim, {
                toValue: 0.75,
                duration: 0,
                useNativeDriver: false,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: waveDuration,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
            ]),
          ])
        ),
      ]);
    };

    // Core breathing pulsation
    const coreBreathing = Animated.loop(
      Animated.sequence([
        Animated.timing(coreScale, {
          toValue: state === 'listening' ? 1.2 : state === 'speaking' ? 1.15 : 1.06,
          duration: coreDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(coreScale, {
          toValue: 0.96,
          duration: coreDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    const glowPulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(coreGlowScale, {
          toValue: 1.25,
          duration: coreDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(coreGlowScale, {
          toValue: 0.92,
          duration: coreDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    currentLoop.current = Animated.parallel([
      coreBreathing,
      glowPulsing,
      createWaveLoop(wave1Scale, wave1Opacity, 0),
      createWaveLoop(wave2Scale, wave2Opacity, waveDuration * 0.33),
      createWaveLoop(wave3Scale, wave3Opacity, waveDuration * 0.66),
    ]);
    currentLoop.current.start();

    // Constant smooth rotation for iridescent orb
    rotation.setValue(0);
    spinLoop.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: spinDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    spinLoop.current.start();

    return () => {
      currentLoop.current?.stop();
      spinLoop.current?.stop();
    };
  }, [state]);

  // Color interpolations: 0: Idle (Electric Green/Cyan), 1: Listening (Siri Magenta/Amber), 2: Processing (Deep Violet), 3: Speaking (Cyan/Emerald)
  const coreBgColor = colorProgress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#5DD62C', '#ec4899', '#8b5cf6', '#06b6d4'],
  });

  const secondaryColor = colorProgress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#337418', '#ef4444', '#6366f1', '#10b981'],
  });

  const waveColor = colorProgress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      'rgba(93, 214, 44, 0.45)',
      'rgba(236, 72, 153, 0.55)',
      'rgba(139, 92, 246, 0.55)',
      'rgba(6, 182, 212, 0.55)',
    ],
  });

  const glowShadowColor = colorProgress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#5DD62C', '#ec4899', '#8b5cf6', '#06b6d4'],
  });

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const coreSize = size * 0.65;
  const waveBaseSize = coreSize;

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      {/* ── CONCENTRIC WAVE RIPPLE 3 ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.waveRing,
          {
            width: waveBaseSize,
            height: waveBaseSize,
            borderRadius: waveBaseSize / 2,
            borderColor: waveColor,
            opacity: wave3Opacity,
            transform: [{ scale: wave3Scale }],
          },
        ]}
      />

      {/* ── CONCENTRIC WAVE RIPPLE 2 ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.waveRing,
          {
            width: waveBaseSize,
            height: waveBaseSize,
            borderRadius: waveBaseSize / 2,
            borderColor: waveColor,
            opacity: wave2Opacity,
            transform: [{ scale: wave2Scale }],
          },
        ]}
      />

      {/* ── CONCENTRIC WAVE RIPPLE 1 ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.waveRing,
          {
            width: waveBaseSize,
            height: waveBaseSize,
            borderRadius: waveBaseSize / 2,
            borderColor: waveColor,
            opacity: wave1Opacity,
            transform: [{ scale: wave1Scale }],
          },
        ]}
      />

      {/* ── OUTER AURA GLOW ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.outerAura,
          {
            width: coreSize * 1.35,
            height: coreSize * 1.35,
            borderRadius: (coreSize * 1.35) / 2,
            backgroundColor: waveColor,
            shadowColor: glowShadowColor,
            transform: [{ scale: coreGlowScale }],
          },
        ]}
      />

      {/* ── SIRI-STYLE IRIDESCENT CORE SPHERE ── */}
      <Animated.View
        style={[
          styles.coreSphere,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
            backgroundColor: coreBgColor,
            shadowColor: glowShadowColor,
            transform: [{ scale: coreScale }, { rotate: spin }],
          },
        ]}
      >
        {/* Layered inner gradient nebula effect */}
        <Animated.View
          style={[
            styles.innerNebula,
            {
              width: coreSize * 0.85,
              height: coreSize * 0.85,
              borderRadius: (coreSize * 0.85) / 2,
              backgroundColor: secondaryColor,
            },
          ]}
        />

        {/* Specular light crest */}
        <View
          style={[
            styles.specularCrest,
            {
              width: coreSize * 0.42,
              height: coreSize * 0.28,
              borderRadius: coreSize * 0.2,
            },
          ]}
        />

        {/* Center core pinpoint highlight */}
        <View
          style={[
            styles.centerPinpoint,
            {
              width: coreSize * 0.22,
              height: coreSize * 0.22,
              borderRadius: (coreSize * 0.22) / 2,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  waveRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 6,
  },
  outerAura: {
    position: 'absolute',
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 36,
    elevation: 16,
  },
  coreSphere: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 20,
    overflow: 'hidden',
  },
  innerNebula: {
    position: 'absolute',
    opacity: 0.65,
    top: '10%',
    left: '10%',
  },
  specularCrest: {
    position: 'absolute',
    top: '12%',
    left: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ rotate: '-25deg' }],
  },
  centerPinpoint: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
});
