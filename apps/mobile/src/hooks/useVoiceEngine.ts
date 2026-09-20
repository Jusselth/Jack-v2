import { useState, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export const useVoiceEngine = (onSpeechResult: (text: string) => void) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');

  useSpeechRecognitionEvent('result', (event) => {
    const recognizedText = event.results[0]?.transcript || '';
    setTranscript(recognizedText);
    if (event.isFinal) {
      setState('processing');
      onSpeechResult(recognizedText);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    if (state === 'listening') setState('idle');
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('Speech recognition error:', event);
    setState('idle');
  });

  const startListening = useCallback(async () => {
    Speech.stop();
    setTranscript('');
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        console.warn('Microphone/Speech permission not granted');
        return;
      }

      setState('listening');
      ExpoSpeechRecognitionModule.start({
        lang: 'es-CO',
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setState('idle');
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      console.warn('Error stopping speech recognition:', e);
    }
    setState('idle');
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    setState('speaking');
    Speech.speak(text, {
      language: 'es-CO',
      pitch: 1.0,
      rate: 1.0,
      onDone: () => {
        setState('idle');
        if (onDone) onDone();
      },
      onError: () => setState('idle'),
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setState('idle');
  }, []);

  return {
    state,
    setState,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};
