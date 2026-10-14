import React, { useState } from 'react';
import { X, Bell, CheckCircle2, Coffee } from 'lucide-react';
import { Product } from '../types';
import { api } from '../lib/api';

interface NotifyModalProps {
  product: Product | null;
  onClose: () => void;
}

export const NotifyModal: React.FC<NotifyModalProps> = ({ product, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.submitNotification({
        email,
        productId: product.id,
        productName: product.name,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] hover:bg-[#B97845] flex items-center justify-center transition-colors border border-[#3B2417]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#21150F] border border-[#3B2417] text-[#C9945C] flex items-center justify-center mb-4">
          <Bell className="w-6 h-6 animate-pulse" />
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B97845] font-bold block mb-1">
          CURRENTLY SOLD OUT
        </span>

        <h3 className="font-display text-2xl font-bold text-[#FFF9F2] mb-2">
          Don't Miss The Next Brew.
        </h3>

        <p className="text-xs text-[#F4E7D7]/70 mb-6 font-body leading-relaxed">
          {product.name} is currently out of stock. Leave your email and we'll notify you the moment our fresh roast batch is ready at the espresso bar.
        </p>

        {isSuccess ? (
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-emerald-200">
              You're on the priority list! We'll email you once freshly brewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#F4E7D7]/80 block mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coffee.lover@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845] transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-mono">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] font-bold text-xs tracking-wider uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#B97845]/20 disabled:opacity-50"
            >
              {isSubmitting ? 'REGISTERING...' : 'NOTIFY ME ☕'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
