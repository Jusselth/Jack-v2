import { create } from 'zustand';
import { VoiceState } from '../hooks/useVoiceEngine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  timestamp: string;
  actionRoute?: string;
  actionText?: string;
}

export interface TaskItem {
  id: string;
  subject?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  due_time?: string;
  assigned_to?: string;
  progress?: number;
  category?: 'universidad' | 'personal';
  created_at: string;
}

export interface TransactionItem {
  id: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  merchant?: string;
  description?: string;
  account_name?: string;
  date?: string;
  created_at: string;
}

export interface FinancialAccount {
  id: string;
  name: string;
  account_type: 'savings' | 'checking' | 'credit_card' | 'cash';
  current_balance: number;
  currency: string;
}

interface AppState {
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  transcript: string;
  setTranscript: (text: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;

  // Messages
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Tasks
  tasks: TaskItem[];
  setTasks: (tasks: TaskItem[]) => void;
  addTask: (task: Omit<TaskItem, 'id' | 'created_at'>) => void;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Financial Accounts & Transactions
  accounts: FinancialAccount[];
  setAccounts: (accounts: FinancialAccount[]) => void;
  transactions: TransactionItem[];
  setTransactions: (transactions: TransactionItem[]) => void;
  addTransaction: (tx: Omit<TransactionItem, 'id' | 'created_at'>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  voiceState: 'idle',
  setVoiceState: (voiceState) => set({ voiceState }),
  transcript: '',
  setTranscript: (transcript) => set({ transcript }),
  isTyping: false,
  setIsTyping: (isTyping) => set({ isTyping }),

  messages: [
    {
      id: '1',
      sender: 'assistant',
      content: '¡Hola! Soy Jack, tu asistente de optimización personal. Toca el micrófono o escribe para interactuar.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),

  // Tasks with default live data ready for Supabase sync
  tasks: [
    {
      id: '1',
      subject: 'Inteligencia Artificial',
      title: 'Implementación de Red Neuronal Convolucional (CNN)',
      description: 'Entrenamiento del modelo en PyTorch, optimización de hiperparámetros y matriz de confusión.',
      priority: 'urgent',
      status: 'pending',
      due_date: 'Hoy, 24 Octubre',
      due_time: '23:59 hrs',
      assigned_to: 'Dr. Javier Arismendi',
      progress: 0.85,
      category: 'universidad',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      subject: 'Sistemas Operativos',
      title: 'Simulador de Planificación de Procesos CPU',
      description: 'Implementación de algoritmos Round Robin, SJF y FIFO en C++ con métricas de tiempo.',
      priority: 'high',
      status: 'in_progress',
      due_date: 'Mañana, 25 Octubre',
      due_time: '18:00 hrs',
      assigned_to: 'Carlos M. & Sofia R.',
      progress: 0.45,
      category: 'universidad',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      subject: 'Finanzas Personales',
      title: 'Revisión y Pago de Servidores AWS & Vercel',
      description: 'Verificar facturación mensual de la infraestructura en la nube y optimizar instancias EC2.',
      priority: 'medium',
      status: 'pending',
      due_date: 'Hoy',
      due_time: '21:00 hrs',
      assigned_to: 'AWS Console',
      progress: 0.9,
      category: 'personal',
      created_at: new Date().toISOString(),
    },
  ],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) =>
    set((state) => ({
      tasks: [
        {
          ...task,
          id: Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
        },
        ...state.tasks,
      ],
    })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })),
  toggleTaskStatus: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      ),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  // Accounts & Transactions
  accounts: [
    {
      id: 'acc-1',
      name: 'Bancolombia',
      account_type: 'savings',
      current_balance: 1850000,
      currency: 'COP',
    },
    {
      id: 'acc-2',
      name: 'Nequi',
      account_type: 'checking',
      current_balance: 600000,
      currency: 'COP',
    },
  ],
  setAccounts: (accounts) => set({ accounts }),

  transactions: [
    {
      id: 'tx-1',
      merchant: 'Carlos Mendoza',
      amount: 340000,
      type: 'income',
      category: 'Proyecto Web CyberNode',
      description: 'Vence hoy',
      account_name: 'Bancolombia',
      date: 'Hoy',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      merchant: 'Valentina Ríos',
      amount: 1150000,
      type: 'expense',
      category: 'Diseño UX/UI',
      description: 'Retraso 2 días',
      account_name: 'Nequi',
      date: 'Hace 2 días',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-3',
      merchant: 'Mateo Silva',
      amount: 85000,
      type: 'income',
      category: 'Cuota Mensual',
      description: 'Próximo lunes',
      account_name: 'Bancolombia',
      date: 'Próximo lunes',
      created_at: new Date().toISOString(),
    },
  ],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        {
          ...tx,
          id: Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
        },
        ...state.transactions,
      ],
    })),
}));
