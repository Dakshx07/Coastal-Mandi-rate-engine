import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, Globe, Anchor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex flex-col font-nunito bg-[#020617]">

      {/* --- Premium Background --- */}
      <div className="absolute inset-0 z-0">
        {/* Multi-color Mesh Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>

        {/* Fish Animations (SVG) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="fish-animation fish-delay-1 w-24 h-24 text-white/5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 12c0 0-2.5-1.5-4.5-1.5S13 12 13 12s2-3.5 0-5-5 1.5-5 1.5S6 6 4 6 2 8 2 8s2.5 1.5 4.5 1.5S11 8 11 8s-2 3.5 0 5 5-1.5 5-1.5 2 2.5 4 2.5 2-2 2-2z" /></svg>
          <svg className="fish-animation fish-delay-2 w-16 h-16 text-white/5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 12c0 0-2.5-1.5-4.5-1.5S13 12 13 12s2-3.5 0-5-5 1.5-5 1.5S6 6 4 6 2 8 2 8s2.5 1.5 4.5 1.5S11 8 11 8s-2 3.5 0 5 5-1.5 5-1.5 2 2.5 4 2.5 2-2 2-2z" /></svg>
          <svg className="fish-animation fish-delay-3 w-20 h-20 text-white/5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 12c0 0-2.5-1.5-4.5-1.5S13 12 13 12s2-3.5 0-5-5 1.5-5 1.5S6 6 4 6 2 8 2 8s2.5 1.5 4.5 1.5S11 8 11 8s-2 3.5 0 5 5-1.5 5-1.5 2 2.5 4 2.5 2-2 2-2z" /></svg>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold py-2 px-3 rounded-xl outline-none cursor-pointer hover:bg-white/20 transition-colors"
        >
          <option value="en" className="text-slate-900">🇺🇸 English</option>
          <option value="hi" className="text-slate-900">🇮🇳 Hindi</option>
          <option value="ml" className="text-slate-900">🌴 Malayalam</option>
          <option value="kn" className="text-slate-900">🐘 Kannada</option>
        </select>
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">

        {/* Logo Mark */}
        <div className={`transition-all duration-1000 transform ${stage >= 1 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90'}`}>
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-3xl blur-xl opacity-40 animate-pulse"></div>
            <div className="relative w-full h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
              <img src="/logo.svg" alt="Logo" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className={`transition-all duration-1000 delay-200 transform ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-[11px] font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
            <Globe className="w-3 h-3 mr-2" /> Coastal Intelligence Network
          </div>

          <h1 className="text-5xl sm:text-7xl font-heading font-black text-white leading-tight mb-6 tracking-tight">
            {t('hero.title')}
          </h1>

          <p className="text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed mb-10">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Feature Pills */}
        <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 delay-500 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center px-4 py-2 bg-white/5 border border-white/5 rounded-full backdrop-blur-sm">
            <Activity className="w-4 h-4 text-emerald-400 mr-2" />
            <span className="text-sm font-bold text-slate-300">Live Trends</span>
          </div>
          <div className="flex items-center px-4 py-2 bg-white/5 border border-white/5 rounded-full backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm font-bold text-slate-300">Verified Data</span>
          </div>
        </div>
      </div>

      {/* --- Bottom Actions --- */}
      <div className={`relative z-10 px-6 pb-12 w-full max-w-md mx-auto transition-all duration-1000 ${stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <button
          onClick={() => navigate('/signup')}
          className="btn-shine w-full group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-bold py-5 rounded-2xl shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center mb-4 overflow-hidden border border-white/10"
        >
          <span className="text-lg relative z-10">{t('btn.getStarted')}</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white font-heading font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-sm"
        >
          {t('btn.login')}
        </button>
      </div>
    </div>
  );
};