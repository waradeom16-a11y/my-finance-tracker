import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Search, Filter, Trash2, ArrowDownLeft, ArrowUpRight, Download, Calendar, Clock, FileText } from 'lucide-react';

interface HistoryViewProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currencySymbol: string;
  onExportCsv: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onDelete,
  currencySymbol,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Transaction | null>(null);

  // Unique categories in the transaction dataset
  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.note.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort transactions
  filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    if (sortBy === 'highest') return b.amount - a.amount;
    return 0;
  });

  const totalFilteredAmount = filtered.reduce((acc, t) => {
    return t.type === 'expense' ? acc - t.amount : acc + t.amount;
  }, 0);

  return (
    <div className="space-y-4 pb-8">
      {/* Header with Search and Export */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Transaction Ledger</h2>
          <p className="text-xs text-slate-400">
            {filtered.length} record{filtered.length === 1 ? '' : 's'} found
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 text-xs font-bold transition shadow-sm"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, note, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type pills */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
          {(['all', 'expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                typeFilter === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'All' : t === 'expense' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort transactions"
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Total Filtered Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs">
        <span className="text-slate-400">Net on Current Filter:</span>
        <span
          className={`font-bold ${
            totalFilteredAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {totalFilteredAmount >= 0 ? '+' : '-'}{currencySymbol}
          {Math.abs(totalFilteredAmount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center text-slate-500 space-y-2 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6">
          <FileText size={32} className="mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">No transactions found</p>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isExpense = item.type === 'expense';
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemForDetails(item)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
              >
                {/* Left Side */}
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon category={item.category} type={item.type} size={16} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={10} />
                        {item.timeStr || 'Recent'}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-[10px] text-slate-500 truncate max-w-[210px] mt-0.5 italic">
                        "{item.note}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side Amount & Delete Button */}
                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-sm font-black tracking-tight ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{currencySymbol}
                      {item.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <p className="text-[10px] text-slate-500">{item.dateStr}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${item.title}"?`)) {
                        onDelete(item.id);
                      }
                    }}
                    title="Delete record"
                    className="opacity-60 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-rose-500/15 hover:text-rose-400 text-slate-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Detail Popup / Modal */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Transaction Details
              </span>
              <button
                onClick={() => setSelectedItemForDetails(null)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <CategoryIcon
                category={selectedItemForDetails.category}
                type={selectedItemForDetails.type}
                size={22}
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedItemForDetails.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedItemForDetails.category}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Recorded Amount</span>
              <p
                className={`text-2xl font-black mt-1 ${
                  selectedItemForDetails.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {selectedItemForDetails.type === 'expense' ? '-' : '+'}{currencySymbol}
                {selectedItemForDetails.amount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar size={13} /> Date
                </span>
                <span className="font-semibold">{selectedItemForDetails.dateStr}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock size={13} /> Time Stamp
                </span>
                <span className="font-semibold">{selectedItemForDetails.timeStr || 'Recorded'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Type</span>
                <span className="font-semibold capitalize">{selectedItemForDetails.type}</span>
              </div>
              {selectedItemForDetails.note && (
                <div className="py-2">
                  <span className="text-slate-400 block mb-1">Notes:</span>
                  <p className="p-2.5 bg-slate-950 rounded-xl text-slate-300 text-xs border border-slate-800/80">
                    {selectedItemForDetails.note}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  onDelete(selectedItemForDetails.id);
                  setSelectedItemForDetails(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-rose-500/20"
              >
                <Trash2 size={14} />
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
