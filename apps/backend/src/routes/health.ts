import { Router, Request, Response } from 'express';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  let supabaseStatus = 'configured';
  if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) {
    supabaseStatus = 'placeholder_configured';
  }

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'jack-personal-assistant-backend',
    port: env.PORT,
    supabase: {
      status: supabaseStatus,
      url: env.SUPABASE_URL,
    },
    llm: {
      baseUrl: env.LLM_BASE_URL,
      model: env.LOCAL_LLM_MODEL,
    },
  });
});

