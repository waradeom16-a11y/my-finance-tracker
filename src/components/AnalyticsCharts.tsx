import React, { useState } from 'react';
import { Transaction } from '../types';
import { getCategoryMeta } from '../data/categories';
import { TrendingDown, TrendingUp, PieChart, BarChart3, AlertCircle } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  currencySymbol,
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const now = new Date();
  const filteredTransactions = transactions.filter((t) => {
    if (period === 'all') return true;
    const tDate = new Date(t.timestamp);
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return tDate >= weekAgo;
    }
    if (period === 'month') {
      return (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  const expenses = filteredTransactions.filter((t) => t.type === 'expense');
  const incomes = filteredTransactions.filter((t) => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // Aggregate expenses by category
  const categoryMap: { [cat: string]: { total: number; count: number } } = {};
  expenses.forEach((t) => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { total: 0, count: 0 };
    }
    categoryMap[t.category].total += t.amount;
    categoryMap[t.category].count += 1;
  });

  const categoryEntries = Object.entries(categoryMap)
    .map(([cat, data]) => ({
      category: cat,
      total: data.total,
      count: data.count,
      percent: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      meta: getCategoryMeta(cat, 'expense'),
    }))
    .sort((a, b) => b.total - a.total);

  // Prepare Donut Chart Slices (SVG SVG path calculation)
  let cumulativeAngle = 0;
  const radius = 70;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Daily Spending calculation for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayExpense = expenses
      .filter((t) => t.dateStr === dateStr)
      .reduce((s, t) => s + t.amount, 0);
    return { dateStr, dayName, amount: dayExpense };
  });

  const maxDailyExpense = Math.max(...last7Days.map((d) => d.amount), 10);

  const activeCategoryDetail = selectedCategory
    ? categoryEntries.find((c) => c.category === selectedCategory)
    : categoryEntries[0];

  return (
    <div className="space-y-5 pb-8">
      {/* Time Period Filter Pills */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        {(['week', 'month', 'all'] as const).map((p) => {
          const labels = { week: 'Past 7 Days', month: 'This Month', all: 'All Time' };
          const active = period === p;
          return (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setSelectedCategory(null);
              }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {labels[p]}
            </button>
          );
        })}
      </div>

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <TrendingDown size={14} className="text-rose-400" />
            <span>Total Spent</span>
          </div>
          <p className="text-lg font-bold text-rose-400">
            {currencySymbol}{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            {expenses.length} transaction{expenses.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Net Inflow</span>
          </div>
          <p className={`text-lg font-bold ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netSavings >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(netSavings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            {totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}% outflow` : 'No income registered'}
          </span>
        </div>
      </div>

      {/* Donut Chart Section */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <PieChart size={16} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Category Distribution</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {categoryEntries.length} Categories
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <AlertCircle size={28} className="mx-auto text-slate-600" />
            <p className="text-xs font-medium">No expenses logged for this period.</p>
            <p className="text-[11px] text-slate-600">Add an expense to view interactive chart breakdown.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* SVG Donut Chart */}
            <div className="relative w-48 h-48 my-2">
              <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth={strokeWidth}
                />
                {categoryEntries.map((item) => {
                  const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((cumulativeAngle / 100) * circumference);
                  cumulativeAngle += item.percent;
                  const isSelected = selectedCategory === item.category;

                  return (
                    <circle
                      key={item.category}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="transparent"
                      stroke={item.meta.color}
                      strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer hover:opacity-90"
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : item.category)
                      }
                    />
                  );
                })}
              </svg>

              {/* Inside Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-[10px] uppercase font-semibold text-slate-400 truncate max-w-[110px]">
                  {activeCategoryDetail ? activeCategoryDetail.category : 'Total Spent'}
                </span>
                <span className="text-base font-extrabold text-white tracking-tight">
                  {currencySymbol}
                  {(activeCategoryDetail ? activeCategoryDetail.total : totalExpense).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
                {activeCategoryDetail && (
                  <span className="text-[10px] font-bold text-indigo-400 mt-0.5">
                    {activeCategoryDetail.percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Tap Hint */}
            <p className="text-[11px] text-slate-500 mt-1 mb-3">
              Tap segments to isolate category details
            </p>

            {/* Category Breakdown Progress Bars */}
            <div className="w-full space-y-2.5 mt-2">
              {categoryEntries.map((item) => {
                const isSelected = selectedCategory === item.category;
                return (
                  <button
                    key={item.category}
                    onClick={() =>
                      setSelectedCategory(isSelected ? null : item.category)
                    }
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.meta.color }}
                        />
                        <span className="font-semibold text-slate-200">{item.category}</span>
                        <span className="text-[10px] text-slate-500">
                          ({item.count} item{item.count > 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">
                          {currencySymbol}{item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="ml-1.5 text-[10px] font-semibold text-slate-400">
                          {item.percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Fill */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.meta.color,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Spending Activity Histogram */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Daily Spending Rhythm</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Last 7 Days</span>
        </div>

        <div className="flex items-end justify-between h-32 pt-4 px-1 gap-2">
          {last7Days.map((day) => {
            const heightPercent = maxDailyExpense > 0 ? (day.amount / maxDailyExpense) * 100 : 0;
            const isToday = day.dateStr === now.toISOString().split('T')[0];
            const hasSpending = day.amount > 0;

            return (
              <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {currencySymbol}{day.amount.toFixed(0)}
                </span>
                <div className="w-full bg-slate-950/80 rounded-t-lg h-24 flex items-end p-0.5">
                  <div
                    style={{ height: `${Math.max(heightPercent, hasSpending ? 12 : 4)}%` }}
                    className={`w-full rounded-md transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-500/40'
                        : hasSpending
                        ? 'bg-gradient-to-t from-violet-600 to-purple-400'
                        : 'bg-slate-800'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
