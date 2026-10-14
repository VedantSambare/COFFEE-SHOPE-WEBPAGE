import React, { useState } from 'react';
import { Plus, ShoppingBag, Bell, Sparkles, Coffee } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenCustomizer: (product: Product) => void;
  onOpenNotify: (product: Product) => void;
  variant?: 'standard' | 'compact' | 'editorial';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenCustomizer,
  onOpenNotify,
  variant = 'standard',
}) => {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [rotateValues, setRotateValues] = useState({ x: 0, y: 0 });

  const isCoffee = product.category.toLowerCase().includes('coffee') || product.category.toLowerCase().includes('hot');
  const isPancake = product.category.toLowerCase().includes('pancake');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateValues({
      x: ((y - centerY) / centerY) * -8,
      y: ((x - centerX) / centerX) * 8,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateValues({ x: 0, y: 0 });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.availability) {
      onOpenNotify(product);
      return;
    }
    if (product.addOns && product.addOns.length > 0) {
      onOpenCustomizer(product);
    } else {
      addItem(product, 1, []);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => product.availability ? onOpenCustomizer(product) : onOpenNotify(product)}
      className="group relative cursor-pointer select-none"
      style={{ perspective: 1000 }}
    >
      <div
        className="relative bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden transition-all duration-300 shadow-xl group-hover:border-[#B97845] group-hover:shadow-2xl group-hover:shadow-[#B97845]/15 flex flex-col h-full"
        style={{
          transform: isHovered
            ? `rotateX(${rotateValues.x}deg) rotateY(${rotateValues.y}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Product Image Stage */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0908]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-95 group-hover:brightness-105"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#160E0A] via-transparent to-transparent opacity-80" />

          {/* Steam / Shimmer Effects on Hover */}
          {isHovered && isCoffee && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none flex gap-1.5 opacity-80">
              <div className="w-1 h-12 bg-white/40 rounded-full blur-[2px] animate-steam" />
              <div className="w-1.5 h-16 bg-white/30 rounded-full blur-[3px] animate-steam" style={{ animationDelay: '0.4s' }} />
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
            {product.isBestSeller ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#B97845] text-[#FFF9F2] shadow-md">
                ★ BESTSELLER
              </span>
            ) : product.isSpecial ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#C9945C] text-[#0A0908] shadow-md">
                CHEF SPECIAL
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#0A0908]/80 text-[#F4E7D7]/90 border border-[#3B2417] backdrop-blur-md">
                {product.category}
              </span>
            )}

            {!product.availability && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-950/90 text-rose-300 border border-rose-800 backdrop-blur-md">
                SOLD OUT
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col justify-between flex-1 space-y-4 text-left">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#FFF9F2] group-hover:text-[#F4E7D7] transition-colors leading-snug line-clamp-1">
                {product.name}
              </h3>
              <span className="font-mono text-base sm:text-lg font-bold text-[#C9945C]">
                ₹{product.price}
              </span>
            </div>

            <p className="text-xs text-[#F4E7D7]/65 font-body line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Action Button Row */}
          <div className="pt-2 border-t border-[#3B2417]/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#F4E7D7]/60">
              {product.ingredients && product.ingredients.length > 0 ? (
                <span>{product.ingredients.length} Ingredients</span>
              ) : (
                <span>Freshly Crafted</span>
              )}
            </div>

            {product.availability ? (
              <button
                onClick={handleQuickAdd}
                className="px-4 py-2 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] hover:bg-[#B97845] hover:border-[#B97845] hover:text-[#0A0908] transition-all duration-300 flex items-center gap-1.5 shadow-md group-hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD TO CART</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNotify(product);
                }}
                className="px-4 py-2 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>NOTIFY ME</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
