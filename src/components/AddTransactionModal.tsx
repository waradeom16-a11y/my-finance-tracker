import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { CATEGORIES, formatTimeFromDate, formatDateToISO } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { X, Clock, Calendar, Check, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  currencySymbol: string;
  userId: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  currencySymbol,
  userId,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [note, setNote] = useState<string>('');
  
  // Time and Date
  const now = new Date();
  const [dateStr, setDateStr] = useState<string>(formatDateToISO(now));
  const [timeStr, setTimeStr] = useState<string>(formatTimeFromDate(now));
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const filteredCategories = CATEGORIES.filter((c) => c.type === type);

  // If the category doesn't match the new type, switch to first category of new type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = CATEGORIES.filter((c) => c.type === newType);
    if (available.length > 0) {
      setCategory(available[0].label);
    }
  };

  const handleSetCurrentTime = () => {
    const current = new Date();
    setDateStr(formatDateToISO(current));
    setTimeStr(formatTimeFromDate(current));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a title or payee description.');
      return;
    }

    // Build timestamp
    const [year, month, day] = dateStr.split('-').map(Number);
    // Parse time
    const [time, period] = timeStr.trim().split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period?.toUpperCase() === 'PM' && h < 12) h += 12;
    if (period?.toUpperCase() === 'AM' && h === 12) h = 0;
    
    const timestampDate = new Date(year, month - 1, day, h || 12, m || 0);

    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      note: note.trim(),
      timestamp: isNaN(timestampDate.getTime()) ? new Date().toISOString() : timestampDate.toISOString(),
      dateStr,
      timeStr,
    };

    onAdd(newTx);
    onClose();
    // reset
    setAmount('');
    setTitle('');
    setNote('');
    setErrorMsg('');
  };

  const quickPresets = type === 'expense'
    ? ['Coffee', 'Groceries', 'Lunch', 'Uber / Taxi', 'Gas', 'Movie']
    : ['Paycheck', 'Client Invoice', 'Consulting', 'Bonus', 'Cash Gift'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        id="add-transaction-modal"
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-300 z-10"
      >
        {/* Top Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-700/60 rounded-full mx-auto mt-3 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">Record Transaction</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body with Smooth Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Type Segmented Switch */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft size={16} />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight size={16} />
              Income
            </button>
          </div>

          {/* Big Amount Field */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 text-center">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Amount ({type === 'expense' ? 'Spending' : 'Received'})
            </label>
            <div className="flex items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black text-slate-400 mr-1.5">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-48 text-center text-3xl sm:text-4xl font-extrabold text-white bg-transparent outline-none placeholder-slate-600 tracking-tight"
              />
            </div>
          </div>

          {/* Title & Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Title / Payee
            </label>
            <input
              type="text"
              placeholder="e.g. Whole Foods, Monthly Rent, Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTitle(preset)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Spending Category
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <CategoryIcon category={cat.label} type={type} size={15} />
                    <span
                      className={`text-[10px] font-medium mt-1.5 line-clamp-1 ${
                        isSelected ? 'text-indigo-300 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timestamp Section: Date and Time */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-400" />
                Time & Date Stamp
              </span>
              <button
                type="button"
                onClick={handleSetCurrentTime}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
              >
                Set Current Time
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                  Time
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={timeStr}
                    placeholder="12:00 PM"
                    onChange={(e) => setTimeStr(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Note / Remarks Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Note / Comments (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Shared bill with John, receipt in wallet, tax deductible..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-1 pb-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Check size={18} />
              Save {type === 'expense' ? 'Expense' : 'Income'} Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
