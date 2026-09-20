import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { VoiceState } from '../hooks/useVoiceEngine';

interface VoiceButtonProps {
  state: VoiceState;
  onPress: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ state, onPress, disabled = false }) => {
  const getButtonContent = () => {
    switch (state) {
      case 'listening':
        return { label: 'Escuchando...', bg: '#ef4444', icon: '🔴' };
      case 'processing':
        return { label: 'Pensando...', bg: '#8b5cf6', icon: '⏳' };
      case 'speaking':
        return { label: 'Hablando...', bg: '#10b981', icon: '🔊' };
      default:
        return { label: 'Tocar para hablar', bg: '#3b82f6', icon: '🎙️' };
    }
  };

  const { label, bg, icon } = getButtonContent();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: bg }]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
