import React, { useState, useEffect } from 'react';
import { getHarbours, getSpecies, addRate, getRates, updateRateById, getSubscribers, addHarbour, addSpecies } from '../services/storageService';
import { Harbour, Species, Rate, VerificationLevel, Subscriber } from '../types';
import { getRelativeDate, parseCSV, shouldTriggerNotification, check_abnormal_change, formatCurrency, calculateConfidenceScore } from '../utils';
import { Save, CheckCircle, ArrowLeft, Upload, FileText, History, Edit2, AlertCircle, BellRing, ShieldCheck, AlertTriangle, Mic, MicOff, ChevronDown, Users, Send, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoiceInput } from '../hooks/useVoiceInput';

type Tab = 'single' | 'bulk' | 'history' | 'manage';

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

  // Manage Tab State
  const [newHarbourName, setNewHarbourName] = useState('');
  const [newHarbourState, setNewHarbourState] = useState('');
  const [newSpeciesEn, setNewSpeciesEn] = useState('');
  const [newSpeciesLocal, setNewSpeciesLocal] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [broadcastHarbour, setBroadcastHarbour] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-nunito transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/settings" className="mr-4 p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">Admin Rate Engine</h1>
            <div className="flex items-center space-x-2">
              <p className="text-slate-400 text-sm font-medium">Manage mandi rates and subscriptions</p>
              <span className="text-slate-300">•</span>
              <div className="flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">System Online</span>
              </div>
            </div>
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
        <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-2xl flex mb-8 overflow-x-auto shadow-inner">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'single' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <FileText className="w-4 h-4 mr-2" /> Single Entry
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'bulk' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Upload className="w-4 h-4 mr-2" /> Bulk CSV
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <History className="w-4 h-4 mr-2" /> History
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'manage' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Settings className="w-4 h-4 mr-2" /> Manage
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-10 animate-fade-in">

          {/* SINGLE ENTRY */}
          {activeTab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Mandi Location</label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdown(openDropdown === 'harbour' ? null : 'harbour'); }}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-800 dark:text-white transition-all flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span>{harbours.find(h => h.id === selectedHarbour)?.name || 'Select Mandi...'}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'harbour' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'harbour' && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 animate-slide-up-spring max-h-60 overflow-y-auto">
                      {harbours.map(h => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => { setSelectedHarbour(h.id); setOpenDropdown(null); }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedHarbour === h.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          {h.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Record Date</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-800 dark:text-white transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Fish Species</label>
                <button
                  type="button"
                  onClick={() => { setOpenDropdown(openDropdown === 'species' ? null : 'species'); }}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-800 dark:text-white transition-all flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span>{species.find(s => s.id === selectedSpecies)?.name_en || 'Select Species...'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'species' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'species' && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 animate-slide-up-spring max-h-60 overflow-y-auto">
                    {species.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedSpecies(s.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedSpecies === s.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {s.name_en} <span className="text-xs text-slate-400 font-normal ml-1">({s.name_local})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Accuracy Section */}
              <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                <h3 className="text-sm font-heading font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Data Verification Source
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Source Type</label>
                    <button
                      type="button"
                      onClick={() => { setOpenDropdown(openDropdown === 'verification' ? null : 'verification'); }}
                      className="w-full p-3 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white dark:bg-slate-800 dark:text-white flex items-center justify-between"
                    >
                      <span>{verificationLevel}</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'verification' ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === 'verification' && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 animate-slide-up-spring">
                        {['Verified', 'Phone Call', 'Unconfirmed'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => { setVerificationLevel(level as VerificationLevel); setOpenDropdown(null); }}
                            className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${verificationLevel === level ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-300'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Lots Checked</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={lotsChecked}
                      onChange={(e) => setLotsChecked(parseInt(e.target.value) || 0)}
                      className="w-full p-3 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Confidence Score</span>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${currentConfidence > 70 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-extrabold text-lg ${currentConfidence > 70 ? 'text-green-600' : 'text-red-500'}`}>
                      {currentConfidence}/100
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Price Today (₹/kg)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className={`w-full pl-12 pr-14 p-5 bg-slate-50 dark:bg-slate-900 border rounded-2xl focus:ring-4 outline-none font-mono text-2xl font-bold transition-all ${warningMessage ? 'border-red-300 text-red-600 bg-red-50 focus:ring-red-100 animate-pulse-soft' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 text-slate-900 dark:text-white'}`}
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
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-100 hover:text-blue-600'}`}
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
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Mandi Location</label>
                  <select
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700 dark:text-slate-300"
                    value={selectedHarbour}
                    onChange={(e) => setSelectedHarbour(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {harbours.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700 dark:text-slate-300"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                  <span>CSV Data (Species ID, Price)</span>
                </label>
                <textarea
                  className="w-full h-48 p-4 bg-slate-900 dark:bg-black text-cyan-300 font-mono text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
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
              <h3 className="font-heading font-bold text-slate-700 dark:text-white mb-4">Recent Transactions</h3>
              <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Species</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trust</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-50 dark:divide-slate-700">
                    {recentRates.map((rate) => {
                      const s = species.find(sp => sp.id === rate.species_id);
                      return (
                        <tr key={rate.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500 dark:text-slate-400">{rate.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-white">{s?.name_en}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
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

          {/* MANAGE */}
          {activeTab === 'manage' && (
            <div className="space-y-8 animate-fade-in">
              {/* Add Harbour & Species */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-slate-700 dark:text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" /> Add New Mandi
                  </h3>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Mandi Name</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700 dark:text-white"
                        placeholder="e.g. Malpe Harbour"
                        value={newHarbourName}
                        onChange={(e) => setNewHarbourName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">State</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700 dark:text-white"
                        placeholder="e.g. Karnataka"
                        value={newHarbourState}
                        onChange={(e) => setNewHarbourState(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (newHarbourName && newHarbourState) {
                          await addHarbour(newHarbourName, newHarbourState);
                          const h = await getHarbours();
                          setHarbours(h);
                          setNewHarbourName('');
                          setNewHarbourState('');
                          setStatus('success');
                          setTimeout(() => setStatus('idle'), 3000);
                        }
                      }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
                    >
                      Add Mandi
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-slate-700 dark:text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" /> Add New Species
                  </h3>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">English Name</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none font-bold text-slate-700 dark:text-white"
                        placeholder="e.g. King Fish"
                        value={newSpeciesEn}
                        onChange={(e) => setNewSpeciesEn(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Local Name</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none font-bold text-slate-700 dark:text-white"
                        placeholder="e.g. Anjal"
                        value={newSpeciesLocal}
                        onChange={(e) => setNewSpeciesLocal(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (newSpeciesEn && newSpeciesLocal) {
                          await addSpecies(newSpeciesEn, newSpeciesLocal);
                          const s = await getSpecies();
                          setSpecies(s);
                          setNewSpeciesEn('');
                          setNewSpeciesLocal('');
                          setStatus('success');
                          setTimeout(() => setStatus('idle'), 3000);
                        }
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200"
                    >
                      Add Species
                    </button>
                  </div>
                </div>
              </div>



              <hr className="border-slate-100" />

              {/* Broadcast & Subscribers */}
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-slate-700 dark:text-white flex items-center">
                  <Send className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> WhatsApp Broadcast Center
                </h3>
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="mb-6">
                        <label className="block text-xs font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider mb-2">Target Mandi</label>
                        <select
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-700 dark:text-white"
                          value={broadcastHarbour}
                          onChange={async (e) => {
                            setBroadcastHarbour(e.target.value);
                            if (e.target.value) {
                              const subs = await getSubscribers(e.target.value);
                              setSubscribers(subs);
                            } else {
                              setSubscribers([]);
                            }
                          }}
                        >
                          <option value="">Select Mandi...</option>
                          {harbours.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                      </div>

                      {broadcastHarbour && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Audience</h4>
                              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-full">{subscribers.length} Subscribers</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                              {subscribers.length > 0 ? (
                                subscribers.map((sub, idx) => (
                                  <div key={idx} className="flex items-center text-xs text-slate-600 dark:text-slate-300 p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    {sub.phone_number}
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-slate-400 italic">No subscribers yet.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {broadcastHarbour && (
                      <div className="space-y-4 animate-fade-in">
                        <div>
                          <label className="block text-xs font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider mb-2">Message Preview</label>
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap h-48 overflow-y-auto shadow-inner">
                            {`📢 *${harbours.find(h => h.id === broadcastHarbour)?.name} Daily Update* 📢\n\n📅 ${new Date().toLocaleDateString()}\n\n🔥 *Top Movers:*\n• King Fish: ₹520/kg (⬆️ 5%)\n• Sardine: ₹120/kg (⬇️ 2%)\n\n📊 *Market Trend:* Bullish 📈\n\nCheck the app for full rates! 🔗`}
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setIsBroadcasting(true);
                              // Simulate backend processing
                              setTimeout(() => {
                                setIsBroadcasting(false);
                                setNotificationLog(`🚀 Broadcast queued for ${subscribers.length} subscribers!`);
                                setTimeout(() => setNotificationLog(null), 5000);
                              }, 1500);
                            }}
                            disabled={isBroadcasting || subscribers.length === 0}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center"
                          >
                            {isBroadcasting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Now
                              </>
                            )}
                          </button>

                          <a
                            href={`https://web.whatsapp.com/send?text=${encodeURIComponent(`📢 *${harbours.find(h => h.id === broadcastHarbour)?.name} Daily Update* 📢\n\n📅 ${new Date().toLocaleDateString()}\n\n🔥 *Top Movers:*\n• King Fish: ₹520/kg (⬆️ 5%)\n• Sardine: ₹120/kg (⬇️ 2%)\n\n📊 *Market Trend:* Bullish 📈\n\nCheck the app for full rates! 🔗`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 bg-green-50 text-green-600 hover:bg-green-100 font-bold rounded-xl transition-colors flex items-center justify-center border border-green-200"
                            title="Open in WhatsApp Web"
                          >
                            <span className="text-xl">📱</span>
                          </a>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 font-medium">
                          *Uses lightweight client-side automation to trigger messages via WhatsApp Web/API.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Edit Modal */}
          {editingRate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setEditingRate(null)} />

              <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl z-10 p-8 relative overflow-hidden animate-slide-up-spring">
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-2">Edit Rate</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Update price for {species.find(s => s.id === editingRate.species_id)?.name_en}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">New Price (₹/kg)</label>
                    <input
                      type="number"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-900 dark:text-white text-lg"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => setEditingRate(null)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors"
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