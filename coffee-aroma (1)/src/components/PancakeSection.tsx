import React from 'react';
import { Plus, Sparkles, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface PancakeSectionProps {
  products: Product[];
  onOpenCustomizer: (product: Product) => void;
  onOpenNotify: (product: Product) => void;
}

export const PancakeSection: React.FC<PancakeSectionProps> = ({
  products,
  onOpenCustomizer,
  onOpenNotify,
}) => {
  const { addItem } = useCart();
  const pancakeProducts = products.filter(p => p.category.toLowerCase().includes('pancake'));

  return (
    <section
      id="pancakes"
      className="py-24 bg-[#F4E7D7] text-[#21150F] relative overflow-hidden transition-colors duration-500 selection:bg-[#6F4E37] selection:text-[#F4E7D7]"
    >
      {/* Decorative Warm Cream & Butter Lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B97845]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3B2417]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-handwriting text-3xl sm:text-4xl text-[#B97845] block transform -rotate-2">
            Delicious & Freshly Griddled
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase text-[#21150F] tracking-tight leading-none">
            DELICIOUS <br />
            <span className="text-[#6F4E37]">PANCAKES</span>
          </h2>
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-[#3B2417] font-bold pt-2">
            MADE WITH LOVE, SERVED WITH JOY.
          </p>
        </div>

        {/* Asymmetrical Pancake Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Big Featured Pancake Card (Left) */}
          {pancakeProducts[0] && (
            <div className="lg:col-span-7 bg-[#FFF9F2] rounded-3xl p-6 sm:p-8 border border-[#3B2417]/15 shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-6 bg-[#E8DAC8]">
                <img
                  src={pancakeProducts[0].image}
                  alt={pancakeProducts[0].name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#21150F] text-[#FFF9F2] px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-md">
                  SIGNATURE BUTTERMILK
                </div>
                <div className="absolute bottom-4 right-4 bg-[#FFF9F2]/90 backdrop-blur-md px-4 py-1.5 rounded-xl font-mono text-xl font-extrabold text-[#21150F] shadow-lg border border-[#3B2417]/20">
                  ₹{pancakeProducts[0].price}
                </div>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#21150F]">
                    {pancakeProducts[0].name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#3B2417]/80 font-body leading-relaxed">
                  {pancakeProducts[0].description}
                </p>

                <div className="pt-4 border-t border-[#3B2417]/15 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-mono text-[#6F4E37] font-semibold">
                    100% Pure Canadian Maple Syrup • Farm Butter
                  </span>
                  <button
                    onClick={() => onOpenCustomizer(pancakeProducts[0])}
                    className="px-6 py-3 rounded-full bg-[#21150F] text-[#FFF9F2] font-bold text-xs tracking-wider uppercase hover:bg-[#6F4E37] transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4 text-[#C9945C]" />
                    <span>ADD TO CART</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Column List of Other Gourmet Pancakes */}
          <div className="lg:col-span-5 space-y-4">
            {pancakeProducts.slice(1, 4).map((pancake) => (
              <div
                key={pancake.id}
                onClick={() => onOpenCustomizer(pancake)}
                className="bg-[#FFF9F2] rounded-2xl p-4 sm:p-5 border border-[#3B2417]/15 shadow-md hover:shadow-xl transition-all cursor-pointer group flex items-center gap-4 text-left"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[#E8DAC8]">
                  <img
                    src={pancake.image}
                    alt={pancake.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#B97845] block">
                    {pancake.isBestSeller ? '★ BESTSELLER' : 'GOURMET RECIPE'}
                  </span>
                  <h4 className="font-display text-lg font-bold text-[#21150F] truncate">
                    {pancake.name}
                  </h4>
                  <p className="text-xs text-[#3B2417]/70 line-clamp-1 font-body">
                    {pancake.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-base font-bold text-[#6F4E37]">
                      ₹{pancake.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCustomizer(pancake);
                      }}
                      className="w-8 h-8 rounded-full bg-[#21150F] text-[#FFF9F2] group-hover:bg-[#6F4E37] flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Add pancake"
                    >
                      <Plus className="w-4 h-4 text-[#C9945C]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
