import { Transaction, AppSettings, User } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function fetchTransactionsApi(userId: string): Promise<Transaction[]> {
  try {
    const res = await fetch(`/api/transactions?userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Failed to fetch transactions from server DB:', err);
    return [];
  }
}

export async function createTransactionApi(tx: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error || 'Failed to create transaction');
  } catch (err) {
    console.error('API createTransaction error:', err);
    throw err;
  }
}

export async function deleteTransactionApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('API deleteTransaction error:', err);
    return false;
  }
}

export async function clearAllTransactionsApi(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/transactions-clear?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('API clearAllTransactions error:', err);
    return false;
  }
}

export async function fetchSettingsApi(userId: string): Promise<AppSettings | null> {
  try {
    const res = await fetch(`/api/settings?userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success && json.data ? json.data : null;
  } catch (err) {
    console.error('API fetchSettings error:', err);
    return null;
  }
}

export async function saveSettingsApi(settings: AppSettings & { userId: string }): Promise<boolean> {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('API saveSettings error:', err);
    return false;
  }
}

export async function loginUserApi(username: string, password?: string): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    return json.success && json.user ? json.user : null;
  } catch (err) {
    console.error('API loginUser error:', err);
    return null;
  }
}

export async function checkServerHealth(): Promise<{ status: string; transactionCount: number } | null> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}
