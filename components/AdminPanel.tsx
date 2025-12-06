import React, { useState, useEffect } from 'react';
import { getHarbours, getSpecies, addRate, getRates, updateRateById, getSubscribers } from '../services/storageService';
import { Harbour, Species, Rate, VerificationLevel } from '../types';
import { getRelativeDate, parseCSV, shouldTriggerNotification, check_abnormal_change, formatCurrency, calculateConfidenceScore } from '../utils';
import { Save, CheckCircle, ArrowLeft, Upload, FileText, History, Edit2, AlertCircle, BellRing, ShieldCheck, AlertTriangle, Mic, MicOff, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoiceInput } from '../hooks/useVoiceInput';

type Tab = 'single' | 'bulk' | 'history';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('single');
  const [harbours, setHarbours] = useState<Harbour[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [recentRates, setRecentRates] = useState<Rate[]>([]);

  // Voice Input
  const { isListening, transcript, startListening, error: voiceError, setTranscript } = useVoiceInput();

  // Effect to handle voice transcript
  useEffect(() => {
    if (transcript) {
      // Try to extract numbers from transcript
      const numbers = transcript.match(/\d+/);
      if (numbers) {
        setPrice(numbers[0]);
        setTranscript(''); // Clear after using
      }
    }
  }, [transcript, setTranscript]);

  // Single Entry State
  const [selectedHarbour, setSelectedHarbour] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(getRelativeDate(0));

  // Data Accuracy Fields
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>('Phone Call');
  const [lotsChecked, setLotsChecked] = useState<number>(5);

  // Validation State
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Bulk Upload State
  const [csvContent, setCsvContent] = useState('');

  // Edit State
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [editPrice, setEditPrice] = useState('');

  // UI Status
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [notificationLog, setNotificationLog] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'harbour' | 'species' | 'verification' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const h = await getHarbours();
      setHarbours(h);
      const s = await getSpecies();
      setSpecies(s);
      await refreshHistory();
    };
    loadData();
  }, []);

  const refreshHistory = async () => {
    const allRates = await getRates();
    setRecentRates(allRates.slice(0, 20)); // Show last 20
  };

  const currentConfidence = calculateConfidenceScore(verificationLevel, lotsChecked);

  const checkAndNotify = async (harbourId: string, speciesId: string, newPrice: number) => {
    const yesterday = getRelativeDate(1);
    const existingRates = await getRates(harbourId, speciesId);
    const yesterdayRate = existingRates.find(r => r.date === yesterday);

    if (yesterdayRate && shouldTriggerNotification(yesterdayRate.price_per_kg, newPrice)) {
      const subs = await getSubscribers(harbourId);
      const sp = species.find(s => s.id === speciesId);
      if (subs.length > 0 && sp) {
        const change = ((newPrice - yesterdayRate.price_per_kg) / yesterdayRate.price_per_kg * 100).toFixed(1);
        const msg = `Alert: ${sp.name_en} changed by ${change}%! Notification sent to ${subs.length} subscribers via WhatsApp.`;
        setNotificationLog(msg);
        setTimeout(() => setNotificationLog(null), 8000);
      }
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHarbour && selectedSpecies && price) {
      const numPrice = parseFloat(price);

      const yesterday = getRelativeDate(1);
      const rates = await getRates(selectedHarbour, selectedSpecies);
      const prevRate = rates.find(r => r.date === yesterday);

      if (!warningMessage && prevRate) {
        if (check_abnormal_change(numPrice, prevRate.price_per_kg)) {
          const diffPercent = Math.abs((numPrice - prevRate.price_per_kg) / prevRate.price_per_kg);
          setWarningMessage(`Warning: Abnormal price change detected (${(diffPercent * 100).toFixed(0)}%). Previous: ₹${prevRate.price_per_kg}. Please confirm.`);
          return;
        }
      }

      await checkAndNotify(selectedHarbour, selectedSpecies, numPrice);

      await addRate({
        harbour_id: selectedHarbour,
        species_id: selectedSpecies,
        price_per_kg: numPrice,
        date: date,
        source_admin_id: 'admin_web',
        verification_level: verificationLevel,
        lots_checked: lotsChecked,
        rate_confidence_score: currentConfidence
      });

      setStatus('success');
      setPrice('');
      setWarningMessage(null);
      await refreshHistory();
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHarbour || !csvContent) return;

    const parsed = parseCSV(csvContent);

    // Process sequentially to avoid race conditions or overwhelming DB
    for (const item of parsed) {
      await checkAndNotify(selectedHarbour, item.species_id, item.price);
      await addRate({
        harbour_id: selectedHarbour,
        species_id: item.species_id,
        price_per_kg: item.price,
        date: date,
        source_admin_id: 'admin_bulk',
        verification_level: 'Unconfirmed',
        lots_checked: 0,
        rate_confidence_score: calculateConfidenceScore('Unconfirmed', 0)
      });
    }

    setStatus('success');
    setCsvContent('');
    await refreshHistory();
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-nunito">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/settings" className="mr-4 p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-slate-900">Admin Rate Engine</h1>
            <p className="text-slate-400 text-sm font-medium">Manage mandi rates and subscriptions</p>
          </div>
        </div>

        {status === 'success' && (
          <div className="mb-6 p-4 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-between animate-slide-up-spring">
            <div className="flex items-center font-bold">
              <CheckCircle className="w-6 h-6 mr-3" />
              Rate Updated Successfully
            </div>
            <button onClick={() => setStatus('idle')} className="text-white/80 hover:text-white"><ArrowLeft className="w-4 h-4 rotate-180" /></button>
          </div>
        )}

        {notificationLog && (
          <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-xl flex items-center shadow-sm animate-pulse">
            <BellRing className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">{notificationLog}</span>
          </div>
        )}

        {/* Segmented Control Tabs */}
        <div className="bg-slate-200 p-1.5 rounded-2xl flex mb-8 overflow-x-auto shadow-inner">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'single' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4 mr-2" /> Single Entry
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'bulk' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Upload className="w-4 h-4 mr-2" /> Bulk CSV
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <History className="w-4 h-4 mr-2" /> History
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-10 animate-fade-in">

          {/* SINGLE ENTRY */}
          {activeTab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mandi Location</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdown(openDropdown === 'harbour' ? null : 'harbour'); }}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all flex items-center justify-between hover:bg-slate-100"
                  >
                    <span>{harbours.find(h => h.id === selectedHarbour)?.name || 'Select Mandi...'}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'harbour' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'harbour' && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-slide-up-spring max-h-60 overflow-y-auto">
                      {harbours.map(h => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => { setSelectedHarbour(h.id); setOpenDropdown(null); }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${selectedHarbour === h.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                        >
                          {h.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Record Date</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fish Species</label>
                <button
                  type="button"
                  onClick={() => { setOpenDropdown(openDropdown === 'species' ? null : 'species'); }}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all flex items-center justify-between hover:bg-slate-100"
                >
                  <span>{species.find(s => s.id === selectedSpecies)?.name_en || 'Select Species...'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'species' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'species' && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-slide-up-spring max-h-60 overflow-y-auto">
                    {species.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedSpecies(s.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${selectedSpecies === s.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                      >
                        {s.name_en} <span className="text-xs text-slate-400 font-normal ml-1">({s.name_local})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Accuracy Section */}
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <h3 className="text-sm font-heading font-bold text-slate-700 mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                  Data Verification Source
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Source Type</label>
                    <button
                      type="button"
                      onClick={() => { setOpenDropdown(openDropdown === 'verification' ? null : 'verification'); }}
                      className="w-full p-3 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white flex items-center justify-between"
                    >
                      <span>{verificationLevel}</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'verification' ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === 'verification' && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-slide-up-spring">
                        {['Verified', 'Phone Call', 'Unconfirmed'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => { setVerificationLevel(level as VerificationLevel); setOpenDropdown(null); }}
                            className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-slate-50 transition-colors ${verificationLevel === level ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lots Checked</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={lotsChecked}
                      onChange={(e) => setLotsChecked(parseInt(e.target.value) || 0)}
                      className="w-full p-3 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Confidence Score</span>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${currentConfidence > 70 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-extrabold text-lg ${currentConfidence > 70 ? 'text-green-600' : 'text-red-500'}`}>
                      {currentConfidence}/100
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price Today (₹/kg)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className={`w-full pl-12 pr-14 p-5 bg-slate-50 border rounded-2xl focus:ring-4 outline-none font-mono text-2xl font-bold transition-all ${warningMessage ? 'border-red-300 text-red-600 bg-red-50 focus:ring-red-100 animate-pulse-soft' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400 text-slate-900'}`}
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setWarningMessage(null);
                    }}
                    required
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!isListening) {
                        startListening();
                      }
                    }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-blue-100 hover:text-blue-600'}`}
                    title="Speak Price"
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
                {voiceError && <p className="text-xs text-red-500 mt-2 font-bold">{voiceError}</p>}
              </div>

              {warningMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start animate-fade-in">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-bold mb-1">High Price Deviation Detected</p>
                    <p className="text-xs text-red-600 leading-relaxed mb-3">{warningMessage}</p>
                    <button
                      type="button"
                      onClick={() => setWarningMessage(null)}
                      className="px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Yes, Confirm This Price
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`btn-shine w-full py-5 rounded-2xl font-heading font-bold text-white text-lg transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] flex items-center justify-center space-x-2 ${warningMessage ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-200'
                  }`}
              >
                {warningMessage ? (
                  <span>Confirm Large Change</span>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Mandi Rate</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* BULK ENTRY */}
          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm mb-4">
                <span className="font-bold">Note:</span> Bulk upload sets verification to 'Unconfirmed' by default.
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mandi Location</label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
                    value={selectedHarbour}
                    onChange={(e) => setSelectedHarbour(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {harbours.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>CSV Data (Species ID, Price)</span>
                </label>
                <textarea
                  className="w-full h-48 p-4 bg-slate-900 text-cyan-300 font-mono text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={`s1, 120\ns2, 340`}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-shine w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-heading font-bold text-white text-lg transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Process CSV Batch</span>
              </button>
            </form>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-heading font-bold text-slate-700 mb-4">Recent Transactions</h3>
              <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Species</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trust</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {recentRates.map((rate) => {
                      const s = species.find(sp => sp.id === rate.species_id);
                      return (
                        <tr key={rate.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500">{rate.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{s?.name_en}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                            {formatCurrency(rate.price_per_kg)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <span className={`h-2 w-2 rounded-full ${rate.rate_confidence_score && rate.rate_confidence_score > 70 ? 'bg-green-500' : 'bg-red-400'}`}></span>
                              <span className="text-xs font-bold text-slate-500">{rate.rate_confidence_score || 50}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingRate(rate);
                                setEditPrice(rate.price_per_kg.toString());
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Edit Modal */}
          {editingRate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setEditingRate(null)} />

              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl z-10 p-8 relative overflow-hidden animate-slide-up-spring">
                <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">Edit Rate</h3>
                <p className="text-slate-500 text-sm mb-6">Update price for {species.find(s => s.id === editingRate.species_id)?.name_en}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Price (₹/kg)</label>
                    <input
                      type="number"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-900 text-lg"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => setEditingRate(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (editPrice) {
                          await updateRateById(editingRate.id, parseFloat(editPrice));
                          setEditingRate(null);
                          await refreshHistory();
                          setStatus('success');
                          setTimeout(() => setStatus('idle'), 3000);
                        }
                      }}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
                    >
                      Save
                    </button>
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