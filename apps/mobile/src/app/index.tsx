import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { DynamicOrb } from '../components/DynamicOrb';
import { VoiceButton } from '../components/VoiceButton';
import { ChatDrawer } from '../components/ChatDrawer';
import { useAssistant } from '../hooks/useAssistant';

export default function IndexScreen() {
  const { state, transcript, toggleListening } = useAssistant();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getStateDescription = () => {
    switch (state) {
      case 'listening':
        return 'Escuchando tu voz...';
      case 'processing':
        return 'Procesando en LLM local...';
      case 'speaking':
        return 'Respondiendo...';
      default:
        return 'Listo para interactuar';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.title}>Jack Personal Assistant</Text>
        <Text style={styles.subtitle}>{getStateDescription()}</Text>
      </View>

      {/* Center Dynamic Orb */}
      <View style={styles.orbContainer}>
        <DynamicOrb state={state} size={200} />
      </View>

      {/* Transcript & Response Drawer */}
      <ChatDrawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen((prev) => !prev)}
        liveTranscript={transcript}
      />

      {/* Bottom Voice Button Trigger */}
      <View style={styles.bottomControls}>
        <VoiceButton state={state} onPress={toggleListening} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    paddingTop: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f4f4f5',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 6,
  },
  orbContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
