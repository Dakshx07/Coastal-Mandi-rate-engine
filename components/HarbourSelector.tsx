
import React, { useState, useRef, useEffect } from 'react';
import { Harbour } from '../types';
import { MapPin, ChevronDown, Check } from 'lucide-react';

interface Props {
  harbours: Harbour[];
  selectedHarbourId: string;
  onSelect: (id: string) => void;
}

export const HarbourSelector: React.FC<Props> = ({ harbours, selectedHarbourId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedHarbour = harbours.find(h => h.id === selectedHarbourId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-40 px-4 py-3 glass shadow-sm transition-all duration-300" ref={dropdownRef}>
      <div className="max-w-md mx-auto relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 overflow-hidden w-full cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl text-[var(--color-primary)] shadow-sm border border-blue-100 dark:border-blue-900/50">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Current Market</span>
            <div className="flex items-center bg-white/50 dark:bg-slate-800/50 rounded-lg pr-2 transition-colors hover:bg-white/80 dark:hover:bg-slate-700/50">
              <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-white truncate pr-2 leading-tight">
                {selectedHarbour?.name || 'Select Harbour'}
              </h2>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Custom Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-slide-up-spring z-50">
            <div className="max-h-64 overflow-y-auto py-2">
              {harbours.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    onSelect(h.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${selectedHarbourId === h.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                >
                  <span className={`text-sm font-bold ${selectedHarbourId === h.id ? 'font-extrabold' : ''}`}>
                    {h.name}
                  </span>
                  {selectedHarbourId === h.id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
