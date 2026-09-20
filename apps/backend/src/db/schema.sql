-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tasks & Reminders (Secretary Agent)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Financial Accounts (Financial Agent)
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "Bancolombia", "Nequi", "Efectivo"
    account_type TEXT CHECK (account_type IN ('savings', 'checking', 'credit_card', 'cash')) NOT NULL,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'COP',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Financial Transactions (Zero-Friction & Manual)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT CHECK (type IN ('expense', 'income', 'transfer')) NOT NULL,
    category TEXT NOT NULL DEFAULT 'Otros', -- e.g., 'Alimentación', 'Transporte', 'Educación'
    merchant TEXT,                          -- e.g., 'Exito', 'Uber', 'Restaurante'
    description TEXT,
    source TEXT CHECK (source IN ('webhook_shortcut', 'notification_listener', 'manual_voice', 'manual_ui')) DEFAULT 'manual_ui',
    raw_payload JSONB,                      -- Stores original raw SMS/Email bank payload
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conversation Audit Log
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender TEXT CHECK (sender IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    agent_used TEXT, -- 'secretary' | 'financial' | 'router'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rapid query execution
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
