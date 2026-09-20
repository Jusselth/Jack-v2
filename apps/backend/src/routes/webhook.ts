import { Router, Request, Response } from 'express';
import { processBankNotification } from '../webhooks/bankIngestion';
import { env } from '../config/env';

export const webhookRouter = Router();

async function handleBankIngestion(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers['x-webhook-secret'] || req.headers['authorization'];
  if (env.WEBHOOK_SECRET && authHeader) {
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (token !== env.WEBHOOK_SECRET) {
      res.status(401).json({ error: 'Unauthorized webhook request.' });
      return;
    }
  }

  try {
    const payload = typeof req.body === 'string' ? { text: req.body } : req.body;
    const result = await processBankNotification(payload);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Webhook ingestion error:', error);
    res.status(500).json({ error: error.message || 'Error processing bank webhook.' });
  }
}

webhookRouter.post('/', handleBankIngestion);
webhookRouter.post('/bank-transaction', handleBankIngestion);

