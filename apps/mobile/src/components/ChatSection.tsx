import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Hexagon } from './Hexagon';
import { useAppStore } from '../store/useAppStore';
import { useAssistant } from '../hooks/useAssistant';

const SUGGESTIONS = [
  { label: '⚡ Optimizar gastos', query: '¿Cómo puedo optimizar mis gastos de este mes?' },
  { label: '📋 Revisar pendientes', query: 'Mostrar mis tareas pendientes prioritarias' },
  { label: '📊 Resumen de jornada', query: 'Dame un resumen de mi jornada de hoy' },
];

interface ChatSectionProps {
  onFocusInput?: () => void;
}

export default function ChatSection({ onFocusInput }: ChatSectionProps) {
  const router = useRouter();
  const { messages, clearMessages, isTyping } = useAppStore();
  const { state: voiceState, transcript, toggleListening, sendMessage } = useAssistant();

  const [expanded, setExpanded] = useState(false);
  const [inputText, setInputText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Animations
  const expandAnim = useRef(new Animated.Value(0)).current;
  const micPulseAnim = useRef(new Animated.Value(1)).current;
  const wave1Anim = useRef(new Animated.Value(0.4)).current;
  const wave2Anim = useRef(new Animated.Value(0.6)).current;
  const wave3Anim = useRef(new Animated.Value(0.2)).current;
  const wave4Anim = useRef(new Animated.Value(0.5)).current;

  const isListening = voiceState === 'listening';

  // Toggle expand with animation
  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(expandAnim, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  // Mic Pulse & Wave animation loop when listening
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    let waveLoop: Animated.CompositeAnimation | null = null;

    if (isListening) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulseAnim, {
            toValue: 1.25,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(micPulseAnim, {
            toValue: 0.92,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      waveLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wave1Anim, { toValue: 1, duration: 300, useNativeDriver: false }),
            Animated.timing(wave1Anim, { toValue: 0.25, duration: 300, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave2Anim, { toValue: 0.2, duration: 350, useNativeDriver: false }),
            Animated.timing(wave2Anim, { toValue: 0.95, duration: 350, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave3Anim, { toValue: 0.9, duration: 280, useNativeDriver: false }),
            Animated.timing(wave3Anim, { toValue: 0.35, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave4Anim, { toValue: 0.3, duration: 400, useNativeDriver: false }),
            Animated.timing(wave4Anim, { toValue: 1, duration: 400, useNativeDriver: false }),
          ]),
        ])
      );
      waveLoop.start();
    } else {
      micPulseAnim.setValue(1);
      wave1Anim.setValue(0.4);
      wave2Anim.setValue(0.6);
      wave3Anim.setValue(0.2);
      wave4Anim.setValue(0.5);
    }

    return () => {
      if (pulseLoop) pulseLoop.stop();
      if (waveLoop) waveLoop.stop();
    };
  }, [isListening]);

  // Sync live transcription into the TextInput in real-time
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setInputText(transcript);
    }
  }, [transcript]);

  // When voice stops listening, focus text input so user can edit or send
  const prevListeningRef = useRef(isListening);
  useEffect(() => {
    if (prevListeningRef.current && !isListening) {
      if (inputText.trim()) {
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 150);
      }
    }
    prevListeningRef.current = isListening;
  }, [isListening, inputText]);

  // If new messages come in, auto-expand if collapsed and scroll down
  useEffect(() => {
    if (messages.length > 1 && !expanded) {
      setExpanded(true);
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages.length]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    if (!expanded) {
      setExpanded(true);
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }

    setInputText('');
    useAppStore.getState().setTranscript('');
    sendMessage(query);
  };


  const handleSuggestionPress = (query: string) => {
    handleSend(query);
  };

  const animatedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="creation" size={18} color="#5DD62C" style={{ marginRight: 6 }} />
          <Text style={styles.titleText}>¿En qué puedo optimizar tu jornada?</Text>
        </View>

        <TouchableOpacity
          style={styles.expandToggleButton}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>{expanded ? 'Plegar' : 'Expandir'}</Text>
          <MaterialIcons
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color="#5DD62C"
          />
        </TouchableOpacity>
      </View>

      {/* EXPANDABLE CHAT BODY */}
      {expanded && (
        <Animated.View style={[styles.chatBodyContainer, { height: animatedHeight }]}>
          {/* Status Sub-header */}
          <View style={styles.statusHeader}>
            <View style={styles.onlineBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>JACK IA • CONECTADO</Text>
            </View>
            <TouchableOpacity
              onPress={clearMessages}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <MaterialIcons name="cleaning-services" size={13} color="rgba(248, 248, 248, 0.6)" />
              <Text style={styles.clearText}>LIMPIAR</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Suggestions Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContainer}
          >
            {SUGGESTIONS.map((sugg, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                activeOpacity={0.75}
                onPress={() => handleSuggestionPress(sugg.query)}
              >
                <Text style={styles.chipText}>{sugg.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chat Messages Scroll List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender === 'user' ? styles.userRow : styles.jackRow,
                ]}
              >
                {msg.sender !== 'user' && (
                  <View style={styles.avatarWrap}>
                    <Hexagon size={28} fill="#337418" stroke="#5DD62C" strokeWidth={1}>
                      <Text style={styles.avatarLetter}>J</Text>
                    </Hexagon>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.jackBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.content}</Text>
                  {msg.actionRoute && msg.actionText && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      activeOpacity={0.8}
                      onPress={() => router.replace(msg.actionRoute as any)}
                    >
                      <Text style={styles.actionBtnText}>{msg.actionText}</Text>
                      <MaterialIcons name="arrow-forward" size={14} color="#5DD62C" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.timestampText}>{msg.timestamp}</Text>
                </View>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageRow, styles.jackRow]}>
                <View style={styles.avatarWrap}>
                  <Hexagon size={28} fill="#337418" stroke="#5DD62C" strokeWidth={1}>
                    <Text style={styles.avatarLetter}>J</Text>
                  </Hexagon>
                </View>
                <View style={[styles.messageBubble, styles.jackBubble, styles.typingBubble]}>
                  <Text style={styles.typingText}>Jack está procesando...</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* AUDIO RECORDING / VOICE STATUS INDICATOR */}
      {isListening && (
        <View style={styles.listeningBanner}>
          <Animated.View style={[styles.micPulseCircle, { transform: [{ scale: micPulseAnim }] }]}>
            <MaterialIcons name="mic" size={18} color="#0f0f0f" />
          </Animated.View>
          <View style={styles.listeningTextWrap}>
            <Text style={styles.listeningTitle}>{transcript || 'Escuchando tu micrófono...'}</Text>
            <View style={styles.waveBarRow}>
              <Animated.View style={[styles.waveBar, { height: wave1Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave2Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave3Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave4Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave1Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
            </View>
          </View>
          <TouchableOpacity style={styles.stopMicBtn} onPress={toggleListening}>
            <MaterialIcons name="stop" size={18} color="#f8f8f8" />
          </TouchableOpacity>
        </View>
      )}

      {/* INPUT ROW (Text + Mic + Send) */}
      <View style={styles.inputRow}>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Escribe o habla con Jack..."
          placeholderTextColor="rgba(248, 248, 248, 0.4)"
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => {
            if (!expanded) toggleExpand();
            if (onFocusInput) onFocusInput();
          }}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          blurOnSubmit={false}
        />

        {/* MICROPHONE BUTTON */}
        <TouchableOpacity
          style={[styles.iconButton, isListening && styles.micActiveButton]}
          activeOpacity={0.75}
          onPress={toggleListening}
        >
          <Animated.View style={{ transform: [{ scale: isListening ? micPulseAnim : 1 }] }}>
            <MaterialIcons
              name={isListening ? 'mic' : 'mic-none'}
              size={22}
              color={isListening ? '#0f0f0f' : '#5DD62C'}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* SEND BUTTON */}
        <TouchableOpacity
          style={[styles.iconButton, styles.sendButton, !inputText.trim() && styles.disabledBtn]}
          activeOpacity={0.75}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
        >
          <MaterialIcons name="send" size={20} color={inputText.trim() ? '#f8f8f8' : 'rgba(248,248,248,0.3)'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0f0f0f',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopColor: '#5DD62C',
    borderBottomColor: '#5DD62C',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#5DD62C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontFamily: 'Demonized',
    fontSize: 13,
    fontWeight: '700',
    color: '#f8f8f8',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  expandToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
  },
  expandText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    color: '#5DD62C',
    marginRight: 2,
  },
  chatBodyContainer: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(93, 214, 44, 0.2)',
    paddingTop: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5DD62C',
    marginRight: 6,
    shadowColor: '#5DD62C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  onlineText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    color: '#5DD62C',
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  clearText: {
    fontFamily: 'Demonized',
    fontSize: 9,
    color: 'rgba(248, 248, 248, 0.6)',
    letterSpacing: 0.6,
  },
  suggestionsContainer: {
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: 'rgba(51, 116, 24, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    color: '#5DD62C',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    maxHeight: 180,
    marginVertical: 4,
  },
  messagesContent: {
    gap: 8,
    paddingBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  jackRow: {
    justifyContent: 'flex-start',
  },
  avatarWrap: {
    marginBottom: 2,
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '900',
    color: '#5DD62C',
    fontFamily: 'Demonized',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: '#337418',
    borderBottomRightRadius: 2,
    borderWidth: 1,
    borderColor: '#5DD62C',
  },
  jackBubble: {
    backgroundColor: '#202020',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
  },
  messageText: {
    fontSize: 13,
    color: '#f8f8f8',
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(51, 116, 24, 0.4)',
    borderWidth: 1,
    borderColor: '#5DD62C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  actionBtnText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    color: '#5DD62C',
    fontWeight: '700',
  },
  timestampText: {
    fontSize: 9,
    color: 'rgba(248, 248, 248, 0.45)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    paddingVertical: 6,
  },
  typingText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    color: '#5DD62C',
    letterSpacing: 0.4,
  },
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 214, 44, 0.15)',
    borderWidth: 1,
    borderColor: '#5DD62C',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 6,
    gap: 8,
  },
  micPulseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5DD62C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningTextWrap: {
    flex: 1,
  },
  listeningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8f8f8',
  },
  waveBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#5DD62C',
    borderRadius: 2,
  },
  stopMicBtn: {
    backgroundColor: '#ef4444',
    padding: 6,
    borderRadius: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#f8f8f8',
    fontSize: 13,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActiveButton: {
    backgroundColor: '#5DD62C',
    borderColor: '#5DD62C',
  },
  sendButton: {
    backgroundColor: '#337418',
    borderColor: '#5DD62C',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
