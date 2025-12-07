
import React, { useState, useEffect } from 'react';
import { Harbour } from '../types';
import { getRates, getSpecies } from '../services/storageService';
import { formatCurrency } from '../utils';
import { ArrowLeftRight, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  // Update initial selections when harbours change
  useEffect(() => {
    if (harbours.length >= 2) {
      if (!h1) setH1(harbours[0].id);
      if (!h2) setH2(harbours[1].id);
    }
  }, [harbours]);

  useEffect(() => {
    if (h1 && h2 && isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const allSpecies = await getSpecies();
        const species = allSpecies.slice(0, 5); // Compare top 5

        const data = await Promise.all(species.map(async (sp) => {
          const rates1 = await getRates(h1, sp.id);
          const rates2 = await getRates(h2, sp.id);

          // Use LATEST available rate, not just today's
          const r1 = rates1.length > 0 ? rates1[0] : null;
          const r2 = rates2.length > 0 ? rates2[0] : null;

          return {
            species: sp,
            price1: r1 ? r1.price_per_kg : null,
            price2: r2 ? r2.price_per_kg : null,
          };
        }));
        setComparisonData(data);
        setLoading(false);
      };
      fetchData();
    }
  }, [h1, h2, isOpen]);

  if (harbours.length < 2) return null;

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50/50 transition-colors rounded-t-3xl ${!isOpen ? 'rounded-b-3xl' : ''}`}
      >
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 flex-shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-heading font-bold text-slate-900 text-base">Quick Compare</h3>
            <p className="text-xs text-slate-500 font-medium">Check price differences instantly</p>
          </div>
        </div>
        <div className={`p-2 rounded-full transition-all flex-shrink-0 ${isOpen ? 'bg-slate-100 rotate-180' : 'bg-white'}`}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 animate-slide-up-spring">
          {/* Selectors - Stacked on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-6 p-2 bg-slate-100 rounded-2xl relative z-20">
            {/* Harbour 1 Selector */}
            <div className="flex-1 relative group">
              <button
                onClick={() => { setIsOpenH1(!isOpenH1); setIsOpenH2(false); }}
                className="w-full p-3 px-4 text-xs font-bold border-none rounded-xl bg-white shadow-sm flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="truncate">{harbours.find(h => h.id === h1)?.name || 'Select'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpenH1 ? 'rotate-180' : ''}`} />
              </button>

              {isOpenH1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-slide-up-spring max-h-48 overflow-y-auto">
                  {harbours.map(h => (
                    <button
                      key={h.id}
                      onClick={() => { setH1(h.id); setIsOpenH1(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${h1 === h.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0 mx-auto sm:mx-0">VS</div>

            {/* Harbour 2 Selector */}
            <div className="flex-1 relative group">
              <button
                onClick={() => { setIsOpenH2(!isOpenH2); setIsOpenH1(false); }}
                className="w-full p-3 px-4 text-xs font-bold border-none rounded-xl bg-white shadow-sm flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="truncate">{harbours.find(h => h.id === h2)?.name || 'Select'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpenH2 ? 'rotate-180' : ''}`} />
              </button>

              {isOpenH2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-slide-up-spring max-h-48 overflow-y-auto">
                  {harbours.map(h => (
                    <button
                      key={h.id}
                      onClick={() => { setH2(h.id); setIsOpenH2(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${h2 === h.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
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
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              comparisonData.map((item, idx) => {
                const p1 = item.price1 || 0;
                const p2 = item.price2 || 0;
                const diff = p1 - p2;

                return (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-1 h-8 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors flex-shrink-0"></div>
                      <span className="text-sm font-bold text-slate-700 truncate">{item.species.name_en}</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                      {/* Price columns */}
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium mb-0.5">Base</div>
                        <div className="text-xs sm:text-sm font-mono font-bold text-slate-600">
                          {item.price1 ? formatCurrency(p1) : '-'}
                        </div>
                      </div>

                      <div className="text-right min-w-[60px]">
                        <div className="text-[10px] text-slate-400 font-medium mb-0.5">Diff</div>
                        <div className={`flex items-center justify-end font-mono font-bold text-xs sm:text-sm ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                          {diff !== 0 && (diff > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />)}
                          {diff !== 0 ? formatCurrency(Math.abs(diff)) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
