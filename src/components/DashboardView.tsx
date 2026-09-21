import React, { useState } from 'react';
import { Transaction, AppSettings, ActiveTab } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  Eye,
  EyeOff,
  TrendingDown,
  TrendingUp,
  Plus,
  Download,
  AlertTriangle,
  ChevronRight,
  Clock,
  Trash2,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  transactions: Transaction[];
  settings: AppSettings;
  onOpenAddModal: (defaultType?: 'expense' | 'income') => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCsv: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  settings,
  onOpenAddModal,
  onNavigateTab,
  onDeleteTransaction,
  onExportCsv,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // Compute stats
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Monthly budget calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpense = transactions
    .filter((t) => {
      const d = new Date(t.timestamp);
      return (
        t.type === 'expense' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetRatio = settings.monthlyBudget > 0
    ? (currentMonthExpense / settings.monthlyBudget) * 100
    : 0;

  const budgetRemaining = Math.max(settings.monthlyBudget - currentMonthExpense, 0);

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4 pb-8">
      {/* Net Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-5 text-white shadow-2xl border border-indigo-500/30">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between text-indigo-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Net Balance
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 text-indigo-300 hover:text-white transition"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <span className="text-[11px] font-medium bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Live Wallet
          </span>
        </div>

        {/* Big Balance Amount */}
        <div className="mt-2 mb-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline">
            <span>{settings.currencySymbol}</span>
            <span>
              {showBalance
                ? netBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '••••••'}
            </span>
          </h1>
        </div>

        {/* Income & Expense Mini KPIs */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2.5 bg-black/20 p-2.5 rounded-2xl backdrop-blur-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-semibold">
                Income
              </span>
              <p className="text-xs sm:text-sm font-bold text-white">
                +{settings.currencySymbol}
                {showBalance
                  ? totalIncome.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '•••'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-black/20 p-2.5 rounded-2xl backdrop-blur-sm">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-semibold">
                Expenses
              </span>
              <p className="text-xs sm:text-sm font-bold text-white">
                -{settings.currencySymbol}
                {showBalance
                  ? totalExpense.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '•••'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">Monthly Budget Cap</span>
            {budgetRatio >= 100 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                <AlertTriangle size={11} /> Over Budget!
              </span>
            )}
            {budgetRatio >= 85 && budgetRatio < 100 && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                Approaching Cap
              </span>
            )}
          </div>
          <span className="text-slate-400 font-semibold text-[11px]">
            {settings.currencySymbol}{currentMonthExpense.toFixed(0)} / {settings.currencySymbol}{settings.monthlyBudget.toFixed(0)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetRatio >= 100
                ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                : budgetRatio >= 80
                ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(budgetRatio, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>{budgetRatio.toFixed(0)}% used</span>
          <span>
            {settings.currencySymbol}{budgetRemaining.toFixed(0)} available this month
          </span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onOpenAddModal('expense')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition active:scale-95 group shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <Plus size={18} />
          </div>
          <span className="text-[11px] font-bold text-rose-300">Add Expense</span>
        </button>

        <button
          onClick={() => onOpenAddModal('income')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition active:scale-95 group shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <Plus size={18} />
          </div>
          <span className="text-[11px] font-bold text-emerald-300">Add Income</span>
        </button>

        <button
          onClick={onExportCsv}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 transition active:scale-95 group shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <Download size={16} />
          </div>
          <span className="text-[11px] font-bold text-indigo-300">Export CSV</span>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Activity</h3>
          <button
            onClick={() => onNavigateTab('history')}
            className="flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-500 space-y-1">
            <p className="text-xs font-semibold text-slate-400">No transactions recorded yet.</p>
            <p className="text-[11px]">Tap "Add Expense" above to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={tx.category} type={tx.type} size={16} />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{tx.title}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <Clock size={10} />
                          {tx.timeStr || tx.dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{settings.currencySymbol}
                      {tx.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
