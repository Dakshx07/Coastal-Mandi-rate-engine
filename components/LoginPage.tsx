import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Anchor, Mail, Lock, Chrome, Apple, ArrowRight, ChevronLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (email && password) {
      setLoading(true);
      const { error } = await login(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/home');
      }
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    // For MVP, we'll just show an alert as social auth requires more setup
    alert(`${provider} login coming soon! Please use email/password.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4 font-nunito">
      {/* Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors font-bold text-sm hover:-translate-x-1 duration-200">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 animate-fade-in">

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg shadow-blue-600/30 transform rotate-3">
              <Anchor className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium mt-3">Sign in to access real-time mandi rates.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="Password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center group transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group active:scale-[0.98]"
            >
              <Chrome className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
              <span className="font-bold text-slate-600 group-hover:text-slate-900">Google</span>
            </button>
            <button
              onClick={() => handleSocialLogin('Apple')}
              className="flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group active:scale-[0.98]"
            >
              <Apple className="w-5 h-5 text-slate-600 group-hover:text-black transition-colors" />
              <span className="font-bold text-slate-600 group-hover:text-slate-900">Apple</span>
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Don't have an account? <Link to="/signup" className="text-blue-400 hover:text-white transition-colors font-bold">Create one</Link>
        </p>
      </div>
    </div>
  );
};