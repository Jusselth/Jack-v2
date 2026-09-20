import { localLLM, LLM_MODEL } from '../llm/client';
import { FINANCIAL_SYSTEM_PROMPT } from '../llm/prompts';
import { supabase } from '../db/supabase';

export async function handleFinancialAgent(userMessage: string): Promise<string> {
  // 1. Obtener contexto de cuentas y últimas transacciones
  let financeContext = '';
  try {
    const { data: accounts } = await supabase.from('financial_accounts').select('*');
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    financeContext = `Cuentas: ${JSON.stringify(accounts || [])}\nÚltimas transacciones: ${JSON.stringify(recentTransactions || [])}`;
  } catch (err) {
    console.warn('Error fetching financial context from Supabase:', err);
  }

  // 2. Consultar al LLM con el contexto
  try {
    const response = await localLLM.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: `${FINANCIAL_SYSTEM_PROMPT}\n${financeContext}` },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || 'Entendido. ¿Deseas consultar algún saldo o registrar un gasto?';
  } catch (error) {
    console.error('Error in financial agent LLM:', error);
    return 'He recibido tu consulta financiera, pero el modelo local no está disponible en este momento.';
  }
}
