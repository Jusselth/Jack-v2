import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';

interface ChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  liveTranscript?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onToggle, liveTranscript }) => {
  const { messages, clearMessages } = useAppStore();

  return (
    <View style={[styles.container, isOpen ? styles.containerOpen : styles.containerClosed]}>
      <TouchableOpacity style={styles.header} activeOpacity={0.7} onPress={onToggle}>
        <View style={styles.handleBar} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>TRANCRIPCIÓN Y RESPUESTAS</Text>
          <Text style={styles.headerAction}>{isOpen ? 'OCULTAR ▼' : 'MOSTRAR ▲'}</Text>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          {liveTranscript ? (
            <View style={styles.liveBox}>
              <Text style={styles.liveLabel}>EN VIVO:</Text>
              <Text style={styles.liveText}>{liveTranscript}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageCard,
                  msg.sender === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <View style={styles.metaRow}>
                  <Text style={styles.senderName}>
                    {msg.sender === 'user' ? 'TÚ' : msg.agent ? `JACK (${msg.agent.toUpperCase()})` : 'JACK'}
                  </Text>
                  <Text style={styles.timestamp}>{msg.timestamp}</Text>
                </View>
                <Text style={styles.messageText}>{msg.content}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.clearBtn} onPress={clearMessages}>
            <Text style={styles.clearBtnText}>LIMPIAR HISTORIAL</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#18181b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  containerOpen: {
    maxHeight: 380,
  },
  containerClosed: {
    maxHeight: 46,
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#202020',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5DD62C',
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    fontFamily: 'Demonized',
    color: '#f8f8f8',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  headerAction: {
    fontFamily: 'Demonized',
    color: '#5DD62C',
    fontWeight: '700',
    fontSize: 10,
  },
  body: {
    padding: 12,
    maxHeight: 320,
  },
  liveBox: {
    backgroundColor: '#202020',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  liveLabel: {
    fontFamily: 'Demonized',
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveText: {
    color: '#e4e4e7',
    fontSize: 13,
    marginTop: 2,
  },
  scrollList: {
    maxHeight: 220,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 8,
  },
  messageCard: {
    padding: 10,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: '#337418',
    borderWidth: 1,
    borderColor: '#5DD62C',
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  assistantMessage: {
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    fontFamily: 'Demonized',
    color: '#5DD62C',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#a1a1aa',
    fontSize: 9,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
  },
  clearBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#202020',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
  },
  clearBtnText: {
    fontFamily: 'Demonized',
    color: '#5DD62C',
    fontSize: 10,
    fontWeight: '700',
  },
});
