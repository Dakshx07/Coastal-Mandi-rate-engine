import React from 'react';
import { DailyRateSummary } from '../types';
import { TrendingUp, TrendingDown, Minus, ChevronRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils';

interface Props {
  summary: DailyRateSummary;
  onClick: () => void;
}

export const SpeciesCard: React.FC<Props> = ({ summary, onClick }) => {
  const { species, todayRate, change } = summary;

  // Status Styling
  const isUp = change.status === 'UP';
  const isDown = change.status === 'DOWN';
  
  const statusColor = isUp ? 'text-emerald-600 bg-emerald-50' : isDown ? 'text-red-500 bg-red-50' : 'text-slate-500 bg-slate-100';
  const StatusIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  const confidenceScore = todayRate?.rate_confidence_score || 0;
  
  // Confidence Ring Color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-400';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] group relative overflow-hidden"
    >
      <div className="flex items-start space-x-4">
        {/* Image Thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative shadow-inner">
          <img 
            src={species.image_url} 
            alt={species.name_en} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-heading font-bold text-slate-800 leading-tight truncate">
                {species.name_en}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                {species.name_local}
              </p>
            </div>
            
            {/* Price Block */}
            <div className="text-right">
              {todayRate ? (
                <div className="flex flex-col items-end">
                   <span className="text-lg font-bold text-slate-900 leading-none tracking-tight">
                    {formatCurrency(todayRate.price_per_kg)}
                   </span>
                   <span className="text-[10px] text-slate-400 font-semibold mt-1">/kg</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">No Data</span>
              )}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              {/* Trend Badge */}
              <div className={`flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${statusColor}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {change.description}
              </div>

              {/* Trust Badge */}
              {todayRate && (
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                  <ShieldCheck className={`w-3 h-3 ${getConfidenceColor(confidenceScore)}`} />
                  <span>{confidenceScore}% Trust</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};