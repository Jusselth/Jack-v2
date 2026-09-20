import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    // Reset defaults when state switches
    rotation.value = 0;

    switch (state) {
      case 'idle':
        colorProgress.value = withTiming(0, { duration: 500 });
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'listening':
        colorProgress.value = withTiming(1, { duration: 300 });
        scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 400, easing: Easing.ease }),
            withTiming(0.9, { duration: 400, easing: Easing.ease })
          ),
          -1,
          true
        );
        break;
      case 'processing':
        colorProgress.value = withTiming(2, { duration: 300 });
        scale.value = withTiming(1, { duration: 300 });
        rotation.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          -1,
          false
        );
        break;
      case 'speaking':
        colorProgress.value = withTiming(3, { duration: 300 });
        scale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 250, easing: Easing.ease }),
            withTiming(0.98, { duration: 250, easing: Easing.ease })
          ),
          -1,
          true
        );
        break;
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      ['#3b82f6', '#ef4444', '#8b5cf6', '#10b981'] // Cyan/Blue, Red, Purple, Green
    );

    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      backgroundColor,
      shadowColor: backgroundColor,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.orb,
          { width: size, height: size, borderRadius: size / 2 },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
});
