import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Anchor, Mail, Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

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

  return (
    <div className="min-h-screen bg-[#0B1120] relative overflow-hidden flex items-center justify-center p-4 font-nunito">
      {/* Premium Animated Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-soft"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '3s' }}></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-all font-bold text-sm hover:-translate-x-1 duration-300 group">
          <div className="p-1 rounded-full bg-white/5 group-hover:bg-white/10 mr-2 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Home
        </Link>

        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 sm:p-12 animate-slide-up-spring relative overflow-hidden">
          {/* Shine Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-3xl mb-6 shadow-lg shadow-blue-500/20 transform rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <Anchor className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight mt-2">Welcome Back</h1>
            <p className="text-slate-400 font-medium mt-3 text-sm leading-relaxed">Enter your credentials to access the real-time market dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-900/80 outline-none font-bold text-white transition-all duration-300 placeholder:text-slate-600 shadow-inner"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-900/80 outline-none font-bold text-white transition-all duration-300 placeholder:text-slate-600 shadow-inner"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl text-center border border-red-500/20 animate-shake flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/30 flex items-center justify-center group transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8 font-medium">
            New to Coastal Mandi? <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-bold ml-1 hover:underline decoration-blue-400/30 underline-offset-4">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};