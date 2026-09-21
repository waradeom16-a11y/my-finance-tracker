import React from 'react';
import { ActiveTab } from '../types';
import { LayoutDashboard, PieChart, Receipt, Settings, Plus } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  historyCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  historyCount,
}) => {
  return (
    <div className="relative bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-3 pt-2 pb-5 select-none shadow-2xl">
      {/* Floating Center Add Button */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={onOpenAddModal}
          title="Add Transaction"
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 border-4 border-slate-950 transition-transform active:scale-95 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard Tab */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-500/15' : ''
            }`}
          >
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Wallet</span>
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors mr-6 ${
            activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'bg-indigo-500/15' : ''
            }`}
          >
            <PieChart size={20} />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Analytics</span>
        </button>

        {/* History Tab */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ml-6 relative ${
            activeTab === 'history' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all relative ${
              activeTab === 'history' ? 'bg-indigo-500/15' : ''
            }`}
          >
            <Receipt size={20} />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-black text-white flex items-center justify-center border border-slate-950">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">History</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'settings' ? 'bg-indigo-500/15' : ''
            }`}
          >
            <Settings size={20} />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Settings</span>
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-32 h-1 bg-slate-700/60 rounded-full mx-auto mt-2 pointer-events-none" />
    </div>
  );
};
