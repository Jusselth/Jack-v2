import { localLLM, LLM_MODEL } from '../llm/client';
import { ROUTER_SYSTEM_PROMPT } from '../llm/prompts';

export type AgentType = 'secretary' | 'financial' | 'general';

interface RouteResult {
  agent: AgentType;
  reasoning?: string;
}

export async function classifyIntent(userMessage: string): Promise<RouteResult> {
  try {
    const response = await localLLM.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: ROUTER_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    // Intenta parsear JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (['secretary', 'financial', 'general'].includes(parsed.agent)) {
        return { agent: parsed.agent as AgentType, reasoning: parsed.reasoning };
      }
    }
  } catch (error) {
    console.error('Error in intent classification with LLM:', error);
  }

  // Fallback heurístico si el LLM local falla o no responde JSON
  const lower = userMessage.toLowerCase();
  if (lower.includes('tarea') || lower.includes('pendiente') || lower.includes('recordar') || lower.includes('agenda')) {
    return { agent: 'secretary', reasoning: 'Keyword fallback' };
  }
  if (lower.includes('plata') || lower.includes('gasto') || lower.includes('saldo') || lower.includes('cuanto tengo') || lower.includes('compre') || lower.includes('transferencia') || lower.includes('nequi') || lower.includes('bancolombia')) {
    return { agent: 'financial', reasoning: 'Keyword fallback' };
  }

  return { agent: 'general', reasoning: 'Default fallback' };
}
