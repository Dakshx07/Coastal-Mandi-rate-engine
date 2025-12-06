import React, { useState, useEffect } from 'react';
import { DailyRateSummary, PredictionPoint } from '../types';
import { X, Calendar, TrendingUp, Sparkles, Activity, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { formatCurrency, generateFallbackPredictions, generateSpeciesForecast } from '../utils';


import { predictPriceTrend } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  summary: DailyRateSummary | null;
  onClose: () => void;
}

export const DetailModal: React.FC<Props> = ({ summary, onClose }) => {
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [loadingPred, setLoadingPred] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (summary && summary.todayRate) {
      setLoadingPred(true);

      const fetchPredictions = async () => {
        // Try AI Prediction
        const aiPreds = await predictPriceTrend(summary.species.name_en, summary.history);

        if (aiPreds) {
          setPredictions(aiPreds);
        } else {
          // Fallback to deterministic
          const mockPreds = generateFallbackPredictions(summary.todayRate!.price_per_kg);
          setPredictions(mockPreds);
        }
        setLoadingPred(false);
      };

      fetchPredictions();
    } else {
      setPredictions([]);
    }
  }, [summary]);

  if (!summary) return null;

  // Chart Data Preparation
  const historyData = summary.history.map(rate => ({
    date: rate.date.substring(5), // MM-DD
    price: rate.price_per_kg,
    isPrediction: false
  })).reverse();

  const lastHistoryPoint = historyData[historyData.length - 1];
  const predictionData = predictions.map(pred => ({
    date: pred.date.substring(5),
    price: pred.price,
    isPrediction: true
  }));

  const chartData = [
    ...historyData.map(d => ({ date: d.date, actualPrice: d.price, predictedPrice: null })),
    ...(lastHistoryPoint ? [{ date: lastHistoryPoint.date, actualPrice: lastHistoryPoint.price, predictedPrice: lastHistoryPoint.price }] : []),
    ...predictionData.map(d => ({ date: d.date, actualPrice: null, predictedPrice: d.price }))
  ].filter((v, i, a) => a.findIndex(t => t.date === v.date) === i);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl pointer-events-auto animate-slide-up-spring overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-800">{summary.species.name_en}</h2>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{summary.species.name_local}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 bg-white space-y-6">
          {/* Current Price Block */}
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">{t('detail.current_rate')}</span>
              <span className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                {summary.todayRate ? formatCurrency(summary.todayRate.price_per_kg) : 'N/A'}
              </span>
              <span className="text-sm font-semibold text-slate-400 ml-1">/kg</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${summary.change.status === 'UP' ? 'bg-emerald-100 text-emerald-700' : summary.change.status === 'DOWN' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
              {summary.change.description} Today
            </div>
          </div>

          {/* Smart Share Button */}
          <button
            onClick={() => {
              const text = `🐟 *Fresh Catch Alert - ${summary.species.name_en}*\n\n📍 Location: Malpe Harbour\n💰 Rate: ₹${summary.todayRate?.price_per_kg}/kg\n✨ Quality: Premium Grade\n\n_Sent via Coastal Mandi App_`;
              const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(url, '_blank');
            }}
            className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
            {t('detail.share_whatsapp')}
          </button>

          {/* Chart Section */}
          <div className="h-64 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F62FE" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0F62FE" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                  interval={1}
                />
                <Tooltip
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                  }}
                  itemStyle={{ color: '#0F62FE' }}
                />
                <ReferenceLine x={lastHistoryPoint?.date} stroke="#cbd5e1" strokeDasharray="3 3" />

                <Area
                  type="monotone"
                  dataKey="actualPrice"
                  stroke="#0F62FE"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name="History"
                />
                <Area
                  type="monotone"
                  dataKey="predictedPrice"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorPred)"
                  name="Forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insights Block */}
          {loadingPred ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-shimmer"></div>
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <div className="p-3 bg-blue-100/50 rounded-full animate-pulse">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-700 text-sm">{t('ai.generating_forecast')}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">{t('ai.analyzing')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Insight Card */}
              <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                <div className="flex items-start space-x-3 relative z-10">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-slate-800 text-sm mb-1">{t('ai.forecast_title')}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {predictions.length > 0
                        ? generateSpeciesForecast(summary.species.name_en, summary.todayRate?.price_per_kg || 0, predictions)
                        : "Analysis unavailable."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">{t('stats.trend')}</div>
                  <div className="text-sm font-bold text-emerald-700 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {predictions.length > 0 && predictions[6].price > (summary.todayRate?.price_per_kg || 0) ? t('stats.bullish') : t('stats.bearish')}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider mb-1">{t('stats.target_price')}</div>
                  <div className="text-sm font-bold text-indigo-700 flex items-center">
                    <Activity className="w-4 h-4 mr-1" />
                    {predictions.length > 0 ? formatCurrency(Math.max(...predictions.map(p => p.price))) : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};