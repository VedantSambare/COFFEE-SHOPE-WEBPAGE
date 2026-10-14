import React, { useState } from 'react';
import { X, Plus, Minus, Check, Coffee, Sparkles } from 'lucide-react';
import { Product, AddOnOption } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCustomizerModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  product,
  onClose,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const toggleAddOn = (addon: AddOnOption) => {
    setSelectedAddOns(prev => {
      const exists = prev.some(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const singleItemPrice = product.price + addOnsTotal;
  const totalPrice = singleItemPrice * quantity;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedAddOns);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden shadow-2xl shadow-black flex flex-col max-h-[90vh]">
        
        {/* Header Image Stage */}
        <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#0A0908]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#160E0A] via-[#160E0A]/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0A0908]/80 text-[#FFF9F2] hover:bg-[#B97845] hover:text-[#0A0908] flex items-center justify-center transition-all border border-[#3B2417]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B97845] font-bold block mb-1">
              {product.category}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FFF9F2]">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          <p className="text-xs sm:text-sm text-[#F4E7D7]/80 font-body leading-relaxed">
            {product.description}
          </p>

          {/* Ingredient Highlights if any */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="bg-[#21150F]/70 border border-[#3B2417]/60 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9945C] font-bold block">
                CRAFT RECIPE & INGREDIENTS
              </span>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#0A0908] text-[#F4E7D7]/80 border border-[#3B2417] flex items-center gap-1"
                  >
                    <Coffee className="w-3 h-3 text-[#B97845]" />
                    {ing.name} ({ing.amount}{ing.unit})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Selector */}
          {product.addOns && product.addOns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#B97845] font-bold">
                  CUSTOMIZE & ADD-ONS
                </span>
                <span className="text-[11px] text-[#F4E7D7]/60">Optional</span>
              </div>

              <div className="space-y-2">
                {product.addOns.map((addon) => {
                  const isSelected = selectedAddOns.some(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#B97845]/15 border-[#B97845] text-[#FFF9F2]'
                          : 'bg-[#21150F]/50 border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#B97845] border-[#B97845] text-[#0A0908]'
                              : 'border-[#3B2417] bg-[#0A0908]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                        </div>
                        <span className="text-xs font-semibold text-[#FFF9F2]">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#C9945C]">
                        +₹{addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F4E7D7] font-semibold">
              QUANTITY
            </span>
            <div className="flex items-center gap-3 bg-[#21150F] border border-[#3B2417] rounded-full p-1">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#F4E7D7] hover:bg-[#B97845] hover:text-[#0A0908] flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-mono font-bold text-sm text-[#FFF9F2]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#F4E7D7] hover:bg-[#B97845] hover:text-[#0A0908] flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#0A0908] border-t border-[#3B2417] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#F4E7D7]/60 block">
              TOTAL AMOUNT
            </span>
            <span className="font-display text-2xl font-bold text-[#FFF9F2]">
              ₹{totalPrice}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-8 py-3.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shadow-lg ${
              isAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] hover:scale-105 active:scale-95 shadow-[#B97845]/30'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" /> ADDED TO CART
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> ADD TO CART • ₹{totalPrice}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
