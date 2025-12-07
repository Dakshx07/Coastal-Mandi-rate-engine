import React from 'react';
import { DailyRateSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
    summaries: DailyRateSummary[];
}

export const PriceTicker: React.FC<Props> = ({ summaries }) => {
    const { language } = useLanguage();
    if (summaries.length === 0) return null;

    return (
        <div className="bg-slate-900 text-white overflow-hidden py-3 relative z-40 border-b border-slate-800 shadow-md">
            <div className="flex animate-marquee whitespace-nowrap will-change-transform hover:pause">
                {/* Duplicate list for seamless loop */}
                {[...summaries, ...summaries, ...summaries, ...summaries, ...summaries].map((summary, index) => {
                    const changeValue = summary.change.percentDiff || 0;
                    const isValidChange = !isNaN(changeValue) && changeValue !== 0;
                    const displayName = language === 'en' ? summary.species.name_en : summary.species.name_local;

                    return (
                        <div key={`${summary.species.id}-${index}`} className="flex items-center mx-6 text-sm font-medium">
                            <span className="text-slate-400 mr-2">{displayName}:</span>
                            <span className="font-bold mr-2 text-white">₹{summary.todayRate?.price_per_kg || 'N/A'}</span>
                            {isValidChange && (
                                <span className={`flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse ${summary.change.status === 'UP' ? 'bg-emerald-500/20 text-emerald-400' :
                                    summary.change.status === 'DOWN' ? 'bg-red-500/20 text-red-400' : 'text-slate-500'
                                    }`}>
                                    {summary.change.status === 'UP' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                                        summary.change.status === 'DOWN' ? <TrendingDown className="w-3 h-3 mr-1" /> :
                                            <Minus className="w-3 h-3 mr-1" />}
                                    {changeValue}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
