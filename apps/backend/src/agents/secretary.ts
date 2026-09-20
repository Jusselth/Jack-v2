import { localLLM, LLM_MODEL } from '../llm/client';
import { SECRETARY_SYSTEM_PROMPT } from '../llm/prompts';
import { supabase } from '../db/supabase';

export async function handleSecretaryAgent(userMessage: string): Promise<string> {
  // 1. Obtener contexto de tareas pendientes de Supabase
  let tasksContext = '';
  try {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (tasks && tasks.length > 0) {
      tasksContext = `Tareas pendientes actuales: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority })))}`;
    } else {
      tasksContext = 'No hay tareas pendientes en este momento.';
    }
  } catch (err) {
    console.warn('Error fetching tasks context from Supabase:', err);
  }

  // 2. Comprobar si el mensaje solicita crear una tarea directamente
  const lower = userMessage.toLowerCase();
  if (lower.startsWith('agrega una tarea') || lower.startsWith('crea una tarea') || lower.startsWith('recuérdame') || lower.startsWith('recordar')) {
    const title = userMessage.replace(/^(agrega una tarea|crea una tarea|recuérdame|recordar|anota que debo|anota)\s*(que|de|:)?\s*/i, '').trim();
    if (title) {
      try {
        await supabase.from('tasks').insert({
          title,
          status: 'pending',
          priority: 'medium',
        });
        return `He anotado tu tarea: "${title}".`;
      } catch (e) {
        console.error('Error inserting task:', e);
      }
    }
  }

  // 3. Consultar al LLM con el contexto
  try {
    const response = await localLLM.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: `${SECRETARY_SYSTEM_PROMPT}\nContexto: ${tasksContext}` },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || 'Entendido. ¿Hay algo más en lo que pueda ayudarte con tu agenda?';
  } catch (error) {
    console.error('Error in secretary agent LLM:', error);
    return 'He recibido tu solicitud para el agente de secretaria, pero no pude conectar con el modelo local en este momento.';
  }
}
