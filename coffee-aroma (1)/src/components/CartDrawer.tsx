import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, Coffee, Award, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ShopStatus } from '../types';

interface CartDrawerProps {
  shopStatus: ShopStatus | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ shopStatus }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    total,
    totalItemCount,
    activeOffer,
    checkout,
    isCheckingOut,
    loyaltyAccount,
    pointsDiscountValue,
    redeemPointsDiscount,
    setIsLoyaltyModalOpen,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNo, setTableNo] = useState('Dine-in (Counter)');
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const earnedPointsEstimate = Math.max(1, Math.round(total / 10));

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopStatus?.isOpen) {
      setErrorMsg("Shop is currently closed for new orders.");
      return;
    }
    if (items.length === 0) return;

    try {
      setErrorMsg('');
      await checkout({
        customerName: customerName.trim() || 'Coffee Aroma Guest',
        customerPhone: customerPhone.trim(),
        tableNo,
      });
      setIsCheckoutStep(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#160E0A] border-l border-[#3B2417] h-full flex flex-col shadow-2xl text-left overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#3B2417] flex items-center justify-between bg-[#0A0908]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#21150F] border border-[#3B2417] flex items-center justify-center text-[#C9945C]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#FFF9F2] uppercase tracking-wider">
                YOUR BAG
              </h3>
              <span className="text-[10px] font-mono text-[#F4E7D7]/60 block">
                {totalItemCount} {totalItemCount === 1 ? 'ITEM' : 'ITEMS'} SELECTED
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCartOpen(false);
              setIsCheckoutStep(false);
            }}
            className="w-8 h-8 rounded-full bg-[#21150F] hover:bg-[#B97845] text-[#FFF9F2] flex items-center justify-center transition-colors border border-[#3B2417]"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#21150F] border border-[#3B2417] flex items-center justify-center mx-auto text-[#B97845]">
                <Coffee className="w-8 h-8 opacity-40" />
              </div>
              <h4 className="font-display text-xl font-bold text-[#FFF9F2]">
                Your Bag Is Empty
              </h4>
              <p className="text-xs text-[#F4E7D7]/60 max-w-xs mx-auto font-body">
                Explore our artisanal roasts and golden fluffy pancakes to add your favorite picks.
              </p>
            </div>
          ) : isCheckoutStep ? (
            /* Checkout Step Form */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="bg-[#21150F]/70 border border-[#3B2417] rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                  PAYMENT METHOD
                </span>
                <p className="text-xs font-semibold text-[#FFF9F2]">
                  💵 PAY AT COUNTER
                </p>
                <p className="text-[11px] text-[#F4E7D7]/70">
                  Place order online & complete payment (Cash/UPI/Card) when picking up at the counter.
                </p>
              </div>

              {/* Loyalty Reward Estimator */}
              <div className="bg-gradient-to-r from-amber-950/40 to-[#21150F] border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                      LOYALTY POINTS TO EARN
                    </span>
                    <span className="text-xs font-bold text-[#FFF9F2]">
                      +{earnedPointsEstimate} Points on this purchase
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">1 Pt / ₹10</span>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#F4E7D7]/80 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rutik Mane"
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#F4E7D7]/80 block mb-1">
                  Phone Number (for SMS & Loyalty)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 9823000000"
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#F4E7D7]/80 block mb-1">
                  Order Type / Table No. (Optional)
                </label>
                <select
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                >
                  <option value="">None / Not Specified</option>
                  <option value="Dine-in (Counter)">Dine-in (Counter Pickup)</option>
                  <option value="Table 1">Table 01</option>
                  <option value="Table 2">Table 02</option>
                  <option value="Table 3">Table 03</option>
                  <option value="Table 4">Table 04</option>
                  <option value="Takeaway Package">Takeaway / Parcel</option>
                </select>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono">
                  {errorMsg}
                </div>
              )}
            </form>
          ) : (
            /* Items List */
            <>
              {/* Loyalty Quick Banner in Cart */}
              <div className="bg-[#21150F] border border-[#3B2417] rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block">
                      My Loyalty Balance
                    </span>
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {loyaltyAccount?.points || 0} pts (≈ ₹{((loyaltyAccount?.points || 0) / 100).toFixed(2)})
                    </span>
                  </div>
                </div>
                {loyaltyAccount?.points >= 100 ? (
                  <button
                    onClick={() => {
                      if (pointsDiscountValue > 0) {
                        redeemPointsDiscount(0);
                      } else {
                        redeemPointsDiscount(Math.min(loyaltyAccount.points, subtotal * 100));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors ${
                      pointsDiscountValue > 0
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                  >
                    {pointsDiscountValue > 0 ? 'REMOVE PTS' : 'USE POINTS'}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsLoyaltyModalOpen(true)}
                    className="text-[10px] font-mono text-[#B97845] hover:underline"
                  >
                    VIEW PERKS
                  </button>
                )}
              </div>

              {pointsDiscountValue > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Applied {pointsDiscountValue * 100} pts (-₹{pointsDiscountValue} off)</span>
                </div>
              )}

              {items.map((it) => {
                const addOnKey = it.selectedAddOns.map(a => a.id).sort().join('-');
                const addOnTotal = it.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
                const singlePrice = it.product.price + addOnTotal;

                return (
                  <div
                    key={`${it.product.id}-${addOnKey}`}
                    className="p-3.5 rounded-2xl bg-[#21150F]/60 border border-[#3B2417] flex items-center gap-3"
                  >
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[#0A0908]"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="font-display font-bold text-sm text-[#FFF9F2] truncate">
                          {it.product.name}
                        </h5>
                        <span className="font-mono text-xs font-bold text-[#C9945C]">
                          ₹{singlePrice * it.quantity}
                        </span>
                      </div>

                      {it.selectedAddOns.length > 0 && (
                        <p className="text-[10px] text-[#F4E7D7]/60 font-body truncate">
                          + {it.selectedAddOns.map(a => a.name).join(', ')}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        {/* Quantity buttons */}
                        <div className="flex items-center gap-2 bg-[#0A0908] border border-[#3B2417] rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(it.product.id, it.quantity - 1, addOnKey)}
                            className="text-[#F4E7D7]/70 hover:text-[#B97845]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-[#FFF9F2]">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(it.product.id, it.quantity + 1, addOnKey)}
                            className="text-[#F4E7D7]/70 hover:text-[#B97845]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(it.product.id, addOnKey)}
                          className="text-rose-400/60 hover:text-rose-400 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {items.length > 0 && (
          <div className="p-6 bg-[#0A0908] border-t border-[#3B2417] space-y-4">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#F4E7D7]/70">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {activeOffer && discount > pointsDiscountValue && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Offer Discount ({activeOffer?.discountPercent}%)
                  </span>
                  <span>-₹{discount - pointsDiscountValue}</span>
                </div>
              )}

              {pointsDiscountValue > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Loyalty Points Redeemed ({pointsDiscountValue} pts)
                  </span>
                  <span>-₹{pointsDiscountValue}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#3B2417]/60 flex justify-between text-base font-bold text-[#FFF9F2]">
                <span className="font-display">Total Amount</span>
                <span className="font-mono text-[#C9945C]">₹{total}</span>
              </div>
            </div>

            {isCheckoutStep ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(false)}
                  className="w-1/3 py-3 rounded-full bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] text-xs font-mono font-semibold"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isCheckingOut}
                  className="w-2/3 py-3.5 rounded-full bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs tracking-wider uppercase hover:scale-105 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isCheckingOut ? 'CREATING BILL...' : 'CONFIRM ORDER ☕'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCheckoutStep(true)}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-xl shadow-[#B97845]/20 flex items-center justify-center gap-2"
              >
                <span>PROCEED TO CHECKOUT • ₹{total}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
