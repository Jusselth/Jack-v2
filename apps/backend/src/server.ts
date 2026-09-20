import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRouter } from './routes/health';
import { chatRouter } from './routes/chat';
import { webhookRouter } from './routes/webhook';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/webhooks', webhookRouter);

// Start server
const PORT = env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Jack Personal Assistant Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Local LLM Endpoint: ${env.LOCAL_LLM_BASE_URL} (Model: ${env.LOCAL_LLM_MODEL})`);
});
