import React from 'react';
import { User, ActiveTab } from '../types';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Plus,
  LogOut,
  Database,
} from 'lucide-react';

interface AppHeaderProps {
  user: User;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onLogout: () => void;
  transactionCount: number;
  dbStatus: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenAddModal,
  onLogout,
  transactionCount,
  dbStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">ExpenseTracker</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database size={10} />
                <span>{dbStatus ? 'Realtime DB Active' : 'Connecting...'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Full-Stack Financial Ledger</p>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'transactions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Receipt size={14} />
            <span>Transactions</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'transactions' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {transactionCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PieChart size={14} />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2.5">
          {/* Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm active:scale-95"
          >
            <Plus size={15} />
            <span>Add Record</span>
          </button>

          {/* User & Logout */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">{user.username}</span>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-950/80 text-xs">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 font-medium ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard size={16} />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange('transactions')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 font-medium ${
            activeTab === 'transactions' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Receipt size={16} />
          <span className="text-[10px]">Records ({transactionCount})</span>
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 font-medium ${
            activeTab === 'analytics' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PieChart size={16} />
          <span className="text-[10px]">Analytics</span>
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 font-medium ${
            activeTab === 'settings' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Settings size={16} />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>
    </header>
  );
};
