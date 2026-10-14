import React, { useState } from 'react';
import { Coffee, Lock, User, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginViewProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onBackToHome,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await login({ username: username.trim(), password: password.trim() });
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid username or password. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0908] flex items-center justify-center p-4 relative overflow-hidden text-left">
      
      {/* Background Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-b from-[#B97845]/20 via-[#6F4E37]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#160E0A] border border-[#3B2417] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-8">
        
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4E7D7]/70 hover:text-[#FFF9F2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Coffee House</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B97845] to-[#3B2417] p-0.5 shadow-xl mx-auto">
            <div className="w-full h-full bg-[#0A0908] rounded-2xl flex items-center justify-center">
              <Coffee className="w-7 h-7 text-[#C9945C]" />
            </div>
          </div>

          <span className="text-[11px] font-mono font-bold tracking-[0.3em] uppercase text-[#B97845] block">
            ADMIN & STAFF PORTAL
          </span>
          <h2 className="font-display text-3xl font-extrabold uppercase text-[#FFF9F2] tracking-tight">
            COFFEE AROMA
          </h2>
          <p className="text-xs text-[#F4E7D7]/70 font-body">
            Log in to access POS billing, live inventory sync, menu management, and sales analytics.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#F4E7D7]/80 block mb-1.5 font-semibold">
              Username / Staff ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#B97845] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs font-mono focus:outline-none focus:border-[#B97845] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#F4E7D7]/80 block mb-1.5 font-semibold">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B97845] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs font-mono focus:outline-none focus:border-[#B97845] transition-colors"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-mono text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#B97845]/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>VERIFYING CREDENTIALS...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>AUTHENTICATE & ENTER</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
