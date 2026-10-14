import React, { useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';

export const FoodMacroSection: React.FC = () => {
  const [activeMacro, setActiveMacro] = useState(0);

  const macros = [
    {
      title: 'Golden Velvet Crema',
      tag: 'PRESSURE EXTRACTION',
      image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=1200&q=80',
      description: 'Micro-bubbles of aromatic carbon dioxide and emulsified coffee oils creating a thick, tiger-striped crema layer on our espresso shots.',
    },
    {
      title: 'Belgian Couverture Ganache',
      tag: 'WARM DRIZZLE',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=1200&q=80',
      description: 'Slow-melted 70% dark Belgian cocoa cascading smoothly across warm buttermilk pancake layers and artisanal hot chocolate.',
    },
    {
      title: 'Dense Silky Microfoam',
      tag: 'STEAM TEXTURE',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1200&q=80',
      description: 'Whole milk textured with high-pressure steam at 65°C, yielding micro-bubbles for flawless latte art and sweet dairy texture.',
    },
    {
      title: 'Piedmont Hazelnut & Nutella',
      tag: 'ARTISANAL CRUNCH',
      image: 'https://images.unsplash.com/photo-1554520735-1d65acff34bb?auto=format&fit=crop&w=1200&q=80',
      description: 'Roasted hazelnut pieces folded into rich cocoa spread, delivering intense textural contrast against cloud-like pancakes.',
    },
  ];

  return (
    <section className="py-24 bg-[#0A0908] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Glow */}
      <div className="absolute -top-20 left-1/3 w-[600px] h-[400px] bg-[#6F4E37]/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 text-left">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
              MACRO CINEMATOGRAPHY
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-[#FFF9F2] leading-tight">
              CRAFTED HEAVY. <br />
              <span className="italic font-serif-luxury text-[#F4E7D7]">BREWED CLEAN.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {macros.map((m, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMacro(idx)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeMacro === idx
                    ? 'bg-[#B97845] text-[#0A0908] font-bold shadow-md shadow-[#B97845]/30'
                    : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
                }`}
              >
                0{idx + 1} {m.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Master Macro Stage */}
        <div className="relative rounded-3xl overflow-hidden border border-[#3B2417] bg-[#160E0A] shadow-2xl min-h-[460px] lg:min-h-[520px] flex items-end p-6 sm:p-12 group">
          
          <img
            src={macros[activeMacro].image}
            alt={macros[activeMacro].title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 filter brightness-90"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-[#0A0908]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0908]/80 via-transparent to-transparent hidden sm:block" />

          <div className="relative z-10 max-w-xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B97845]/30 border border-[#B97845] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9945C]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFF9F2] font-bold">
                {macros[activeMacro].tag}
              </span>
            </div>

            <h3 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF9F2] leading-tight">
              {macros[activeMacro].title}
            </h3>

            <p className="text-xs sm:text-sm text-[#F4E7D7]/85 font-body leading-relaxed">
              {macros[activeMacro].description}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#C9945C]">
              <span>ISO 100 • 1/250s • f/1.8 MACRO</span>
              <span>•</span>
              <span>COFFEE AROMA STUDIO</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
