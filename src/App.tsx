/**
 * ExpenseTracker - Full-Stack Personal Finance & Expense Ledger
 * 
 * Built with:
 * - Frontend: React 19, TypeScript, Tailwind CSS, Lucide Icons
 * - Backend: Node.js, Express.js REST API
 * - Database: Integrated Persistent File Database (data/database.json)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, AppSettings, ActiveTab, TransactionType } from './types';
import { AuthScreen } from './components/AuthScreen';
import { AppHeader } from './components/AppHeader';
import { DashboardView } from './components/DashboardView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { exportTransactionsToCsv } from './utils/exportCsv';
import {
  fetchTransactionsApi,
  createTransactionApi,
  deleteTransactionApi,
  clearAllTransactionsApi,
  fetchSettingsApi,
  saveSettingsApi,
  checkServerHealth,
} from './api/client';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  monthlyBudget: 2000,
  currencySymbol: '$',
  currencyCode: 'USD',
};

export default function App() {
  // User Session State (authenticated via session/localStorage)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('expensetracker_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Transactions State (Loaded directly from backend database)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 3000);
  };

  // Fetch initial data from Express backend database
  const loadData = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      // 1. Health check
      const health = await checkServerHealth();
      setDbConnected(!!health);

      // 2. Fetch stored transactions from database
      const txs = await fetchTransactionsApi(userId);
      setTransactions(txs);

      // 3. Fetch user settings from database
      const userSettings = await fetchSettingsApi(userId);
      if (userSettings) {
        setSettings((prev) => ({ ...prev, ...userSettings }));
      }
    } catch (err) {
      console.error('Failed to sync with backend DB:', err);
      showToast('Database connection error. Operating in offline mode.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On user change or initial mount
  useEffect(() => {
    if (user) {
      localStorage.setItem('expensetracker_user', JSON.stringify(user));
      loadData(user.id);
    } else {
      localStorage.removeItem('expensetracker_user');
      setTransactions([]);
    }
  }, [user, loadData]);

  // Auth Handlers
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    showToast(`Logged in successfully as ${newUser.username}`);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    showToast('Logged out of session');
  };

  // Add Transaction (Persisted in Backend Database)
  const handleAddTransaction = async (newTxData: Transaction) => {
    if (!user) return;
    try {
      const createdTx = await createTransactionApi({
        userId: user.id,
        title: newTxData.title,
        amount: newTxData.amount,
        type: newTxData.type,
        category: newTxData.category,
        note: newTxData.note,
        timestamp: newTxData.timestamp,
        dateStr: newTxData.dateStr,
        timeStr: newTxData.timeStr,
      });

      if (createdTx) {
        setTransactions((prev) => [createdTx, ...prev]);
        showToast(`Saved ${createdTx.type}: "${createdTx.title}" to database`);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save transaction', 'error');
    }
  };

  // Delete Transaction (Persisted in Backend Database)
  const handleDeleteTransaction = async (id: string) => {
    try {
      const success = await deleteTransactionApi(id);
      if (success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        showToast('Record deleted from database');
      } else {
        showToast('Failed to delete transaction', 'error');
      }
    } catch {
      showToast('Error communicating with database', 'error');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showToast('No records available to export', 'error');
      return;
    }
    exportTransactionsToCsv(
      transactions,
      `expensetracker_${user ? user.username : 'records'}_${Date.now()}.csv`
    );
    showToast('CSV export downloaded successfully');
  };

  // Clear All Data
  const handleClearAll = async () => {
    if (!user) return;
    try {
      const success = await clearAllTransactionsApi(user.id);
      if (success) {
        setTransactions([]);
        showToast('All transaction records cleared from database');
      } else {
        showToast('Failed to clear database', 'error');
      }
    } catch {
      showToast('Failed to clear database', 'error');
    }
  };

  // Update Settings
  const handleUpdateSettings = async (newPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    if (user) {
      await saveSettingsApi({ ...updated, userId: user.id });
      showToast('Settings saved to database');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Authentication Flow */}
      {!user ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <AuthScreen onLogin={handleLogin} />
        </div>
      ) : (
        <>
          {/* Authentic Clean Web Header */}
          <AppHeader
            user={user}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onLogout={handleLogout}
            transactionCount={transactions.length}
            dbStatus={dbConnected}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
                <p className="text-xs font-semibold">Connecting to integrated server database...</p>
              </div>
            ) : (
              <>
                {/* Active Tab Views */}
                {activeTab === 'dashboard' && (
                  <DashboardView
                    transactions={transactions}
                    settings={settings}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    onNavigateTab={setActiveTab}
                    onDeleteTransaction={handleDeleteTransaction}
                    onExportCsv={handleExportCsv}
                  />
                )}

                {(activeTab === 'transactions' || activeTab === 'history') && (
                  <HistoryView
                    transactions={transactions}
                    onDelete={handleDeleteTransaction}
                    currencySymbol={settings.currencySymbol}
                    onExportCsv={handleExportCsv}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsCharts
                    transactions={transactions}
                    currencySymbol={settings.currencySymbol}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    user={user}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    transactions={transactions}
                    onExportCsv={handleExportCsv}
                    onClearAll={handleClearAll}
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
          </main>

          {/* Add Transaction Modal */}
          <AddTransactionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddTransaction}
            currencySymbol={settings.currencySymbol}
            userId={user.id}
          />
        </>
      )}
    </div>
  );
}
