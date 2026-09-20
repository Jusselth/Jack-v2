import { localLLM, LLM_MODEL } from '../llm/client';
import { FINANCIAL_SYSTEM_PROMPT } from '../llm/prompts';
import { supabase } from '../db/supabase';

export async function handleFinancialAgent(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase().trim();

  // 1. Obtener contexto de cuentas y últimas transacciones de Supabase
  let financeContext = '';
  let accounts: any[] = [];
  let recentTransactions: any[] = [];

  try {
    const { data: accData } = await supabase.from('financial_accounts').select('*');
    if (accData) accounts = accData;

    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (txData) recentTransactions = txData;

    financeContext = `Cuentas:\n${accounts.map(a => `- ${a.name} (${a.account_type}): $${Number(a.current_balance || 0).toLocaleString()} ${a.currency || 'COP'}`).join('\n') || 'Sin cuentas configuradas'}\n\nÚltimas transacciones:\n${recentTransactions.map(t => `- [${t.type.toUpperCase()}] $${Number(t.amount || 0).toLocaleString()} en ${t.merchant || t.category || 'Varios'} (${t.description})`).join('\n') || 'Sin transacciones'}`;
  } catch (err) {
    console.warn('Error fetching financial context from Supabase:', err);
  }

  // 2. Detectar si el usuario quiere REGISTRAR un gasto o ingreso directamente
  const isExpenseIntent = lower.includes('gasté') || lower.includes('gaste') || lower.includes('compré') ||
    lower.includes('compre') || lower.includes('pagué') || lower.includes('pague') || lower.includes('nuevo gasto') ||
    lower.includes('registrar gasto');

  const isIncomeIntent = lower.includes('recibí') || lower.includes('recibi') || lower.includes('me pagaron') ||
    lower.includes('ingreso') || lower.includes('me transfirieron');

  if (isExpenseIntent || isIncomeIntent) {
    // Extraer número / monto
    const amountMatch = userMessage.match(/(\$?\s*[\d.,]+(\s*mil|\s*k)?)/i);
    let amount = 0;
    if (amountMatch) {
      let rawNumber = amountMatch[0].replace(/[^\d.,kKmilMIL]/g, '').toLowerCase();
      if (rawNumber.includes('mil') || rawNumber.includes('k')) {
        const base = parseFloat(rawNumber.replace(/(mil|k)/g, '').replace(',', '.'));
        amount = !isNaN(base) ? base * 1000 : 0;
      } else {
        // Limpiar puntos de miles si es formato latino
        const cleaned = rawNumber.replace(/\./g, '').replace(',', '.');
        amount = parseFloat(cleaned) || 0;
      }
    }

    if (amount > 0) {
      const type = isIncomeIntent ? 'income' : 'expense';
      let category = 'Otros';
      if (lower.includes('comida') || lower.includes('almuerzo') || lower.includes('cena') || lower.includes('desayuno') || lower.includes('restaurante') || lower.includes('mercado')) {
        category = 'Alimentación';
      } else if (lower.includes('uber') || lower.includes('taxi') || lower.includes('gasolina') || lower.includes('transporte') || lower.includes('bus')) {
        category = 'Transporte';
      } else if (lower.includes('arriendo') || lower.includes('luz') || lower.includes('agua') || lower.includes('internet') || lower.includes('servicios')) {
        category = 'Servicios';
      } else if (lower.includes('universidad') || lower.includes('curso') || lower.includes('libro')) {
        category = 'Educación';
      }

      // Intentar encontrar comercio
      let merchant: string | null = null;
      if (lower.includes('éxito') || lower.includes('exito')) merchant = 'Éxito';
      else if (lower.includes('uber')) merchant = 'Uber';
      else if (lower.includes('d1')) merchant = 'D1';
      else if (lower.includes('oxxo')) merchant = 'Oxxo';

      try {
        const { data: inserted, error: insertError } = await supabase
          .from('transactions')
          .insert({
            amount,
            type,
            category,
            merchant,
            description: userMessage,
            source: 'manual_voice',
          })
          .select('id')
          .single();

        if (!insertError && inserted) {
          return `Registrado: ${type === 'expense' ? 'Gasto' : 'Ingreso'} de $${amount.toLocaleString()} COP en ${category}${merchant ? ` (${merchant})` : ''}.`;
        }
      } catch (insertErr) {
        console.error('Error inserting transaction in Supabase:', insertErr);
      }
    }
  }

  // 3. Consultar saldo directo si no requiere LLM
  const isBalanceQuery = lower.includes('cuanto tengo') || lower.includes('cuánto tengo') || lower.includes('mi saldo') ||
    lower.includes('saldo actual') || lower.includes('mis cuentas') || lower === 'saldo';

  if (isBalanceQuery && accounts.length > 0) {
    const balanceTotal = accounts.reduce((acc, curr) => acc + Number(curr.current_balance || 0), 0);
    const details = accounts.map(a => `- ${a.name}: $${Number(a.current_balance || 0).toLocaleString()} ${a.currency}`).join('\n');
    return `Tu saldo total es $${balanceTotal.toLocaleString()} COP.\nDetalle de cuentas:\n${details}`;
  }

  // 4. Consultar al LLM con el contexto
  try {
    const response = await localLLM.chat.completions.create(
      {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: `${FINANCIAL_SYSTEM_PROMPT}\n\n${financeContext}` },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
      },
      { timeout: 3000 }
    );

    return response.choices[0]?.message?.content?.trim() || 'Entendido. Tu estado financiero está al día.';
  } catch (error) {

    console.error('Error in financial agent LLM:', error);
    if (accounts.length > 0) {
      const summary = accounts.map(a => `${a.name}: $${Number(a.current_balance || 0).toLocaleString()} ${a.currency}`).join(', ');
      return `Tus cuentas registradas son: ${summary}.`;
    }
    return 'He registrado tu consulta financiera en el sistema.';
  }
}
