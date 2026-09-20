import { Router, Request, Response } from 'express';
import { processBankNotification } from '../webhooks/bankIngestion';
import { env } from '../config/env';

export const webhookRouter = Router();

webhookRouter.post('/bank-transaction', async (req: Request, res: Response): Promise<void> => {
  // Verificación opcional de token secreto
  const authHeader = req.headers['x-webhook-secret'] || req.headers['authorization'];
  if (env.WEBHOOK_SECRET && authHeader) {
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (token !== env.WEBHOOK_SECRET) {
      res.status(401).json({ error: 'Unauthorized webhook request.' });
      return;
    }
  }

  try {
    const result = await processBankNotification(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Webhook ingestion error:', error);
    res.status(500).json({ error: error.message || 'Error processing bank webhook.' });
  }
});
