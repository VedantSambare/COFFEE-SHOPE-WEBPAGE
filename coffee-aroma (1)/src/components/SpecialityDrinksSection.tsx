import React from 'react';
import { Sparkles, Plus, Wine } from 'lucide-react';
import { Product } from '../types';

interface SpecialityDrinksSectionProps {
  products: Product[];
  onOpenCustomizer: (product: Product) => void;
  onOpenNotify: (product: Product) => void;
}

export const SpecialityDrinksSection: React.FC<SpecialityDrinksSectionProps> = ({
  products,
  onOpenCustomizer,
  onOpenNotify,
}) => {
  const specialityDrinks = products.filter(
    (p) =>
      p.isSpecial ||
      p.tags?.some((t) => t.toLowerCase().includes('special') || t.toLowerCase().includes('signature')) ||
      p.category.toLowerCase().includes('speciality') ||
      p.category.toLowerCase().includes('frappe') ||
      p.category.toLowerCase().includes('shake') ||
      p.category.toLowerCase().includes('refresher')
  ).slice(0, 8);

  return (
    <section id="drinks" className="py-24 bg-[#0A0908] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#B97845]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
            <Sparkles className="w-3.5 h-3.5 text-[#C9945C]" />
            <span>SIGNATURE MIXOLOGY</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase text-[#FFF9F2] tracking-tight">
            OUR SPECIALITY <br />
            <span className="italic font-serif-luxury text-[#F4E7D7]">DRINKS</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-mono text-[#C9945C] uppercase tracking-widest pt-2">
            <span>CRAFTED FRESH</span>
            <span>•</span>
            <span>PREMIUM INGREDIENTS</span>
            <span>•</span>
            <span>MADE WITH LOVE</span>
          </div>
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialityDrinks.map((drink) => (
            <div
              key={drink.id}
              onClick={() => onOpenCustomizer(drink)}
              className="bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden group hover:border-[#B97845] transition-all duration-500 shadow-xl flex flex-col justify-between cursor-pointer"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0A0908]">
                <img
                  src={drink.image}
                  alt={drink.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#160E0A] via-transparent to-transparent" />
                
                <div className="absolute top-3.5 right-3.5 bg-[#0A0908]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-[#3B2417] font-mono font-bold text-sm text-[#C9945C]">
                  ₹{drink.price}
                </div>

                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B97845] block font-bold mb-0.5">
                    BARISTA SPECIAL
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#FFF9F2] leading-snug">
                    {drink.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 text-left space-y-4">
                <p className="text-xs text-[#F4E7D7]/70 font-body line-clamp-2 leading-relaxed">
                  {drink.description}
                </p>

                <div className="pt-3 border-t border-[#3B2417]/50 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#C9945C]">
                    Layered Cold Foam
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCustomizer(drink);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#B97845] text-[#0A0908] font-mono font-bold text-xs hover:bg-[#C9945C] transition-colors flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
