# Jack Personal AI Assistant Monorepo

Sistema modular y 100% gratuito de Asistente Personal de Inteligencia Artificial con interfaz de voz y retroalimentación visual dinámica en React Native (Expo) y backend auto-hospedado en Node.js/TypeScript conectado a LLMs locales (LM Studio / Ollama) y Supabase.

---

## 📁 Estructura del Proyecto

```
ai-assistant-monorepo/
├── package.json                   # Workspaces para apps/backend y apps/mobile
├── architecture_specification.md  # Especificación técnica detallada
│
├── apps/
│   ├── backend/                   # Servidor Node.js Express + TypeScript
│   │   ├── src/
│   │   │   ├── server.ts          # Servidor Express (Puerto 8000)
│   │   │   ├── config/env.ts      # Validación de variables de entorno
│   │   │   ├── db/
│   │   │   │   ├── schema.sql     # Esquema SQL para Supabase
│   │   │   │   └── supabase.ts    # Cliente Supabase
│   │   │   ├── llm/
│   │   │   │   ├── client.ts      # Cliente OpenAI compatible para LM Studio / Ollama
│   │   │   │   └── prompts.ts     # Prompts de Router, Secretaria, Finanzas y Webhooks
│   │   │   ├── agents/
│   │   │   │   ├── router.ts      # Clasificador de intención
│   │   │   │   ├── secretary.ts   # Agente de gestión de tareas
│   │   │   │   └── financial.ts   # Agente financiero
│   │   │   ├── webhooks/
│   │   │   │   └── bankIngestion.ts # Parser estructurado de SMS/Emails de bancos
│   │   │   └── routes/
│   │   │       ├── health.ts      # GET /health
│   │   │       ├── chat.ts        # POST /api/v1/chat
│   │   │       └── webhook.ts     # POST /api/v1/webhooks/bank-transaction
│   │   └── .env.example
│   │
│   └── mobile/                    # App Móvil React Native (Expo v57)
│       ├── app.json               # Configuración de Expo y permisos nativos
│       ├── src/
│       │   ├── app/
│       │   │   ├── _layout.tsx    # Navegación por Tabs
│       │   │   ├── index.tsx      # Pantalla Principal con Dynamic Orb y Chat Drawer
│       │   │   ├── pendientes.tsx # Dashboard de Agenda & Tareas (Agente Secretaria)
│       │   │   └── cuentas.tsx    # Dashboard de Cuentas & Transacciones (Agente Financiero)
│       │   ├── components/
│       │   │   ├── DynamicOrb.tsx # Orbe dinámico con Reanimated 60fps
│       │   │   ├── VoiceButton.tsx# Botón de micrófono interactivo
│       │   │   └── ChatDrawer.tsx # Drawer desplegable de transcripciones
│       │   ├── hooks/
│       │   │   ├── useVoiceEngine.ts # STT y TTS nativo en español
│       │   │   └── useAssistant.ts   # Hook de orquestación de voz y llamadas API
│       │   ├── services/api.ts    # Clientes Axios y Supabase
│       │   └── store/useAppStore.ts # Estado global con Zustand
│       └── .env.example
```

---

## 🚀 Guía de Inicio Rápido

### 1. Base de Datos (Supabase)
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Abre el **SQL Editor** en tu dashboard de Supabase y ejecuta el script localizado en:
   `apps/backend/src/db/schema.sql`

### 2. Configuración de Variables de Entorno
Crea los archivos `.env` basándote en los ejemplos:

- En `apps/backend/.env`:
  ```env
  PORT=8000
  SUPABASE_URL=https://tu-proyecto.supabase.co
  SUPABASE_ANON_KEY=tu-anon-key
  LOCAL_LLM_BASE_URL=http://localhost:1234/v1
  LOCAL_LLM_MODEL=llama-3.2-3b-instruct
  WEBHOOK_SECRET=my_secure_local_secret
  ```

- En `apps/mobile/.env`:
  ```env
  EXPO_PUBLIC_BACKEND_URL=http://<IP_DE_TU_PC_O_TAILSCALE>:8000
  EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
  ```

### 3. Iniciar el Backend
```bash
npm run backend:dev
```
El servidor arrancará en `http://localhost:8000`.

### 4. Iniciar la App Móvil
```bash
npm run mobile:start
```
Escanea el código QR desde tu dispositivo móvil con **Expo Go** o compila en tu emulador con `npm run mobile:android` / `npm run mobile:ios`.

---

## 🎯 Endpoints Clave del Backend
- `GET /health`: Estado del servidor y modelo LLM configurado.
- `POST /api/v1/chat`:
  - Body: `{ "message": "Recuérdame comprar leche a las 5pm" }`
  - Responde: `{ "agent": "secretary", "reply": "He anotado tu tarea..." }`
- `POST /api/v1/webhooks/bank-transaction`:
  - Body: `{ "text": "Bancolombia: Compra por $45.000 en EXITO CHIA...", "source": "webhook_shortcut" }`
  - Ingesta y clasifica la transacción automáticamente con el LLM en formato JSON y la guarda en Supabase.
