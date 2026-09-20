import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRouter } from './routes/health';
import { chatRouter } from './routes/chat';
import { webhookRouter } from './routes/webhook';
import { transcribeRouter } from './routes/transcribe';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoints
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);

// Chat & Agent Orchestration endpoints
app.use('/api/chat', chatRouter);
app.use('/api/v1/chat', chatRouter);

// Webhook endpoints (e.g. Bank SMS/push ingestion)
app.use('/api/webhook', webhookRouter);
app.use('/api/v1/webhooks', webhookRouter);

// Audio transcription endpoints
app.use('/api/transcribe', transcribeRouter);
app.use('/api/v1/transcribe', transcribeRouter);

// Start server on port 3000
const PORT = env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Jack Personal Assistant Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Local LLM Endpoint: ${env.LLM_BASE_URL} (Model: ${env.LOCAL_LLM_MODEL})`);
  console.log(`🗄️  Supabase URL: ${env.SUPABASE_URL}`);
});

