export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  timestamp: string; // ISO string e.g. "2026-09-20T21:05:00.000Z"
  dateStr: string;   // "2026-09-20"
  timeStr: string;   // "09:05 PM"
}

export interface User {
  id: string;
  username: string;
  email?: string;
  joinedDate: string;
}

export interface AppSettings {
  monthlyBudget: number;
  currencySymbol: string;
  currencyCode: string;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'analytics' | 'settings' | 'history';
