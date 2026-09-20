import { localLLM, LLM_MODEL } from '../llm/client';
import { BANK_INGESTION_PROMPT } from '../llm/prompts';
import { supabase } from '../db/supabase';

export interface BankPayload {
  source?: 'webhook_shortcut' | 'notification_listener' | 'manual_voice' | 'manual_ui';
  text: string;
}

export interface ParsedTransaction {
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  merchant?: string | null;
  date?: string | null;
  account?: string;
}

export async function processBankNotification(payload: BankPayload) {
  const { text, source = 'webhook_shortcut' } = payload;

  if (!text || typeof text !== 'string') {
    throw new Error('Notification text is required.');
  }

  let parsed: ParsedTransaction | null = null;

  // 1. Enviar prompt al LLM en modo Structured Output JSON con timeout
  try {
    const completion = await localLLM.chat.completions.create(
      {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: BANK_INGESTION_PROMPT },
          { role: 'user', content: `Analiza esta notificación bancaria:\n"${text}"` },
        ],
        temperature: 0.1,
      },
      { timeout: 3000 }
    );

    const content = completion.choices[0]?.message?.content?.trim() || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch (llmErr) {
    console.warn('LLM structured extraction warning, using regex heuristic fallback:', llmErr);
  }

  // 2. Heuristic fallback si el LLM local no está disponible o no devolvió JSON
  if (!parsed || !parsed.amount) {
    const amountMatch = text.match(/\$\s*([\d.,]+)/);
    let amount = 0;
    if (amountMatch) {
      const cleaned = amountMatch[1].replace(/\./g, '').replace(',', '.');
      amount = parseFloat(cleaned) || 0;
    }

    const lower = text.toLowerCase();
    const type: 'expense' | 'income' | 'transfer' =
      lower.includes('recibiste') || lower.includes('te consignaron') || lower.includes('abono') ? 'income' : 'expense';

    let category = 'Compras';
    if (lower.includes('exito') || lower.includes('jumbo') || lower.includes('carulla') || lower.includes('restaurante')) {
      category = 'Alimentación';
    } else if (lower.includes('uber') || lower.includes('didi') || lower.includes('gasolina')) {
      category = 'Transporte';
    }

    let merchant: string | null = null;
    const enMatch = text.match(/\sen\s+([A-Za-z0-9\s._-]+?)(?=\sel\s|\sporce|\scon|\.|$)/i);
    if (enMatch) {
      merchant = enMatch[1].trim();
    }

    let account = 'Bancolombia';
    if (lower.includes('nequi')) account = 'Nequi';
    else if (lower.includes('daviplata')) account = 'Daviplata';

    parsed = {
      amount,
      type,
      category,
      merchant,
      date: new Date().toISOString(),
      account,
    };
  }

  // 3. Asociar o buscar ID de cuenta en Supabase
  let accountId: string | null = null;
  if (parsed.account) {
    try {
      const { data: accounts } = await supabase
        .from('financial_accounts')
        .select('id, name, current_balance')
        .ilike('name', `%${parsed.account}%`)
        .limit(1);

      if (accounts && accounts.length > 0) {
        accountId = accounts[0].id;

        // Actualizar balance de la cuenta
        const delta = parsed.type === 'income' ? parsed.amount : -parsed.amount;
        const newBalance = Number(accounts[0].current_balance || 0) + delta;
        await supabase
          .from('financial_accounts')
          .update({ current_balance: newBalance })
          .eq('id', accounts[0].id);
      }
    } catch (accErr) {
      console.warn('Note: Could not query financial accounts in Supabase:', accErr);
    }
  }

  // 4. Insertar fila en la tabla transactions de Supabase (con fallback resiliente)
  let transactionId: string | undefined;
  try {
    const { data: inserted, error: insertError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        amount: parsed.amount,
        type: parsed.type || 'expense',
        category: parsed.category || 'Otros',
        merchant: parsed.merchant || null,
        description: text,
        source,
        raw_payload: payload,
        created_at: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.warn('Supabase insertion note:', insertError.message);
    } else {
      transactionId = inserted?.id;
    }
  } catch (err: any) {
    console.warn('Note: Supabase unavailable for transaction insertion:', err?.message);
  }

  return {
    status: 'success',
    transaction_id: transactionId,
    parsed,
  };
}


