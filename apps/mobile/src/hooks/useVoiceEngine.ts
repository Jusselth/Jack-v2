import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  AudioModule,
  RecordingPresets,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { useAppStore } from '../store/useAppStore';
import { transcribeAudio } from '../services/api';


let ExpoSpeechRecognitionModule: any = null;
let addSpeechRecognitionListener: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const speechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechModule?.ExpoSpeechRecognitionModule;
  addSpeechRecognitionListener = speechModule?.addSpeechRecognitionListener;
} catch (e) {
  ExpoSpeechRecognitionModule = null;
  addSpeechRecognitionListener = null;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export const useVoiceEngine = (onSpeechResult?: (text: string) => void) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscriptState] = useState('');
  const webRecognitionRef = useRef<any>(null);
  const audioRecorderRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

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

  // Reset silence detector timer (auto-stops after 1.8s of silence)
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      console.log('Silence detected, automatically stopping microphone...');
      stopListening();
    }, 1800);
  }, []);

  // Handle native speech recognition events if available in custom builds
  useEffect(() => {
    let resultSub: any = null;
    let endSub: any = null;
    let errorSub: any = null;

    if (typeof addSpeechRecognitionListener === 'function') {
      try {
        resultSub = addSpeechRecognitionListener('result', (event: any) => {
          const recognizedText = event.results?.[0]?.transcript || '';
          if (recognizedText) {
            updateTranscript(recognizedText);
            resetSilenceTimer();
          }
          if (event.isFinal && recognizedText.trim()) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            stopListening();
          }
        });

        endSub = addSpeechRecognitionListener('end', () => {
          if (state === 'listening') {
            updateState('idle');
          }
        });

        errorSub = addSpeechRecognitionListener('error', (event: any) => {
          console.warn('Native speech recognition warning:', event);
        });
      } catch (err) {
        // Not linked in Expo Go
      }
    }

    return () => {
      try {
        resultSub?.remove?.();
        endSub?.remove?.();
        errorSub?.remove?.();
      } catch (e) {
        // ignore
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (webRecognitionRef.current) {
        try {
          webRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      Speech.stop();
    };
  }, [updateTranscript, updateState, state, resetSilenceTimer]);

  const startListening = useCallback(async () => {
    Speech.stop();
    updateTranscript('');
    updateState('listening');

    let hasSpeechEngine = false;

    // 1. Request real device microphone permissions directly from phone hardware
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        updateTranscript('');
        updateState('idle');
        return;
      }

      // Connect and start real hardware audio recorder
      try {
        const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
        await recorder.prepareToRecordAsync();
        recorder.record();
        audioRecorderRef.current = recorder;
      } catch (recErr) {
        console.log('Hardware recorder active session:', recErr);
      }
    } catch (permErr) {
      console.error('Microphone request error:', permErr);
    }

    // 2. Try Native Speech Recognition (Dev build)
    if (ExpoSpeechRecognitionModule?.requestPermissionsAsync && ExpoSpeechRecognitionModule?.start) {
      try {
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (perm?.granted) {
          await ExpoSpeechRecognitionModule.start({
            lang: 'es-CO',
            interimResults: true,
            maxAlternatives: 1,
          });
          hasSpeechEngine = true;
        }
      } catch (err) {
        console.log('Native Speech Recognition fallback:', err);
      }
    }

    // 3. Web Speech Recognition (Chrome / Safari / Web) with Real-time Voice to Text
    if (!hasSpeechEngine && Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = 'es-CO';
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = (event: any) => {
            let currentText = '';
            for (let i = 0; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript;
            }
            if (currentText) {
              updateTranscript(currentText);
              resetSilenceTimer();
            }
          };
          rec.onend = () => {
            updateState('idle');
          };
          webRecognitionRef.current = rec;
          rec.start();
          hasSpeechEngine = true;
        } catch (webErr) {
          console.log('Web speech error:', webErr);
        }
      }
    }

    // 4. Auto-silence safety for mobile recording (auto-stops after 4 seconds of speech if no final event)
    if (!hasSpeechEngine) {
      recordingTimerRef.current = setTimeout(() => {
        stopListening();
      }, 5000);
    }
  }, [updateTranscript, updateState, resetSilenceTimer]);

  const stopListening = useCallback(async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    let recordedUri: string | null = null;

    // Stop real hardware recorder
    if (audioRecorderRef.current) {
      try {
        recordedUri = audioRecorderRef.current.uri;
        await audioRecorderRef.current.stop();
        audioRecorderRef.current = null;
      } catch (e) {
        // ignore
      }
    }

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

    // Process recorded audio if available
    if (recordedUri && !transcript) {
      updateState('processing');
      try {
        let base64data = '';
        try {
          // FileSystem handles native file:// paths on iOS and Android reliably
          base64data = await FileSystem.readAsStringAsync(recordedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (fsErr) {
          // Fallback to blob reader if FileSystem fails
          try {
            const response = await fetch(recordedUri);
            const blob = await response.blob();
            base64data = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const res = (reader.result as string)?.split(',')[1] || '';
                resolve(res);
              };
              reader.onerror = () => resolve('');
              reader.readAsDataURL(blob);
            });
          } catch (blobErr) {
            console.warn('Blob conversion fallback error:', blobErr);
          }
        }

        if (base64data) {
          const transcribed = await transcribeAudio(base64data);
          if (transcribed && transcribed.trim()) {
            updateTranscript(transcribed.trim());
            if (onSpeechResult) onSpeechResult(transcribed.trim());
          }
        }
      } catch (audioErr) {
        console.log('Audio processing note:', audioErr);
      }
    }

    updateState('idle');
  }, [updateState, transcript, onSpeechResult, updateTranscript]);


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
