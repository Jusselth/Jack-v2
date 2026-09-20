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
  account?: string;
}

export async function processBankNotification(payload: BankPayload) {
  const { text, source = 'webhook_shortcut' } = payload;

  if (!text || typeof text !== 'string') {
    throw new Error('Notification text is required.');
  }

  // 1. Enviar prompt al LLM en modo Structured Output JSON
  const completion = await localLLM.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: BANK_INGESTION_PROMPT },
      { role: 'user', content: `Analiza esta notificación bancaria:\n"${text}"` },
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content?.trim() || '';
  let parsed: ParsedTransaction;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`LLM output did not contain JSON: ${content}`);
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Error parsing LLM response for bank ingestion:', content, err);
    throw new Error('Failed to parse financial data from notification text.');
  }

  // 2. Asociar o buscar ID de cuenta si existe
  let accountId: string | null = null;
  if (parsed.account) {
    const { data: accounts } = await supabase
      .from('financial_accounts')
      .select('id, name')
      .ilike('name', `%${parsed.account}%`)
      .limit(1);

    if (accounts && accounts.length > 0) {
      accountId = accounts[0].id;
    }
  }

  // 3. Insertar fila en la tabla transactions de Supabase
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
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error inserting transaction into Supabase:', insertError);
    throw new Error(`Supabase insertion failed: ${insertError.message}`);
  }

  return {
    status: 'success',
    transaction_id: inserted?.id,
    parsed,
  };
}
