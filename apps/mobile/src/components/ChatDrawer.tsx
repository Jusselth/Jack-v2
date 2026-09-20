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
          <Text style={styles.headerTitle}>Transcripción y Respuestas</Text>
          <Text style={styles.headerAction}>{isOpen ? 'Ocultar ▼' : 'Mostrar ▲'}</Text>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          {liveTranscript ? (
            <View style={styles.liveBox}>
              <Text style={styles.liveLabel}>En vivo:</Text>
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
                    {msg.sender === 'user' ? 'Tú' : msg.agent ? `Jack (${msg.agent})` : 'Jack'}
                  </Text>
                  <Text style={styles.timestamp}>{msg.timestamp}</Text>
                </View>
                <Text style={styles.messageText}>{msg.content}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.clearBtn} onPress={clearMessages}>
            <Text style={styles.clearBtnText}>Limpiar Historial</Text>
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
    borderColor: '#27272a',
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
    backgroundColor: '#27272a',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#71717a',
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    color: '#f4f4f5',
    fontWeight: '600',
    fontSize: 13,
  },
  headerAction: {
    color: '#3b82f6',
    fontWeight: '500',
    fontSize: 12,
  },
  body: {
    padding: 12,
    maxHeight: 320,
  },
  liveBox: {
    backgroundColor: '#27272a',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  liveLabel: {
    color: '#ef4444',
    fontSize: 11,
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
    backgroundColor: '#1e3a8a',
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  assistantMessage: {
    backgroundColor: '#27272a',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#a1a1aa',
    fontSize: 10,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
  },
  clearBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#71717a',
    fontSize: 11,
  },
});
