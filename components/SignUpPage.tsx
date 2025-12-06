import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Anchor, Mail, Lock, User as UserIcon, ArrowRight, ChevronLeft } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Zod-like Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!name.trim()) {
      setError("Full Name is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("Password must be 6+ chars, with 1 uppercase & 1 number");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await signup(name, email, password);
    if (error) {
      setError(error.message);
    } else {
      navigate('/home');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4 font-nunito">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors font-bold text-sm hover:-translate-x-1 duration-200">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 animate-slide-up-spring">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-emerald-500/30 transform -rotate-3 group">
              <Anchor className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium mt-2 text-sm">Join thousands of traders today.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="Full Name"
                required
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 shadow-sm"
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
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="Password"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="Confirm Password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-heading font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center group transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6 font-medium">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-white transition-colors font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};