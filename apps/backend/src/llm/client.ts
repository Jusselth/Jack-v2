import OpenAI from 'openai';
import { env } from '../config/env';

export const localLLM = new OpenAI({
  baseURL: env.LOCAL_LLM_BASE_URL,
  apiKey: 'lm-studio', // Dummy non-empty key for local servers (LM Studio / Ollama)
});

export const LLM_MODEL = env.LOCAL_LLM_MODEL || 'local-model';
