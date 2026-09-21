import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface MobileTopBarProps {
  isFrameMode: boolean;
  onToggleFrame: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({ isFrameMode, onToggleFrame }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative pt-2.5 pb-2 px-6 flex items-center justify-between text-slate-300 text-xs font-semibold select-none">
      {/* Clock */}
      <div className="w-16 flex items-center gap-1.5">
        <span className="font-bold tracking-tight text-white text-[13px]">{time || '9:41'}</span>
      </div>

      {/* Dynamic Island / Notch */}
      <div className="flex items-center justify-center">
        <div className="h-4.5 w-24 bg-black rounded-full border border-slate-800/80 flex items-center justify-center px-2 space-x-1 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 border border-indigo-700/50" />
        </div>
      </div>

      {/* Right Icons: Cellular, Wifi, Battery & Frame Toggle */}
      <div className="w-16 flex items-center justify-end gap-1.5 text-slate-300">
        <Signal size={12} className="text-slate-300" />
        <Wifi size={12} className="text-slate-300" />
        <div className="flex items-center gap-0.5">
          <BatteryMedium size={14} className="text-slate-200" />
        </div>
      </div>
    </div>
  );
};
