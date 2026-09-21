import React, { useState } from 'react';
import { User, AppSettings, Transaction } from '../types';
import {
  User as UserIcon,
  DollarSign,
  Download,
  Copy,
  Check,
  Trash2,
  LogOut,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Sliders,
  ChevronRight,
  PieChart,
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  transactions: Transaction[];
  onExportCsv: () => void;
  onClearAll: () => void;
  onLogout: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  settings,
  onUpdateSettings,
  transactions,
  onExportCsv,
  onClearAll,
  onLogout,
}) => {
  const [budgetInput, setBudgetInput] = useState<string>(settings.monthlyBudget.toString());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSettings({ monthlyBudget: val });
      setIsEditingBudget(false);
    }
  };

  const handleCopyCsvData = () => {
    const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Amount', 'Title', 'Note'];
    const rows = transactions.map((t) => [
      t.id,
      t.dateStr,
      `"${t.timeStr || ''}"`,
      t.type,
      `"${t.category}"`,
      t.amount.toFixed(2),
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.note ? t.note.replace(/"/g, '""') : ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    navigator.clipboard.writeText(csvContent).then(() => {
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2500);
    });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">{user.username}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Active Member
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user.email || `${user.username.toLowerCase()}@finpulse.app`}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
              <span>{transactions.length} Records</span>
              <span>•</span>
              <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Preferences */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sliders size={14} className="text-indigo-400" />
          <span>Financial Preferences</span>
        </div>

        {/* Monthly Budget Setting */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200">Monthly Budget Cap</span>
              <p className="text-[11px] text-slate-400">
                Threshold for monthly expense alerts
              </p>
            </div>
            {!isEditingBudget ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-indigo-300">
                  {settings.currencySymbol}
                  {settings.monthlyBudget.toLocaleString()}
                </span>
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg transition"
                >
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveBudget} className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">{settings.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-24 bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white outline-none font-bold"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                >
                  Save
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Currency Picker */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-200">Currency</span>
            <p className="text-[11px] text-slate-400">
              Format for amounts and balances
            </p>
          </div>
          <select
            value={settings.currencyCode}
            onChange={(e) => {
              const selected = CURRENCIES.find((c) => c.code === e.target.value);
              if (selected) {
                onUpdateSettings({
                  currencyCode: selected.code,
                  currencySymbol: selected.symbol,
                });
              }
            }}
            aria-label="Select preferred currency"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Export & Data Management */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Download size={14} className="text-indigo-400" />
          <span>Data Export & Storage</span>
        </div>

        <p className="text-xs text-slate-400">
          Download your complete financial records in standard CSV spreadsheet format.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onExportCsv}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
          >
            <Download size={15} />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handleCopyCsvData}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-[0.98]"
          >
            {copiedCsv ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span>{copiedCsv ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>

      {/* Integrated Real-time Database Management */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Integrated Server Database</span>
          </div>
          <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-400 border border-slate-800">
            data/database.json
          </span>
        </div>

        <p className="text-xs text-slate-400">
          All financial transactions and preferences are committed directly to disk on the local Express backend, persisting reliably across sessions and device restarts.
        </p>

        {/* Database Status Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Live Records</span>
            <span className="text-sm font-bold text-white">{transactions.length} items</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sync Status</span>
            <span className="text-sm font-bold text-emerald-400">Real-Time Active</span>
          </div>
        </div>

        {/* Reset Actions */}
        <div className="pt-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition border border-rose-500/20 active:scale-[0.99]"
          >
            <Trash2 size={15} />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-600/15 border border-rose-500/30 text-rose-400 hover:bg-rose-600/25 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <LogOut size={16} />
          <span>Log Out of Session</span>
        </button>
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Clear All Transactions?</h3>
              <p className="text-xs text-slate-400 mt-1">
                All records for {user.username} will be permanently deleted from the database.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearAll();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Log out of {user.username}?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your data will stay saved locally on this device.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
