import { Router, Request, Response } from 'express';
import { classifyIntent } from '../agents/router';
import { handleSecretaryAgent } from '../agents/secretary';
import { handleFinancialAgent } from '../agents/financial';
import { localLLM, LLM_MODEL } from '../llm/client';
import { supabase } from '../db/supabase';

export const chatRouter = Router();

chatRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Field "message" is required and must be a string.' });
    return;
  }

  try {
    // 1. Guardar mensaje del usuario en auditoría Supabase
    await supabase.from('chat_messages').insert({
      sender: 'user',
      content: message,
      agent_used: 'router',
    });

    // 2. Clasificar intención
    const { agent } = await classifyIntent(message);
    let reply = '';

    // 3. Ejecutar agente correspondiente
    if (agent === 'secretary') {
      reply = await handleSecretaryAgent(message);
    } else if (agent === 'financial') {
      reply = await handleFinancialAgent(message);
    } else {
      // General Agent
      const response = await localLLM.chat.completions.create({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: 'Eres Jack, un asistente de voz inteligente, servicial y conciso en español.' },
          { role: 'user', content: message },
        ],
        temperature: 0.5,
      });
      reply = response.choices[0]?.message?.content?.trim() || 'Hola, ¿en qué puedo ayudarte hoy?';
    }

    // 4. Guardar respuesta del asistente en Supabase
    await supabase.from('chat_messages').insert({
      sender: 'assistant',
      content: reply,
      agent_used: agent,
    });

    res.json({
      agent,
      reply,
    });
  } catch (error: any) {
    console.error('Error handling chat request:', error);
    res.status(500).json({ error: 'Internal server error processing chat.', details: error?.message });
  }
});
