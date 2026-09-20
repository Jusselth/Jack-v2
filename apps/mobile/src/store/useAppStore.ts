import { create } from 'zustand';
import { VoiceState } from '../hooks/useVoiceEngine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  merchant?: string;
  description?: string;
  created_at: string;
}

interface AppState {
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  tasks: TaskItem[];
  setTasks: (tasks: TaskItem[]) => void;
  transactions: TransactionItem[];
  setTransactions: (transactions: TransactionItem[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  voiceState: 'idle',
  setVoiceState: (voiceState) => set({ voiceState }),
  messages: [
    {
      id: '1',
      sender: 'assistant',
      content: '¡Hola! Soy Jack, tu asistente personal. Toca el micrófono para comenzar.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
}));
