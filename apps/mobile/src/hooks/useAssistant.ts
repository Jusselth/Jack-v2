import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useVoiceEngine, VoiceState } from './useVoiceEngine';
import { sendChatMessage } from '../services/api';

export const useAssistant = () => {
  const { voiceState, setVoiceState, addMessage } = useAppStore();

  const handleAssistantResponse = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      // 1. Agregar mensaje del usuario a la lista
      addMessage({ sender: 'user', content: userText });
      setVoiceState('processing');

      try {
        // 2. Enviar petición al backend
        const result = await sendChatMessage(userText);
        const reply = result.reply || 'No obtuve respuesta del asistente.';

        // 3. Agregar respuesta a la lista
        addMessage({ sender: 'assistant', content: reply, agent: result.agent });

        // 4. Sintetizar respuesta por voz (TTS)
        voiceEngine.speak(reply, () => {
          setVoiceState('idle');
        });
      } catch (err: any) {
        console.error('Error in useAssistant:', err);
        const errorMsg = 'Lo siento, hubo un problema al conectar con el servidor.';
        addMessage({ sender: 'assistant', content: errorMsg });
        voiceEngine.speak(errorMsg, () => {
          setVoiceState('idle');
        });
      }
    },
    [addMessage, setVoiceState]
  );

  const voiceEngine = useVoiceEngine((finalText) => {
    handleAssistantResponse(finalText);
  });

  const toggleListening = useCallback(() => {
    if (voiceEngine.state === 'listening') {
      voiceEngine.stopListening();
      setVoiceState('idle');
    } else if (voiceEngine.state === 'speaking') {
      voiceEngine.stopSpeaking();
      setVoiceState('idle');
    } else {
      setVoiceState('listening');
      voiceEngine.startListening();
    }
  }, [voiceEngine, setVoiceState]);

  // Sincronizar estado local del voiceEngine con el store si cambia
  const currentState: VoiceState = voiceEngine.state !== 'idle' ? voiceEngine.state : voiceState;

  return {
    state: currentState,
    transcript: voiceEngine.transcript,
    toggleListening,
    speak: voiceEngine.speak,
    stopSpeaking: voiceEngine.stopSpeaking,
  };
};
