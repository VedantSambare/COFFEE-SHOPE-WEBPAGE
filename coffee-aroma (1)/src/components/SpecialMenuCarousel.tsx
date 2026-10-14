import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface SpecialMenuCarouselProps {
  products: Product[];
  onOpenCustomizer: (product: Product) => void;
}

export const SpecialMenuCarousel: React.FC<SpecialMenuCarouselProps> = ({
  products,
  onOpenCustomizer,
}) => {
  const { addItem } = useCart();
  const specialProducts = products.filter(p => p.isSpecial || p.isFeatured || p.isBestSeller).slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);

  if (specialProducts.length === 0) return null;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % specialProducts.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + specialProducts.length) % specialProducts.length);
  };

  return (
    <section id="specials" className="py-24 bg-[#0F0A07] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Background Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#B97845]/15 via-[#C9945C]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
              <Sparkles className="w-3.5 h-3.5 text-[#C9945C]" />
              <span>PERSPECTIVE CURATION</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-[#FFF9F2] leading-tight">
              SPECIAL <br />
              <span className="italic font-serif-luxury text-[#F4E7D7]">RESERVE SELECTION</span>
            </h2>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] hover:bg-[#B97845] hover:text-[#0A0908] flex items-center justify-center transition-all shadow-md active:scale-95"
              aria-label="Previous special item"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] hover:bg-[#B97845] hover:text-[#0A0908] flex items-center justify-center transition-all shadow-md active:scale-95"
              aria-label="Next special item"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Perspective Card Showcase */}
        <div className="relative min-h-[460px] flex items-center justify-center py-6">
          {specialProducts.map((prod, idx) => {
            const distance = (idx - activeIndex + specialProducts.length) % specialProducts.length;
            const normalizedDist = distance > specialProducts.length / 2 ? distance - specialProducts.length : distance;

            // Only show cards within window of [-2, -1, 0, 1, 2]
            if (Math.abs(normalizedDist) > 2) return null;

            const isCenter = normalizedDist === 0;
            const translateX = normalizedDist * 320;
            const translateZ = -Math.abs(normalizedDist) * 160;
            const rotateY = normalizedDist * -15;
            const opacity = isCenter ? 1 : Math.abs(normalizedDist) === 1 ? 0.75 : 0.4;
            const zIndex = 30 - Math.abs(normalizedDist) * 10;

            return (
              <div
                key={prod.id}
                onClick={() => {
                  if (isCenter) {
                    onOpenCustomizer(prod);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                className={`absolute w-full max-w-[340px] sm:max-w-[380px] rounded-3xl overflow-hidden bg-[#160E0A] border border-[#3B2417] shadow-2xl transition-all duration-500 cursor-pointer ${
                  isCenter ? 'border-[#B97845] ring-2 ring-[#B97845]/30' : ''
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0908]">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#160E0A] via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#B97845] text-[#FFF9F2] shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {prod.isBestSeller ? 'BESTSELLER' : 'CHEF RESERVE'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-4 font-mono font-bold text-xl text-[#FFF9F2] bg-[#0A0908]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-[#3B2417]">
                    ₹{prod.price}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 text-left space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B97845] font-bold block mb-1">
                      {prod.category}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-[#FFF9F2]">
                      {prod.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#F4E7D7]/70 font-body line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="pt-3 border-t border-[#3B2417]/50 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#F4E7D7]/50">
                      {prod.addOns?.length || 0} Custom Add-ons
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCustomizer(prod);
                      }}
                      className="px-4 py-2 rounded-full text-xs font-bold font-mono uppercase bg-[#B97845] text-[#0A0908] hover:bg-[#C9945C] transition-colors flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ORDER NOW</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {specialProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx ? 'w-8 bg-[#B97845]' : 'w-2 bg-[#3B2417] hover:bg-[#B97845]/50'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
