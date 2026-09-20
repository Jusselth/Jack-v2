import { localLLM, LLM_MODEL } from '../llm/client';
import { ROUTER_SYSTEM_PROMPT } from '../llm/prompts';

export type AgentType = 'secretary' | 'financial' | 'general';

interface RouteResult {
  agent: AgentType;
  reasoning?: string;
}

export async function classifyIntent(userMessage: string): Promise<RouteResult> {
  const normalized = userMessage
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 1. Clasificación heurística instantánea de alta confianza
  const isSecretary =
    normalized.includes('tarea') ||
    normalized.includes('pendiente') ||
    normalized.includes('recordar') ||
    normalized.includes('recuerd') ||
    normalized.includes('agenda') ||
    normalized.includes('nota') ||
    normalized.includes('reunion') ||
    normalized.includes('evento') ||
    normalized.includes('anota');

  const isFinancial =
    normalized.includes('plata') ||
    normalized.includes('gasto') ||
    normalized.includes('saldo') ||
    normalized.includes('cuanto tengo') ||
    normalized.includes('compre') ||
    normalized.includes('compra') ||
    normalized.includes('pague') ||
    normalized.includes('pago') ||
    normalized.includes('transferencia') ||
    normalized.includes('nequi') ||
    normalized.includes('bancolombia') ||
    normalized.includes('daviplata') ||
    normalized.includes('dinero') ||
    normalized.includes('cuenta') ||
    normalized.includes('presupuesto');

  // 2. Consulta al LLM local con timeout rápido de 2500ms
  try {
    const response = await localLLM.chat.completions.create(
      {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: ROUTER_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
      },
      { timeout: 2500 }
    );

    const content = response.choices[0]?.message?.content?.trim() || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (['secretary', 'financial', 'general'].includes(parsed.agent)) {
        return { agent: parsed.agent as AgentType, reasoning: parsed.reasoning };
      }
    }
  } catch (error) {
    // Si el LLM local está offline o tarda más de 2.5s, usamos el clasificador heurístico
  }

  // Fallback heurístico optimizado
  if (isSecretary) {
    return { agent: 'secretary', reasoning: 'Keyword heuristic match' };
  }
  if (isFinancial) {
    return { agent: 'financial', reasoning: 'Keyword heuristic match' };
  }

  return { agent: 'general', reasoning: 'Default fallback' };
}

