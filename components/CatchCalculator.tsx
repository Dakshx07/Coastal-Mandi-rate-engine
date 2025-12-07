import React, { useState, useEffect } from 'react';
import { X, Calculator, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import { DailyRateSummary } from '../types';
import { formatCurrency } from '../utils';

interface CatchCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    summaries: DailyRateSummary[];
}

export const CatchCalculator: React.FC<CatchCalculatorProps> = ({ isOpen, onClose, summaries }) => {
    const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [revenue, setRevenue] = useState<number | null>(null);

    useEffect(() => {
        if (summaries.length > 0 && !selectedSpeciesId) {
            setSelectedSpeciesId(summaries[0].species.id);
        }
    }, [summaries]);

    const calculateRevenue = () => {
        const species = summaries.find(s => s.species.id === selectedSpeciesId);
        if (species && species.todayRate && quantity) {
            const qty = parseFloat(quantity);
            if (!isNaN(qty)) {
                setRevenue(qty * species.todayRate.price_per_kg);
            }
        }
    };

    if (!isOpen) return null;

    const selectedSpecies = summaries.find(s => s.species.id === selectedSpeciesId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up-spring">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-heading font-bold">Catch Revenue</h2>
                    </div>
                    <p className="text-emerald-50 text-sm font-medium opacity-90">Estimate your earnings instantly.</p>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Species</label>
                        <select
                            value={selectedSpeciesId}
                            onChange={(e) => {
                                setSelectedSpeciesId(e.target.value);
                                setRevenue(null);
                            }}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        >
                            {summaries.map(s => (
                                <option key={s.species.id} value={s.species.id}>
                                    {s.species.name_en} ({s.species.name_local}) - ₹{s.todayRate?.price_per_kg || 'N/A'}/kg
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Quantity (kg)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                    setRevenue(null);
                                }}
                                placeholder="e.g. 50"
                                className="w-full p-3 pl-4 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">KG</span>
                        </div>
                    </div>

                    {revenue !== null && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 animate-fade-in text-center">
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">Estimated Revenue</div>
                            <div className="text-3xl font-heading font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                                {formatCurrency(revenue)}
                            </div>
                            {selectedSpecies?.change.status === 'UP' && (
                                <div className="mt-2 inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-900/50 px-2 py-1 rounded-lg shadow-sm">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Prices are up {selectedSpecies.change.percentDiff}% today!
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={calculateRevenue}
                        className="btn-shine w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-xl font-heading font-bold shadow-lg shadow-slate-900/20 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                    >
                        Calculate
                    </button>
                </div>
            </div>
        </div>
    );
};
