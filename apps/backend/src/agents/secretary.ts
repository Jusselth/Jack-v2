import { localLLM, LLM_MODEL } from '../llm/client';
import { SECRETARY_SYSTEM_PROMPT } from '../llm/prompts';
import { supabase, isSupabaseConfigured } from '../db/supabase';

export async function handleSecretaryAgent(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase().trim();

  // 1. Obtener contexto de tareas pendientes de Supabase
  let tasksContext = '';
  let currentTasks: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && tasks) {
        currentTasks = tasks;
        if (tasks.length > 0) {
          tasksContext = `Tareas pendientes actuales:\n` + tasks.map(t => `- [${t.priority.toUpperCase()}] ${t.title}`).join('\n');
        } else {
          tasksContext = 'No hay tareas pendientes en este momento.';
        }
      }
    } catch (err) {
      console.warn('Error fetching tasks context from Supabase:', err);
    }
  }


  // 2. Comprobar si el mensaje solicita CREAR una tarea directamente
  const isCreateIntent = /^(agrega|crea|nueva|anota|apunta|recuérdame|recordar|guardar)\s+(una\s+)?(tarea|pendiente|recordatorio)?/i.test(lower) ||
    lower.includes('recuérdame') || lower.includes('recuerdame') || lower.includes('anota que') || lower.startsWith('tarea:');

  if (isCreateIntent) {
    let taskTitle = userMessage
      .replace(/^(agrega|crea|nueva|anota|apunta|recuérdame|recuerdame|recordar|guardar)\s+(una\s+|un\s+)?(tarea|pendiente|recordatorio)?\s*(que|de|:)?\s*/i, '')
      .trim();

    if (!taskTitle) {
      taskTitle = userMessage.trim();
    }

    // Inferir prioridad
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    if (lower.includes('urgente') || lower.includes('ya mismo') || lower.includes('inmediato')) {
      priority = 'urgent';
    } else if (lower.includes('importante') || lower.includes('alta prioridad')) {
      priority = 'high';
    } else if (lower.includes('cuando puedas') || lower.includes('baja prioridad')) {
      priority = 'low';
    }

    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('tasks')
        .insert({
          title: taskTitle,
          priority,
          status: 'pending',
        })
        .select('*')
        .single();

      if (!insertErr && inserted) {
        return `He registrado tu nueva tarea: "${taskTitle}" con prioridad ${priority}.`;
      }
    } catch (e) {
      console.error('Error inserting task in Supabase:', e);
    }
  }

  // 3. Comprobar si el mensaje solicita COMPLETAR una tarea
  if (lower.includes('completa') || lower.includes('terminada') || lower.includes('ya hice') || lower.includes('eliminar tarea')) {
    if (currentTasks.length > 0) {
      const matched = currentTasks.find(t => lower.includes(t.title.toLowerCase()));
      if (matched) {
        await supabase.from('tasks').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', matched.id);
        return `He marcado como completada la tarea: "${matched.title}".`;
      }
    }
  }

  // 4. Si el usuario solo pregunta por sus tareas pendientes
  const isQueryTasks = lower.includes('que tengo') || lower.includes('qué tengo') || lower.includes('cuáles son') ||
    lower.includes('mis pendientes') || lower.includes('mis tareas') || lower.includes('listar tareas') || lower === 'tareas';

  if (isQueryTasks && currentTasks.length > 0) {
    const listFormatted = currentTasks.map((t, idx) => `${idx + 1}. ${t.title} (${t.priority})`).join('\n');
    return `Tienes ${currentTasks.length} pendiente(s) registrados:\n${listFormatted}`;
  }

  // 5. Consultar al LLM con el contexto actualizado de Supabase
  try {
    const response = await localLLM.chat.completions.create(
      {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: `${SECRETARY_SYSTEM_PROMPT}\n\n${tasksContext}` },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
      },
      { timeout: 3000 }
    );


    return response.choices[0]?.message?.content?.trim() || 'Entendido. Tus tareas y agenda están actualizadas.';
  } catch (error) {
    console.error('Error in secretary agent LLM:', error);
    if (currentTasks.length > 0) {
      return `Tus tareas pendientes actuales son:\n` + currentTasks.map(t => `- ${t.title}`).join('\n');
    }
    return 'Entendido. No tienes tareas pendientes registradas en este momento.';
  }
}
