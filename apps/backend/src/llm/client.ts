import OpenAI from 'openai';
import { env } from '../config/env';

export const LLM_BASE_URL = process.env.LLM_BASE_URL || env.LLM_BASE_URL || 'http://localhost:1234/v1';
export const LLM_API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || 'lm-studio';

export const localLLM = new OpenAI({
  baseURL: LLM_BASE_URL,
  apiKey: LLM_API_KEY,
});

export const LLM_MODEL = process.env.LLM_MODEL || env.LOCAL_LLM_MODEL || 'llama-3.2-3b-instruct';

