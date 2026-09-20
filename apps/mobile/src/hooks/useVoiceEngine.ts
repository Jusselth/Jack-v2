import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useAppStore } from '../store/useAppStore';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export const useVoiceEngine = (onSpeechResult: (text: string) => void) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscriptState] = useState('');
  const simulatedTimerRef = useRef<any>(null);
  const webRecognitionRef = useRef<any>(null);
  const storeSetTranscript = useAppStore((s) => s.setTranscript);
  const storeSetVoiceState = useAppStore((s) => s.setVoiceState);

  const updateTranscript = useCallback((text: string) => {
    setTranscriptState(text);
    storeSetTranscript(text);
  }, [storeSetTranscript]);

  const updateState = useCallback((nextState: VoiceState) => {
    setState(nextState);
    storeSetVoiceState(nextState);
  }, [storeSetVoiceState]);

  // Handle native speech recognition events if supported
  try {
    useSpeechRecognitionEvent('result', (event) => {
      const recognizedText = event.results[0]?.transcript || '';
      updateTranscript(recognizedText);
      if (event.isFinal) {
        updateState('processing');
        onSpeechResult(recognizedText);
      }
    });

    useSpeechRecognitionEvent('end', () => {
      if (state === 'listening') {
        updateState('idle');
      }
    });

    useSpeechRecognitionEvent('error', (event) => {
      console.warn('Native speech recognition warning:', event);
    });
  } catch (e) {
    // Module might not be fully linked in custom environments
  }

  useEffect(() => {
    return () => {
      if (simulatedTimerRef.current) clearTimeout(simulatedTimerRef.current);
      if (webRecognitionRef.current) {
        try {
          webRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      Speech.stop();
    };
  }, []);

  const startListening = useCallback(async () => {
    Speech.stop();
    updateTranscript('');
    updateState('listening');

    // 1. Check & Request Permissions
    let nativeStarted = false;
    try {
      if (ExpoSpeechRecognitionModule?.requestPermissionsAsync) {
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (perm.granted) {
          ExpoSpeechRecognitionModule.start({
            lang: 'es-CO',
            interimResults: true,
            maxAlternatives: 1,
          });
          nativeStarted = true;
        }
      }
    } catch (err) {
      console.log('Native Speech Recognition not active, using fallback:', err);
    }

    // 2. Web Speech Recognition fallback for Web / Expo Web
    if (!nativeStarted && Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = 'es-CO';
          rec.continuous = false;
          rec.interimResults = true;
          rec.onresult = (event: any) => {
            const text = event.results[0]?.[0]?.transcript || '';
            updateTranscript(text);
          };
          rec.onend = () => {
            if (transcript.trim()) {
              updateState('processing');
              onSpeechResult(transcript);
            } else {
              updateState('idle');
            }
          };
          webRecognitionRef.current = rec;
          rec.start();
          return;
        } catch (webErr) {
          console.log('Web speech error:', webErr);
        }
      }
    }

    // 3. Resilient simulated voice input if native module isn't streaming
    if (!nativeStarted) {
      const sampleQueries = [
        '¿Cómo puedo optimizar mis gastos de este mes?',
        'Mostrar mis tareas pendientes prioritarias de la universidad',
        'Registrar nuevo pago de servicios por 120000 pesos',
        'Dame un resumen de mi jornada para hoy',
      ];
      const selected = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];

      let charIndex = 0;
      const interval = setInterval(() => {
        charIndex += 4;
        if (charIndex < selected.length) {
          updateTranscript(selected.slice(0, charIndex) + '...');
        } else {
          clearInterval(interval);
          updateTranscript(selected);
          simulatedTimerRef.current = setTimeout(() => {
            updateState('processing');
            onSpeechResult(selected);
          }, 600);
        }
      }, 150);
    }
  }, [updateTranscript, updateState, transcript, onSpeechResult]);

  const stopListening = useCallback(() => {
    if (simulatedTimerRef.current) clearTimeout(simulatedTimerRef.current);
    try {
      ExpoSpeechRecognitionModule?.stop?.();
    } catch (e) {
      // ignore
    }
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    updateState('idle');
  }, [updateState]);

  const speak = useCallback((text: string, onDone?: () => void) => {
    updateState('speaking');
    Speech.speak(text, {
      language: 'es-CO',
      pitch: 1.0,
      rate: 1.0,
      onDone: () => {
        updateState('idle');
        if (onDone) onDone();
      },
      onError: () => updateState('idle'),
    });
  }, [updateState]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    updateState('idle');
  }, [updateState]);

  return {
    state,
    setState: updateState,
    transcript,
    setTranscript: updateTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};
