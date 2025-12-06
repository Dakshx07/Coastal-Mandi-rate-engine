import React, { useState, useEffect } from 'react';
import { DailyRateSummary, PredictionPoint } from '../types';
import { X, Calendar, TrendingUp, Sparkles, Activity, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { formatCurrency, generateFallbackPredictions } from '../utils';
import { predictPriceTrend } from '../services/geminiService';

interface Props {
  summary: DailyRateSummary | null;
  onClose: () => void;
}

export const DetailModal: React.FC<Props> = ({ summary, onClose }) => {
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [loadingPred, setLoadingPred] = useState(false);

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
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Current Market Rate</span>
              <span className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                {summary.todayRate ? formatCurrency(summary.todayRate.price_per_kg) : 'N/A'}
              </span>
              <span className="text-sm font-semibold text-slate-400 ml-1">/kg</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${summary.change.status === 'UP' ? 'bg-emerald-100 text-emerald-700' : summary.change.status === 'DOWN' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
              {summary.change.description} Today
            </div>
          </div>

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
                  <h4 className="font-heading font-bold text-slate-700 text-sm">Generating AI Forecast</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Analyzing historical trends & market signals...</p>
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
                    <h4 className="font-heading font-bold text-slate-800 text-sm mb-1">AI Market Forecast</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {predictions.length > 0 && predictions[6].price > (summary.todayRate?.price_per_kg || 0)
                        ? "Strong upward momentum detected. Recommendation: Hold stock for better margins later this week."
                        : "Price correction expected in coming days. Recommendation: Buyers should wait for the dip."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Trend</div>
                  <div className="text-sm font-bold text-emerald-700 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {predictions.length > 0 && predictions[6].price > (summary.todayRate?.price_per_kg || 0) ? 'Bullish' : 'Bearish'}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider mb-1">Target Price</div>
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