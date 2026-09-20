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
        return { label: 'ESCUCHANDO...', bg: '#ef4444', icon: '🔴' };
      case 'processing':
        return { label: 'PENSANDO...', bg: '#8b5cf6', icon: '⏳' };
      case 'speaking':
        return { label: 'HABLANDO...', bg: '#10b981', icon: '🔊' };
      default:
        return { label: 'TOCAR PARA HABLAR', bg: '#337418', icon: '🎙️' };
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
    borderWidth: 1.5,
    borderColor: '#5DD62C',
    shadowColor: '#5DD62C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontFamily: 'Demonized',
    color: '#f8f8f8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
