import React from 'react';
import { X, Award, Gift, Sparkles, TrendingUp, History, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const LoyaltyModal: React.FC = () => {
  const {
    loyaltyAccount,
    isLoyaltyModalOpen,
    setIsLoyaltyModalOpen,
    redeemPointsDiscount,
    pointsToRedeem,
    setPointsToRedeem,
    pointsDiscountValue,
    subtotal,
  } = useCart();

  if (!isLoyaltyModalOpen) return null;

  const tierColors = {
    BRONZE: 'from-amber-700 to-amber-950 border-amber-600/50 text-amber-300',
    SILVER: 'from-slate-400 to-slate-800 border-slate-400/50 text-slate-200',
    GOLD: 'from-yellow-500 to-amber-900 border-yellow-400/50 text-yellow-300',
    PLATINUM: 'from-cyan-500 to-slate-900 border-cyan-400/50 text-cyan-200',
  };

  const nextTierInfo = {
    BRONZE: { next: 'SILVER', req: 500 },
    SILVER: { next: 'GOLD', req: 1500 },
    GOLD: { next: 'PLATINUM', req: 3000 },
    PLATINUM: { next: 'MAX TIER', req: 3000 },
  };

  const currentTier = loyaltyAccount.tier;
  const currentReq = nextTierInfo[currentTier].req;
  const progressPercent = Math.min(100, Math.round((loyaltyAccount.totalPointsEarned / currentReq) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#0A0908] border-b border-[#3B2417] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B97845] to-[#3B2417] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#0A0908] rounded-2xl flex items-center justify-center text-[#C9945C]">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-[#FFF9F2] uppercase tracking-wide">
                  COFFEE AROMA REWARDS
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-black text-amber-400">
                  MY LOYALTY
                </span>
              </div>
              <p className="text-xs text-[#F4E7D7]/60 font-body">
                Earn 1 Point for every ₹10 spent. Redeem at 100 Points = ₹1!
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLoyaltyModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#21150F] hover:bg-[#B97845] text-[#FFF9F2] flex items-center justify-center transition-colors border border-[#3B2417]"
            aria-label="Close Loyalty Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Main Loyalty Member Card */}
          <div className={`p-6 rounded-3xl bg-gradient-to-br ${tierColors[currentTier]} border shadow-xl relative overflow-hidden`}>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 block">
                  MEMBERSHIP STATUS
                </span>
                <span className="font-display text-2xl font-black text-white tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  {currentTier} MEMBER
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 block">
                  AVAILABLE POINTS
                </span>
                <span className="font-display text-3xl font-black text-white">
                  {loyaltyAccount.points}
                </span>
                <span className="text-[10px] font-mono text-white/80 block">≈ ₹{(loyaltyAccount.points / 100).toFixed(2)} discount value</span>
              </div>
            </div>

            {/* Tier Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-white/20">
              <div className="flex justify-between text-[11px] font-mono text-white/90">
                <span>Lifetime Earned: {loyaltyAccount.totalPointsEarned} pts</span>
                {currentTier !== 'PLATINUM' ? (
                  <span>{currentReq - loyaltyAccount.totalPointsEarned} pts to {nextTierInfo[currentTier].next}</span>
                ) : (
                  <span>Highest VIP Level Reached 🎉</span>
                )}
              </div>
              <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-300 to-yellow-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* How Points Work Quick Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0908] border border-[#3B2417] p-3.5 rounded-2xl text-center space-y-1">
              <Gift className="w-4 h-4 text-[#B97845] mx-auto" />
              <span className="text-[10px] font-mono text-[#F4E7D7]/60 uppercase block">Earn Rate</span>
              <span className="text-xs font-bold text-[#FFF9F2] block">1 Pt per ₹10</span>
            </div>

            <div className="bg-[#0A0908] border border-[#3B2417] p-3.5 rounded-2xl text-center space-y-1">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto" />
              <span className="text-[10px] font-mono text-[#F4E7D7]/60 uppercase block">Redeem Value</span>
              <span className="text-xs font-bold text-emerald-400 block">100 Pts = ₹1</span>
            </div>

            <div className="bg-[#0A0908] border border-[#3B2417] p-3.5 rounded-2xl text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-sky-400 mx-auto" />
              <span className="text-[10px] font-mono text-[#F4E7D7]/60 uppercase block">Expiry</span>
              <span className="text-xs font-bold text-[#FFF9F2] block">Never Expires</span>
            </div>
          </div>

          {/* Redeem In-Cart Discount Section */}
          {loyaltyAccount.points >= 100 && subtotal > 0 && (
            <div className="bg-[#21150F] border border-[#B97845]/50 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#FFF9F2] uppercase font-mono flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    REDEEM POINTS ON CURRENT ORDER
                  </h4>
                  <p className="text-[11px] text-[#F4E7D7]/70">
                    Apply up to ₹{Math.min(Math.floor(loyaltyAccount.points / 100), subtotal)} discount immediately (100 Pts = ₹1).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="100"
                  min="0"
                  max={Math.min(loyaltyAccount.points, subtotal * 100)}
                  value={pointsToRedeem || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    redeemPointsDiscount(val);
                  }}
                  placeholder="Enter points in 100s (e.g. 100, 200)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#0A0908] border border-[#3B2417] text-xs text-[#FFF9F2] focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => redeemPointsDiscount(Math.min(loyaltyAccount.points, subtotal * 100))}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase transition-all whitespace-nowrap"
                >
                  MAX POINTS
                </button>
                {pointsDiscountValue > 0 && (
                  <button
                    onClick={() => redeemPointsDiscount(0)}
                    className="px-2.5 py-2 rounded-xl bg-rose-950 text-rose-300 text-xs font-mono font-bold uppercase border border-rose-800"
                  >
                    RESET
                  </button>
                )}
              </div>

              {pointsDiscountValue > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{pointsToRedeem} points redeemed for ₹{pointsDiscountValue} cart discount!</span>
                </div>
              )}
            </div>
          )}

          {/* Points History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#B97845] font-bold flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                RECENT ACTIVITY & REWARD LOG
              </span>
              <span className="text-[10px] font-mono text-[#F4E7D7]/50">
                {loyaltyAccount.history.length} transactions
              </span>
            </div>

            <div className="bg-[#0A0908] border border-[#3B2417] rounded-2xl overflow-hidden divide-y divide-[#3B2417]/50">
              {loyaltyAccount.history.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-[#F4E7D7]/50">
                  No rewards history yet. Place your first order to earn points!
                </div>
              ) : (
                loyaltyAccount.history.slice(0, 8).map((tx) => (
                  <div key={tx.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#FFF9F2] block">{tx.description}</span>
                      <span className="text-[10px] font-mono text-[#F4E7D7]/50">
                        {tx.date} • {tx.time} {tx.billNumber ? `(Bill #${tx.billNumber})` : ''}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.type === 'EARNED' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'EARNED' ? `+${tx.points}` : `-${tx.points}`} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0A0908] border-t border-[#3B2417] flex justify-end">
          <button
            onClick={() => setIsLoyaltyModalOpen(false)}
            className="px-6 py-2.5 rounded-full bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] text-xs font-mono font-black uppercase tracking-wider transition-all"
          >
            GOT IT / CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
