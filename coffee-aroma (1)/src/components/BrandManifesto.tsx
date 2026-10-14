import React from 'react';
import { Coffee, Sparkles } from 'lucide-react';

export const BrandManifesto: React.FC = () => {
  return (
    <section className="py-28 bg-[#0A0908] relative overflow-hidden text-center border-b border-[#3B2417]/40">
      
      {/* Glow Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B97845]/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        <div className="w-16 h-16 rounded-full bg-[#21150F] border border-[#3B2417] flex items-center justify-center mx-auto text-[#C9945C] shadow-xl">
          <Coffee className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold tracking-[0.35em] uppercase text-[#B97845] block">
          THE COFFEE AROMA PROMISE
        </span>

        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase text-[#FFF9F2] leading-tight tracking-tight">
          WE DON'T JUST SERVE COFFEE. <br />
          <span className="italic font-serif-luxury text-[#F4E7D7]">WE CREATE MOMENTS.</span>
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm sm:text-lg font-mono font-bold tracking-widest text-[#C9945C] uppercase pt-4">
          <span>GOOD COFFEE.</span>
          <span className="text-[#3B2417]">•</span>
          <span>GOOD FOOD.</span>
          <span className="text-[#3B2417]">•</span>
          <span>GOOD MOOD.</span>
        </div>

        <div className="pt-6 font-display text-2xl font-bold tracking-widest uppercase text-[#FFF9F2]/90">
          COFFEE AROMA
        </div>

      </div>
    </section>
  );
};
