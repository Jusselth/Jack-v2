import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
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

export async function sendChatMessage(message: string): Promise<{ agent: string; reply: string }> {
  const response = await apiClient.post('/api/v1/chat', { message });
  return response.data;
}

export async function postBankWebhook(text: string): Promise<any> {
  const response = await apiClient.post('/api/v1/webhooks/bank-transaction', {
    source: 'manual_voice',
    text,
  });
  return response.data;
}
