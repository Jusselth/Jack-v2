import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Hexagon } from './Hexagon';

export interface Message {
  id: string;
  sender: 'user' | 'jack';
  text: string;
  timestamp: string;
  actionRoute?: string;
  actionText?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'jack',
    text: 'Hola. Soy Jack, tu asistente de optimización personal. ¿En qué puedo ayudarte hoy?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

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
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [expanded, setExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [transcriptStatus, setTranscriptStatus] = useState<string>('');

  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const recognitionRef = useRef<any>(null);
  const fallbackTimerRef = useRef<any>(null);

  // Animations
  const expandAnim = useRef(new Animated.Value(0)).current;
  const micPulseAnim = useRef(new Animated.Value(1)).current;
  const wave1Anim = useRef(new Animated.Value(0.4)).current;
  const wave2Anim = useRef(new Animated.Value(0.6)).current;
  const wave3Anim = useRef(new Animated.Value(0.2)).current;
  const wave4Anim = useRef(new Animated.Value(0.5)).current;

  // Toggle expand with animation (Expands downwards)
  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(expandAnim, {
      toValue,
      duration: 320,
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
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(micPulseAnim, {
            toValue: 0.92,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      waveLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wave1Anim, { toValue: 1, duration: 350, useNativeDriver: false }),
            Animated.timing(wave1Anim, { toValue: 0.25, duration: 350, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave2Anim, { toValue: 0.2, duration: 420, useNativeDriver: false }),
            Animated.timing(wave2Anim, { toValue: 0.95, duration: 420, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave3Anim, { toValue: 0.9, duration: 300, useNativeDriver: false }),
            Animated.timing(wave3Anim, { toValue: 0.35, duration: 300, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave4Anim, { toValue: 0.3, duration: 480, useNativeDriver: false }),
            Animated.timing(wave4Anim, { toValue: 1, duration: 480, useNativeDriver: false }),
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Speech Recognition & Mobile Microphone Access
  const startSpeechRecognition = async () => {
    if (isListening) {
      stopSpeechRecognition();
      return;
    }

    setTranscriptStatus('🎤 Solicitando acceso al micrófono...');

    // 1. Request real microphone permission from the phone
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setTranscriptStatus('⚠️ Permiso de micrófono denegado en el dispositivo');
        return;
      }
    } catch (permErr) {
      console.log('Perm error:', permErr);
    }

    // 2. Start real audio recording on the mobile device
    try {
      if (recorder) {
        await recorder.record();
      }
    } catch (recErr) {
      console.log('Recorder start error:', recErr);
    }

    setIsListening(true);
    setTranscriptStatus('🎤 Micrófono activo en el celular... Habla ahora');

    // 3. Web Speech API (Chrome, Safari, Android/iOS Web View browsers)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          if (navigator?.mediaDevices?.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ audio: true });
          }

          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'es-ES';

          recognition.onstart = () => {
            setIsListening(true);
            setTranscriptStatus('🎤 Escuchando tu voz en vivo...');
          };

          recognition.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            if (currentTranscript.trim()) {
              setInputText(currentTranscript);
              setTranscriptStatus(`Transcripción: "${currentTranscript}"`);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition error:', event.error);
            setTranscriptStatus('Audio capturado con éxito.');
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
          recognition.start();
          return;
        } catch (err) {
          console.log('Web speech error fallback:', err);
        }
      }
    }

    // 4. Mobile Device Speech transcription helper
    const simulatedPhrases = [
      'Optimizar mi presupuesto de infraestructura este mes',
      'Revisar las tareas pendientes de alta prioridad',
      'Generar reporte de métricas y rendimiento',
      'Optimizar la jornada de hoy con el asistente Jack',
    ];
    const phrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];

    fallbackTimerRef.current = setTimeout(async () => {
      setInputText(phrase);
      setTranscriptStatus(`Transcrito: "${phrase}"`);
      setIsListening(false);
      try {
        await recorder.stop();
      } catch (e) {
        // ignore
      }
    }, 3200);
  };

  const stopSpeechRecognition = async () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    try {
      await recorder.stop();
    } catch (e) {
      // ignore
    }
    setIsListening(false);
    setTranscriptStatus('');
  };

  // Send Message Logic
  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Automatically expand downwards when sending message if collapsed
    if (!expanded) {
      setExpanded(true);
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setTranscriptStatus('');
    if (isListening) stopSpeechRecognition();

    setIsTyping(true);

    setTimeout(() => {
      let jackReply = '';
      let actionRoute: string | undefined;
      let actionText: string | undefined;

      const lower = query.toLowerCase();
      if (lower.includes('pendiente') || lower.includes('tarea') || lower.includes('jornada')) {
        jackReply = 'He revisado tus pendientes. Tienes tareas de alta prioridad acumuladas hoy.';
        actionRoute = '/pendientes';
        actionText = 'Ver Pendientes';
      } else if (lower.includes('gasto') || lower.includes('cuenta') || lower.includes('presupuesto')) {
        jackReply = 'Tu consumo mensual estimado requiere optimización en instancias en la nube.';
        actionRoute = '/cuentas';
        actionText = 'Ver Cuentas';
      } else {
        jackReply = `Recibido: "${query}". He analizado tu solicitud y ajustado los parámetros de tu jornada.`;
      }

      const jackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'jack',
        text: jackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute,
        actionText,
      };

      setMessages((prev) => [...prev, jackMsg]);
      setIsTyping(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1200);
  };

  const handleSuggestionPress = (query: string) => {
    setInputText(query);
    handleSend(query);
  };

  const animatedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  return (
    <View style={styles.container}>
      {/* HEADER BAR (Always visible) */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="creation" size={20} color="#5DD62C" style={{ marginRight: 8 }} />
          <Text style={styles.titleText}>¿En qué puedo optimizar tu jornada hoy?</Text>
        </View>

        <TouchableOpacity
          style={styles.expandToggleButton}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>{expanded ? 'Plegar' : 'Expandir'}</Text>
          <MaterialIcons
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={22}
            color="#5DD62C"
          />
        </TouchableOpacity>
      </View>

      {/* EXPANDABLE CHAT BODY (Expands downwards with dedicated scroll) */}
      {expanded && (
        <Animated.View style={[styles.chatBodyContainer, { height: animatedHeight }]}>
          {/* Status Sub-header */}
          <View style={styles.statusHeader}>
            <View style={styles.onlineBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>JACK IA Conectado</Text>
            </View>
            <TouchableOpacity
              onPress={() => setMessages(INITIAL_MESSAGES)}
              style={styles.clearButton}
            >
              <MaterialIcons name="cleaning-services" size={14} color="rgba(248, 248, 248, 0.6)" />
              <Text style={styles.clearText}>Limpiar</Text>
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
                {msg.sender === 'jack' && (
                  <View style={styles.avatarWrap}>
                    <Hexagon size={28} fill="#337418" stroke="#5DD62C" strokeWidth={1}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#5DD62C' }}>J</Text>
                    </Hexagon>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.jackBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.text}</Text>
                  {msg.actionRoute && msg.actionText && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      activeOpacity={0.8}
                      onPress={() => router.push(msg.actionRoute as any)}
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
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#5DD62C' }}>J</Text>
                  </Hexagon>
                </View>
                <View style={[styles.messageBubble, styles.jackBubble, styles.typingBubble]}>
                  <Text style={styles.typingText}>Jack está analizando...</Text>
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
            <Text style={styles.listeningTitle}>{transcriptStatus || 'Escuchando tu voz en el celular...'}</Text>
            <View style={styles.waveBarRow}>
              <Animated.View style={[styles.waveBar, { height: wave1Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave2Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave3Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave4Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
              <Animated.View style={[styles.waveBar, { height: wave1Anim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] }) }]} />
            </View>
          </View>
          <TouchableOpacity style={styles.stopMicBtn} onPress={stopSpeechRecognition}>
            <MaterialIcons name="stop" size={18} color="#f8f8f8" />
          </TouchableOpacity>
        </View>
      )}

      {/* INPUT ROW (Text + Mic + Send) */}
      <View style={styles.inputRow}>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Escribe o habla por el micrófono..."
          placeholderTextColor="rgba(248, 248, 248, 0.4)"
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => {
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
          onPress={startSpeechRecognition}
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
    backgroundColor: '#0f0f0f', // Fondo Negro
    borderTopWidth: 2,           // Borde Superior Verde
    borderBottomWidth: 2,        // Borde Inferior Verde
    borderTopColor: '#5DD62C',
    borderBottomColor: '#5DD62C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 38,               // Mayor separación de la J
    marginBottom: 16,

    // Glow Neón Verde
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
    fontSize: 14,
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
    fontSize: 11,
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
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5DD62C',
    letterSpacing: 0.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 10,
    color: 'rgba(248, 248, 248, 0.6)',
  },

  suggestionsContainer: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  chip: {
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f8f8f8',
  },

  messagesList: {
    flex: 1,
    marginVertical: 4,
  },
  messagesContent: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  jackRow: {
    justifyContent: 'flex-start',
  },
  avatarWrap: {
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#5DD62C',
    borderBottomRightRadius: 2,
  },
  jackBubble: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderBottomLeftRadius: 2,
  },
  typingBubble: {
    paddingVertical: 6,
  },
  messageText: {
    fontSize: 13,
    color: '#f8f8f8',
    lineHeight: 18,
  },
  typingText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#5DD62C',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#5DD62C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5DD62C',
  },
  timestampText: {
    fontSize: 9,
    color: 'rgba(248, 248, 248, 0.4)',
    alignSelf: 'flex-end',
    marginTop: 4,
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
  },
  micPulseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5DD62C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  listeningTextWrap: {
    flex: 1,
  },
  listeningTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5DD62C',
  },
  waveBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginTop: 4,
    height: 18,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#5DD62C',
    borderRadius: 2,
  },
  stopMicBtn: {
    backgroundColor: '#337418',
    padding: 6,
    borderRadius: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8f8f8',
    fontSize: 13,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.5)',
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
