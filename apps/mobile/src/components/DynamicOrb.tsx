import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { VoiceState } from '../hooks/useVoiceEngine';

interface DynamicOrbProps {
  state: VoiceState;
  size?: number;
}

export const DynamicOrb: React.FC<DynamicOrbProps> = ({ state, size = 180 }) => {
  const coreScale = useSharedValue(1);
  const auraScale = useSharedValue(1);
  const outerRingScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  const auraOpacity = useSharedValue(0.6);

  useEffect(() => {
    // 0: idle (green #5DD62C), 1: listening (red/amber #ef4444), 2: processing (purple #8b5cf6), 3: speaking (emerald #10b981)
    switch (state) {
      case 'idle':
        colorProgress.value = withTiming(0, { duration: 500 });
        auraOpacity.value = withTiming(0.45, { duration: 500 });

        // Slow, subtle ambient breathing (1800ms loop, 1.05x)
        coreScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.95, { duration: 1800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        auraScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.9, { duration: 2200, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        outerRingScale.value = withRepeat(
          withSequence(
            withTiming(1.25, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 2600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        rotation.value = withRepeat(
          withTiming(360, { duration: 24000, easing: Easing.linear }),
          -1,
          false
        );
        break;

      case 'listening':
        colorProgress.value = withTiming(1, { duration: 250 });
        auraOpacity.value = withTiming(0.85, { duration: 250 });

        // Rapid fast pulsing (500ms loop, 1.25x scale)
        coreScale.value = withRepeat(
          withSequence(
            withTiming(1.25, { duration: 500, easing: Easing.out(Easing.ease) }),
            withTiming(0.9, { duration: 500, easing: Easing.in(Easing.ease) })
          ),
          -1,
          true
        );

        auraScale.value = withRepeat(
          withSequence(
            withTiming(1.45, { duration: 500, easing: Easing.out(Easing.ease) }),
            withTiming(0.95, { duration: 500, easing: Easing.in(Easing.ease) })
          ),
          -1,
          true
        );

        outerRingScale.value = withRepeat(
          withSequence(
            withTiming(1.6, { duration: 600, easing: Easing.out(Easing.ease) }),
            withTiming(1.05, { duration: 600, easing: Easing.in(Easing.ease) })
          ),
          -1,
          true
        );

        rotation.value = withRepeat(
          withTiming(360, { duration: 6000, easing: Easing.linear }),
          -1,
          false
        );
        break;

      case 'processing':
        colorProgress.value = withTiming(2, { duration: 300 });
        auraOpacity.value = withTiming(0.75, { duration: 300 });

        // Rapid spinning and pulsation frequency
        coreScale.value = withRepeat(
          withSequence(
            withTiming(1.12, { duration: 400, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.96, { duration: 400, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          true
        );

        auraScale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.98, { duration: 700, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        outerRingScale.value = withRepeat(
          withSequence(
            withTiming(1.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        rotation.value = withRepeat(
          withTiming(360, { duration: 1200, easing: Easing.linear }),
          -1,
          false
        );
        break;

      case 'speaking':
        colorProgress.value = withTiming(3, { duration: 300 });
        auraOpacity.value = withTiming(0.8, { duration: 300 });

        // Fluid rhythmic dynamic pulse (600ms loop, 1.18x scale)
        coreScale.value = withRepeat(
          withSequence(
            withTiming(1.18, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
            withTiming(0.98, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
          ),
          -1,
          true
        );

        auraScale.value = withRepeat(
          withSequence(
            withTiming(1.38, { duration: 350, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.95, { duration: 350, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        outerRingScale.value = withRepeat(
          withSequence(
            withTiming(1.5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        rotation.value = withRepeat(
          withTiming(360, { duration: 8000, easing: Easing.linear }),
          -1,
          false
        );
        break;
    }
  }, [state]);

  const animatedCoreStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      ['#5DD62C', '#ef4444', '#8b5cf6', '#10b981']
    );

    return {
      transform: [
        { scale: coreScale.value },
        { rotate: `${rotation.value}deg` },
      ],
      backgroundColor: color,
      shadowColor: color,
    };
  });

  const animatedAuraStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      ['rgba(93, 214, 44, 0.65)', 'rgba(239, 68, 68, 0.75)', 'rgba(139, 92, 246, 0.75)', 'rgba(16, 185, 129, 0.75)']
    );
    const glowColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      ['#5DD62C', '#ef4444', '#8b5cf6', '#10b981']
    );

    return {
      transform: [{ scale: auraScale.value }],
      borderColor,
      opacity: auraOpacity.value,
      shadowColor: glowColor,
    };
  });

  const animatedOuterRingStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      ['rgba(93, 214, 44, 0.35)', 'rgba(239, 68, 68, 0.45)', 'rgba(139, 92, 246, 0.45)', 'rgba(16, 185, 129, 0.45)']
    );

    return {
      transform: [
        { scale: outerRingScale.value },
        { rotate: `-${rotation.value * 0.7}deg` },
      ],
      borderColor,
    };
  });

  const coreSize = size * 0.62;
  const auraSize = size * 0.88;
  const outerSize = size * 1.15;

  return (
    <View style={[styles.container, { width: size * 1.3, height: size * 1.3 }]}>
      {/* Outer Glow Ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
          },
          animatedOuterRingStyle,
        ]}
      />

      {/* Mid Aura Ring */}
      <Animated.View
        style={[
          styles.auraRing,
          {
            width: auraSize,
            height: auraSize,
            borderRadius: auraSize / 2,
          },
          animatedAuraStyle,
        ]}
      />

      {/* Minimalist Glowing Core */}
      <Animated.View
        style={[
          styles.core,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
          },
          animatedCoreStyle,
        ]}
      >
        {/* Inner core specular highlight */}
        <View
          style={[
            styles.innerHighlight,
            {
              width: coreSize * 0.45,
              height: coreSize * 0.45,
              borderRadius: (coreSize * 0.45) / 2,
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
  outerRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  auraRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 14,
  },
  core: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 36,
    elevation: 24,
  },
  innerHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
