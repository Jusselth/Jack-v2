import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/api/health');
    return response.status === 200;
  } catch {
    return false;
  }
}

export async function sendChatMessage(message: string): Promise<{ agent: string; reply: string }> {
  try {
    const response = await apiClient.post('/api/chat', { message });
    return response.data;
  } catch (err) {
    // Fallback attempt to v1 route
    const fallbackResponse = await apiClient.post('/api/v1/chat', { message });
    return fallbackResponse.data;
  }
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    const response = await apiClient.post('/api/transcribe', { audioBase64 });
    return response.data?.text || '';
  } catch (err) {
    try {
      const fallback = await apiClient.post('/api/v1/transcribe', { audioBase64 });
      return fallback.data?.text || '';
    } catch (fallbackErr) {
      console.log('Transcription service note:', fallbackErr);
      return '';
    }
  }
}

export async function postBankWebhook(text: string): Promise<any> {
  const response = await apiClient.post('/api/webhook', {
    source: 'manual_voice',
    text,
  });
  return response.data;
}

