import { Router, Request, Response } from 'express';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'jack-v2-backend',
    llmBaseUrl: env.LOCAL_LLM_BASE_URL,
    model: env.LOCAL_LLM_MODEL,
  });
});
