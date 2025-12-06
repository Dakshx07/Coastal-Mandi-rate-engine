
import React, { useState, useEffect } from 'react';
import { Harbour } from '../types';
import { getRates, getSpecies } from '../services/storageService';
import { formatCurrency, getRelativeDate } from '../utils';
import { ArrowLeftRight, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  harbours: Harbour[];
  defaultOpen?: boolean;
}

export const QuickCompare: React.FC<Props> = ({ harbours, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [h1, setH1] = useState(harbours[0]?.id || '');
  const [h2, setH2] = useState(harbours[1]?.id || '');
  const [isOpenH1, setIsOpenH1] = useState(false);
  const [isOpenH2, setIsOpenH2] = useState(false);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    if (h1 && h2) {
      const fetchData = async () => {
        const allSpecies = await getSpecies();
        const species = allSpecies.slice(0, 5); // Compare top 5
        const today = getRelativeDate(0);

        const data = await Promise.all(species.map(async (sp) => {
          const rates1 = await getRates(h1, sp.id);
          const rates2 = await getRates(h2, sp.id);

          const r1 = rates1.find(r => r.date === today);
          const r2 = rates2.find(r => r.date === today);

          return {
            species: sp,
            price1: r1 ? r1.price_per_kg : null,
            price2: r2 ? r2.price_per_kg : null,
          };
        }));
        setComparisonData(data);
      };
      fetchData();
    }
  }, [h1, h2]);

  if (harbours.length < 2) return null;

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-heading font-bold text-slate-900 text-base">Quick Compare</h3>
            <p className="text-xs text-slate-500 font-medium">Check price differences instantly</p>
          </div>
        </div>
        <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-slate-100 rotate-180' : 'bg-white'}`}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <div className="p-5 pt-0 animate-slide-up-spring">
          {/* Selectors */}
          <div className="flex items-center space-x-3 mb-6 p-1 bg-slate-100 rounded-2xl relative z-20">
            {/* Harbour 1 Selector */}
            <div className="flex-1 relative group">
              <button
                onClick={() => { setIsOpenH1(!isOpenH1); setIsOpenH2(false); }}
                className="w-full p-3 pl-4 text-xs font-bold border-none rounded-xl bg-white shadow-sm flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="truncate mr-2">{harbours.find(h => h.id === h1)?.name || 'Select'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpenH1 ? 'rotate-180' : ''}`} />
              </button>

              {isOpenH1 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-slide-up-spring max-h-48 overflow-y-auto">
                  {harbours.map(h => (
                    <button
                      key={h.id}
                      onClick={() => { setH1(h.id); setIsOpenH1(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${h1 === h.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0">VS</div>

            {/* Harbour 2 Selector */}
            <div className="flex-1 relative group">
              <button
                onClick={() => { setIsOpenH2(!isOpenH2); setIsOpenH1(false); }}
                className="w-full p-3 pl-4 text-xs font-bold border-none rounded-xl bg-white shadow-sm flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="truncate mr-2">{harbours.find(h => h.id === h2)?.name || 'Select'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpenH2 ? 'rotate-180' : ''}`} />
              </button>

              {isOpenH2 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-slide-up-spring max-h-48 overflow-y-auto">
                  {harbours.map(h => (
                    <button
                      key={h.id}
                      onClick={() => { setH2(h.id); setIsOpenH2(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${h2 === h.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="space-y-3">
            {comparisonData.map((item, idx) => {
              const p1 = item.price1 || 0;
              const p2 = item.price2 || 0;
              const diff = p1 - p2;
              const isPositive = diff > 0;

              return (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
                    <span className="text-sm font-bold text-slate-700">{item.species.name_en}</span>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400 font-medium mb-0.5">Base</div>
                      <div className="text-sm font-mono font-bold text-slate-600">{item.price1 ? formatCurrency(p1) : '-'}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium mb-0.5">Diff</div>
                      <div className={`flex items-center justify-end font-mono font-bold text-sm ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {diff !== 0 && (diff > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />)}
                        {diff !== 0 ? formatCurrency(Math.abs(diff)) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
