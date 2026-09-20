# ARCHITECTURE.md - Personal AI Assistant Reboot

## 1. System Vision & Constraints

### Goal
A clean, modular, zero-cost personal AI assistant monorepo containing a React Native (Expo) frontend and a Node.js/TypeScript backend. The mobile app interfaces via voice and dynamic visual feedback (Orb UI), communicating with a self-hosted backend connected to a local LLM (LM Studio / Ollama) via Tailscale Mesh VPN and Supabase for persistence.

### Core Principles
- **100% Free Stack:** Zero API cost reliance. Native OS STT/TTS engines, local LLM, Supabase Free Tier, Tailscale free tier.
- **Token Efficiency for IDE Agents:** Concise files, single responsibility components, explicit TypeScript contracts, strict file boundaries.
- **Single Monorepo:** `/apps/mobile` (Expo) and `/apps/backend` (Node.js Express/Fastify TS) in one workspace.

---

## 2. Global Topology & Network Flow

```
[ Mobile App (Expo) ]
   ├── Voice Input (Native STT)
   ├── Dynamic Orb (Reanimated 60fps)
   └── Native TTS Output
        │
        │ HTTP / WebSockets over Tailscale Mesh VPN (100.x.y.z)
        ▼
[ Local Backend (Node.js / Express TS) ]
   ├── Webhook Ingestion (/api/v1/webhooks/bank-transaction)
   ├── Multi-Agent Router (Secretary | Financial)
   ├── Structured Output / Tool Calling Engine
   └── Supabase Client (Persist transactions, tasks, logs)
        │                                 │
        ▼                                 ▼
[ Local LLM Engine ]            [ Supabase Cloud / Local ]
(LM Studio / Ollama OpenAI API)   (PostgreSQL Database)
http://localhost:1234/v1
```

---

## 3. Monorepo Project Structure

```
ai-assistant-monorepo/
├── package.json                   # Monorepo root scripts & workspaces
├── README.md                      # Setup and run guide
├── ARCHITECTURE.md                # System Blueprint (This File)
│
├── apps/
│   ├── backend/                   # Self-Hosted Node.js/TypeScript Express Server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── server.ts          # Server entrypoint & route registration
│   │       ├── config/            # Env variables & constants
│   │       │   └── env.ts
│   │       ├── db/                # Supabase server client
│   │       │   └── supabase.ts
│   │       ├── llm/               # OpenAI API compatibility client for LM Studio / Ollama
│   │       │   ├── client.ts
│   │       │   └── prompts.ts
│   │       ├── agents/            # Multi-agent orchestrator logic
│   │       │   ├── router.ts      # Intent classifier
│   │       │   ├── secretary.ts   # Agenda/Tasks agent
│   │       │   └── financial.ts   # Expenses/Income agent
│   │       ├── webhooks/          # Zero-friction ingestion handlers
│   │       │   └── bankIngestion.ts
│   │       └── routes/            # REST & WebSocket endpoints
│   │           ├── chat.ts
│   │           ├── webhook.ts
│   │           └── health.ts
│   │
│   └── mobile/                    # React Native Expo App
│       ├── app.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.js     # NativeWind v4 configuration
│       ├── global.css             # Tailwind base styles
│       ├── .env.example
│       └── src/
│           ├── app/               # Expo Router file-based pages
│           │   ├── _layout.tsx    # Root layout & providers
│           │   ├── index.tsx      # Main Voice/Orb Screen
│           │   ├── pendientes.tsx # Secretary Agent Dashboard
│           │   └── cuentas.tsx    # Financial Agent Dashboard
│           ├── components/        # Reusable UI components
│           │   ├── DynamicOrb.tsx # Animated dynamic audio orb
│           │   ├── VoiceButton.tsx# Mic toggle & state triggers
│           │   └── ChatDrawer.tsx # Chat transcript drawer
│           ├── hooks/             # Custom hooks
│           │   ├── useVoiceEngine.ts # Native STT & TTS wrapper
│           │   └── useAssistant.ts   # API streaming / state hook
│           ├── services/          # HTTP & WS API clients
│           │   └── api.ts
│           └── store/             # Zustand state management
│               └── useAppStore.ts
```

---

## 4. Database Schema (Supabase SQL)

Execute this script in the Supabase SQL Editor to initialize all tables and functions:

```sql
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
```

---

## 5. Free Voice Engine Implementation

### Speech-To-Text (STT) - Mobile Native Engine
- **Library:** `expo-speech-recognition` (Free native iOS/Android speech recognition).
- **Fallback:** Native Web Speech API / `@react-native-voice/voice`.

### Text-To-Speech (TTS) - Mobile Native Engine
- **Library:** `expo-speech` (Free native speech synthesis).
- **Config:** Spanish voice synthesis (`es-CO` / `es-ES`), adjustable pitch and rate.

### `apps/mobile/src/hooks/useVoiceEngine.ts` Specification
```typescript
import { useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export const useVoiceEngine = (onSpeechResult: (text: string) => void) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');

  useSpeechRecognitionEvent('result', (event) => {
    const recognizedText = event.results[0]?.transcript || '';
    setTranscript(recognizedText);
    if (event.isFinal) {
      setState('processing');
      onSpeechResult(recognizedText);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    if (state === 'listening') setState('idle');
  });

  const startListening = useCallback(async () => {
    Speech.stop();
    setTranscript('');
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;

    setState('listening');
    ExpoSpeechRecognitionModule.start({
      lang: 'es-CO',
      interimResults: true,
      maxAlternatives: 1,
    });
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    setState('idle');
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    setState('speaking');
    Speech.speak(text, {
      language: 'es-CO',
      pitch: 1.0,
      rate: 1.0,
      onDone: () => {
        setState('idle');
        if (onDone) onDone();
      },
      onError: () => setState('idle'),
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setState('idle');
  }, []);

  return {
    state,
    setState,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};
```

---

## 6. Dynamic Dynamic Orb UI Component

### Technology
- `react-native-reanimated` (v3) + `react-native-svg` (or Canvas/Skia).
- Smooth 60fps organic scale continuous pulsing morphing according to voice assistant state:
  - `idle`: Soft pulsing blue-cyan glow (0.9x to 1.05x).
  - `listening`: Dynamic expanding red/amber pulse pulsing with mic intensity.
  - `processing`: Rapid spinning purple-indigo rotation.
  - `speaking`: Vibrant green-emerald fluid wave dynamics.

### `apps/mobile/src/components/DynamicOrb.tsx` Specification
```tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'reactModel';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { VoiceState } from '../hooks/useVoiceEngine';

interface DynamicOrbProps {
  state: VoiceState;
  size?: number;
}

export const DynamicOrb: React.FC<DynamicOrbProps> = ({ state, size = 180 }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    // Animate colors based on voice state
    switch (state) {
      case 'idle':
        colorProgress.value = withTiming(0, { duration: 500 });
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'listening':
        colorProgress.value = withTiming(1, { duration: 300 });
        scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 400, easing: Easing.ease }),
            withTiming(0.9, { duration: 400, easing: Easing.ease })
          ),
          -1,
          true
        );
        break;
      case 'processing':
        colorProgress.value = withTiming(2, { duration: 300 });
        rotation.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          -1,
          false
        );
        break;
      case 'speaking':
        colorProgress.value = withTiming(3, { duration: 300 });
        scale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 250, easing: Easing.ease }),
            withTiming(0.98, { duration: 250, easing: Easing.ease })
          ),
          -1,
          true
        );
        break;
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      ['#3b82f6', '#ef4444', '#8b5cf6', '#10b981'] // Cyan/Blue, Red, Purple, Green
    );

    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      backgroundColor,
      shadowColor: backgroundColor,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.orb,
          { width: size, height: size, borderRadius: size / 2 },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
});
```

---

## 7. Zero-Friction Webhook Ingestion Engine

### Endpoint Specification
- **URL:** `POST http://<TAILSCALE_IP>:8000/api/v1/webhooks/bank-transaction`
- **Auth:** Optional Bearer API Token (`X-Webhook-Secret`).

### Payload Contract
```json
{
  "source": "webhook_shortcut",
  "text": "Bancolombia: Compra por $45.000 en EXITO CHIA con tu T.Debito *1234 el 19/09/2026 18:30."
}
```

### Server Webhook Processing Flow (`apps/backend/src/webhooks/bankIngestion.ts`)
1. Receive raw SMS/Email string payload.
2. Send prompt to Local LLM in **Structured Output (JSON)** mode.
3. Parse JSON output:
   ```json
   {
     "amount": 45000,
     "type": "expense",
     "category": "Alimentación",
     "merchant": "EXITO CHIA",
     "account": "Bancolombia"
   }
   ```
4. Insert row into Supabase `transactions` table.
5. Return HTTP 200 `{ "status": "success", "transaction_id": "uuid" }`.

---

## 8. Local LLM Integration (LM Studio / Ollama)

### Connection Client (`apps/backend/src/llm/client.ts`)
Uses standard `openai` SDK pointing to local LLM base URL:

```typescript
import OpenAI from 'openai';
import { env } from '../config/env';

export const localLLM = new OpenAI({
  baseURL: env.LOCAL_LLM_BASE_URL, // e.g., 'http://localhost:1234/v1' or 'http://localhost:11434/v1'
  apiKey: 'lm-studio', // Dummy non-empty key for local servers
});

export const LLM_MODEL = env.LOCAL_LLM_MODEL || 'local-model';
```

---

## 9. AI IDE Agent Execution Directives

To execute this architecture cleanly without wasting tokens, pass the following explicit step-by-step instructions to your IDE agent:

### PHASE 1: Repository Root Setup
```bash
# Directives for AI Agent:
1. Initialize monorepo structure with npm/pnpm workspaces.
2. Root package.json must contain "workspaces": ["apps/*"].
3. Create directories: apps/backend and apps/mobile.
```

### PHASE 2: Backend Implementation (`apps/backend`)
```bash
# Directives for AI Agent:
1. Setup Express + TypeScript in apps/backend.
2. Install dependencies: express, cors, dotenv, @supabase/supabase-js, openai, zod.
3. Create src/server.ts listening on port 8000.
4. Implement src/llm/client.ts connecting to http://localhost:1234/v1.
5. Implement src/webhooks/bankIngestion.ts to receive bank notifications, call LLM with JSON structured prompt, and save to Supabase.
6. Implement src/routes/chat.ts for router/assistant endpoint.
```

### PHASE 3: Database Migration
```bash
# Directives for AI Agent:
1. Create a file apps/backend/src/db/schema.sql containing the exact SQL schema provided in Section 4 of ARCHITECTURE.md.
2. Implement apps/backend/src/db/supabase.ts initializing SupabaseClient using SUPABASE_URL and SUPABASE_ANON_KEY.
```

### PHASE 4: Mobile App Implementation (`apps/mobile`)
```bash
# Directives for AI Agent:
1. Initialize Expo project with Expo Router, TypeScript, and NativeWind v4.
2. Install dependencies: expo-speech, expo-speech-recognition, react-native-reanimated, react-native-svg, zustand, axios.
3. Implement src/components/DynamicOrb.tsx using Section 6 code.
4. Implement src/hooks/useVoiceEngine.ts using Section 5 code.
5. Build index.tsx screen displaying the DynamicOrb in the center, a mic button trigger at the bottom, and a text drawer showing live transcripts and response logs.
6. Create navegation pages src/app/pendientes.tsx and src/app/cuentas.tsx to visualize task and transaction tables fetched from Supabase.
```

---

## 10. Environment Variables Checklist

### `apps/backend/.env`
```env
PORT=8000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
LOCAL_LLM_BASE_URL=http://localhost:1234/v1
LOCAL_LLM_MODEL=llama-3.2-3b-instruct
WEBHOOK_SECRET=my_secure_local_secret
```

### `apps/mobile/.env`
```env
EXPO_PUBLIC_BACKEND_URL=http://100.x.y.z:8000
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 11. Verification Checklist for AI Agent
- [ ] Backend runs via `npm run dev` in `apps/backend` without TypeScript errors.
- [ ] Mobile app boots via `npx expo start` in `apps/mobile` without layout or missing module crashes.
- [ ] Dynamic Orb animates smoothly on state changes (`idle` -> `listening` -> `processing` -> `speaking`).
- [ ] Native voice recognition triggers and native speech synthesis responds in Spanish.
- [ ] Webhook endpoint accepts transaction text and correctly writes parsed fields to Supabase.