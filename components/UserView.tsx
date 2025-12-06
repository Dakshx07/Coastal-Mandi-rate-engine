
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Harbour, DailyRateSummary } from '../types';
import { getHarbours, getSpecies, getRates } from '../services/storageService';
import { calculate_rate_change, getRelativeDate, generate_oracle_summary } from '../utils';
import { getMarketInsights } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

import { HarbourSelector } from './HarbourSelector';
import { SpeciesCard } from './SpeciesCard';
import { DetailModal } from './DetailModal';
import { WhatsAppModal } from './WhatsAppModal';
import { QuickCompare } from './QuickCompare';
import { CatchCalculator } from './CatchCalculator';
import { Settings, RefreshCw, Sparkles, MessageCircle, LogIn, Bell, Home, ArrowLeftRight, LineChart, CloudSun, Wind, Search, MapPin, Calculator, X } from 'lucide-react';

type Tab = 'rates' | 'compare' | 'insights';

export const UserView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('rates');
  const [harbours, setHarbours] = useState<Harbour[]>([]);
  const [selectedHarbourId, setSelectedHarbourId] = useState<string>('');
  const [summaries, setSummaries] = useState<DailyRateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Auth & Language
  const { user } = useAuth();
  const { t } = useLanguage();

  // Modal States
  const [selectedSummary, setSelectedSummary] = useState<DailyRateSummary | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // AI Insight State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loadHarbours = async () => {
      const loadedHarbours = await getHarbours();
      setHarbours(loadedHarbours);
      if (loadedHarbours.length > 0) {
        setSelectedHarbourId(loadedHarbours[0].id);
      }
    };
    loadHarbours();
  }, []);

  useEffect(() => {
    if (!selectedHarbourId) return;

    setLoading(true);
    setAiInsight(null);

    const fetchData = async () => {
      // Artificial delay for smooth UI transition
      await new Promise(resolve => setTimeout(resolve, 300));

      const allSpecies = await getSpecies();
      const today = getRelativeDate(0);
      const yesterday = getRelativeDate(1);

      // Fetch rates for all species in parallel
      const computed = await Promise.all(allSpecies.map(async (sp) => {
        const rates = await getRates(selectedHarbourId, sp.id);
        const todayRate = rates.find(r => r.date === today) || null;
        const yesterdayRate = rates.find(r => r.date === yesterday) || null;

        return {
          species: sp,
          todayRate,
          yesterdayRate,
          change: calculate_rate_change(
            todayRate?.price_per_kg || 0,
            yesterdayRate?.price_per_kg || 0
          ),
          history: rates.slice(0, 7)
        };
      }));

      computed.sort((a, b) => (b.todayRate?.price_per_kg || 0) - (a.todayRate?.price_per_kg || 0));

      setSummaries(computed);
      setLoading(false);
    };

    fetchData();

  }, [selectedHarbourId]);

  const handleGenerateInsight = async () => {
    setIsAiLoading(true);
    const harbour = harbours.find(h => h.id === selectedHarbourId);

    if (harbour) {
      const aiText = await getMarketInsights(harbour.name, summaries);
      if (aiText.includes("unavailable") || aiText.includes("Using local oracle")) {
        const localOracle = generate_oracle_summary(summaries);
        setAiInsight(`${localOracle.trend}\n\n${localOracle.health}\n\n${localOracle.insight}`);
      } else {
        setAiInsight(aiText);
      }
    }
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen pb-28 relative bg-slate-50 font-nunito overflow-x-hidden">
      {/* Top Navbar - Relative (Scrolls Away) to maximize data view */}
      <div className="glass px-5 py-4 flex justify-between items-center relative z-30 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="text-sm font-extrabold text-slate-800 tracking-tight font-heading flex items-center">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full mr-2"></span>
          {t('app.title')}
        </div>
        {user ? (
          <Link to="/settings" className="flex items-center space-x-2 bg-slate-100/50 hover:bg-slate-100 pr-1 pl-3 py-1 rounded-full border border-slate-200 transition-all">
            <span className="text-xs font-bold text-slate-600">{t('common.settings')}</span>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full shadow-sm"
            />
          </Link>
        ) : (
          <Link to="/login" className="flex items-center text-xs font-bold text-[var(--color-primary)] bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
            <LogIn className="w-3 h-3 mr-1.5" /> {t('common.login')}
          </Link>
        )}
      </div>

      <HarbourSelector
        harbours={harbours}
        selectedHarbourId={selectedHarbourId}
        onSelect={setSelectedHarbourId}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* --- TAB 1: RATES --- */}
        {activeTab === 'rates' && (
          <div className="space-y-3 animate-fade-in">

            {/* NEW FEATURE: Dynamic Weather Widget */}
            {(() => {
              const weatherMap: Record<string, { temp: string, condition: string, wind: string, icon: any }> = {
                'h1': { temp: '29°C', condition: 'Humid', wind: '14 km/h', icon: CloudSun },
                'h2': { temp: '31°C', condition: 'Sunny', wind: '18 km/h', icon: CloudSun },
                'h3': { temp: '27°C', condition: 'Rainy', wind: '22 km/h', icon: CloudSun }, // You might want a CloudRain icon here if available
                'h4': { temp: '28°C', condition: 'Clear', wind: '12 km/h', icon: CloudSun },
                'h5': { temp: '32°C', condition: 'Hot', wind: '10 km/h', icon: CloudSun },
              };
              const weather = weatherMap[selectedHarbourId] || { temp: '28°C', condition: 'Sunny', wind: '12 km/h', icon: CloudSun };
              const harbourName = harbours.find(h => h.id === selectedHarbourId)?.name || 'Harbour';

              return (
                <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 mb-6 relative overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> {harbourName}
                      </div>
                      <div className="text-3xl font-heading font-bold">{weather.temp} <span className="text-base font-medium text-blue-100 ml-1">{weather.condition}</span></div>
                    </div>
                    <div className="text-right">
                      <weather.icon className="w-10 h-10 text-yellow-300 mb-1 inline-block animate-pulse-soft" />
                      <div className="flex items-center justify-end text-xs font-bold text-blue-100 bg-white/10 px-2 py-1 rounded-lg">
                        <Wind className="w-3 h-3 mr-1" /> {weather.wind}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Search Bar - Always Open */}
            <div className="relative mb-4 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                placeholder="Search species (e.g. Sardine, Mathi)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-end px-1 mb-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('rates.today')}</h3>
              <span className="text-xs text-slate-400">
                {summaries.filter(s =>
                  s.species.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.species.name_local.toLowerCase().includes(searchTerm.toLowerCase())
                ).length} {t('rates.species_listed')}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100"></div>
                ))}
              </div>
            ) : (
              summaries
                .filter(s =>
                  s.species.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.species.name_local.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((summary, idx) => (
                  <div key={summary.species.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in">
                    <SpeciesCard
                      summary={summary}
                      onClick={() => setSelectedSummary(summary)}
                    />
                  </div>
                ))
            )}

            {/* Subscribe Button */}
            <div className="pt-6 pb-4">
              <button
                onClick={() => setIsWhatsAppOpen(true)}
                className="btn-shine bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white w-full py-4 rounded-2xl shadow-lg flex items-center justify-between px-6 transition-all hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-4 border border-green-500/10">
                    <MessageCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('rates.alerts')}</div>
                    <div className="text-base font-bold">{t('rates.subscribe')}</div>
                  </div>
                </div>
                <Bell className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 2: COMPARE --- */}
        {activeTab === 'compare' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowLeftRight className="w-6 h-6 text-indigo-500" />
              </div>
              <h2 className="text-lg font-heading font-bold text-slate-900">{t('compare.title')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('compare.subtitle')}</p>
            </div>
            <QuickCompare harbours={harbours} defaultOpen={true} />
          </div>
        )}

        {/* --- TAB 3: INSIGHTS --- */}
        {activeTab === 'insights' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center mb-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className="text-lg font-heading font-bold text-slate-900">{t('insights.title')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('insights.subtitle')}</p>
            </div>

            {/* Market Oracle - Premium Card Style */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg group transform transition-all hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B] z-0"></div>
              {/* Subtle animated blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse-soft"></div>

              <div className="relative z-10 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-heading font-bold flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                    {t('insights.daily_analysis')}
                  </h2>
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-blue-200 border border-white/5">AI POWERED</span>
                </div>

                {aiInsight ? (
                  <div className="animate-fade-in">
                    <p className="text-blue-50 leading-relaxed text-sm whitespace-pre-line font-medium opacity-90">{aiInsight}</p>
                    <button
                      onClick={() => setAiInsight(null)}
                      className="mt-4 text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors border border-white/10"
                    >
                      Close Report
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 text-sm font-medium mb-6 pr-4">
                      Get instant daily analysis on price trends, top movers, and buying opportunities.
                    </p>
                    <button
                      onClick={handleGenerateInsight}
                      disabled={isAiLoading}
                      className="btn-shine w-full bg-white text-slate-900 px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center transform active:scale-[0.98]"
                    >
                      {isAiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin text-blue-600" /> {t('insights.generating')}
                        </>
                      ) : (
                        <>{t('insights.analyze_btn')}</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 pb-6 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] flex justify-around items-center">

        <button
          onClick={() => setActiveTab('rates')}
          className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === 'rates' ? 'text-[var(--color-primary)] scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'rates' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <Home className={`w-6 h-6 ${activeTab === 'rates' ? 'fill-blue-600' : ''}`} />
          </div>
          <span className="text-[10px] font-bold">{t('nav.rates')}</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === 'compare' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'compare' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold">{t('nav.compare')}</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === 'insights' ? 'text-yellow-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'insights' ? 'bg-yellow-50' : 'bg-transparent'}`}>
            <Sparkles className={`w-6 h-6 ${activeTab === 'insights' ? 'fill-yellow-500' : ''}`} />
          </div>
          <span className="text-[10px] font-bold">{t('nav.insights')}</span>
        </button>

      </div>

      <DetailModal
        summary={selectedSummary}
        onClose={() => setSelectedSummary(null)}
      />

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        harbourId={selectedHarbourId}
      />

      <CatchCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        summaries={summaries}
      />

      {/* Floating Calculator Button */}
      <button
        onClick={() => setIsCalculatorOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-xl shadow-emerald-500/30 hover:scale-110 hover:bg-emerald-400 transition-all active:scale-95 group"
      >
        <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};
