import React from 'react';
import { Flame, Award, Heart, CheckCircle2 } from 'lucide-react';

export const StorySection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#0A0908] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#B97845]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#3B2417]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
              MANIFESTO & ETHOS
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-[#FFF9F2] leading-tight">
              BEYOND THE <br />
              <span className="italic font-serif-luxury text-[#F4E7D7]">DAILY CUP.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#F4E7D7]/70 font-body leading-relaxed">
            Coffee Aroma was born from a singular obsession: elevated coffee culture paired with gourmet culinary comfort. Not just a cafe, but a sensory ritual.
          </p>
        </div>

        {/* 3-Column Editorial Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Column 1: The Roast */}
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-[#B97845] transition-all duration-500 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#21150F] border border-[#3B2417] flex items-center justify-center text-[#C9945C] group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase text-[#B97845] tracking-widest block font-bold">
                PILLAR 01
              </span>
              <h3 className="font-display text-2xl font-bold text-[#FFF9F2]">
                Artisanal Single-Origin Roasts
              </h3>
              <p className="text-xs sm:text-sm text-[#F4E7D7]/70 leading-relaxed font-body">
                We select ethically harvested Arabica beans from high-altitude estates, roasted in micro-batches to unlock dense cacao, stone fruit, and caramel aromatics.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#3B2417]/50 flex items-center gap-2 text-xs font-mono text-[#C9945C]">
              <CheckCircle2 className="w-4 h-4 text-[#B97845]" />
              <span>Extracted at 9 Bar & 92°C</span>
            </div>
          </div>

          {/* Column 2: Centerpiece Image */}
          <div className="relative rounded-3xl overflow-hidden border border-[#3B2417] min-h-[380px] group shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"
              alt="Artisanal Espresso Machine & Steam"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-6 left-6 right-6 space-y-1">
              <span className="font-handwriting text-2xl text-[#C9945C]">
                Handcrafted Daily
              </span>
              <p className="text-sm font-display font-bold text-[#FFF9F2] uppercase tracking-wider">
                Precision in Every Pour
              </p>
            </div>
          </div>

          {/* Column 3: The Pancake & Culinary Craft */}
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-[#B97845] transition-all duration-500 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#21150F] border border-[#3B2417] flex items-center justify-center text-[#C9945C] group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase text-[#B97845] tracking-widest block font-bold">
                PILLAR 02
              </span>
              <h3 className="font-display text-2xl font-bold text-[#FFF9F2]">
                Fluffy Cloud Pancakes
              </h3>
              <p className="text-xs sm:text-sm text-[#F4E7D7]/70 leading-relaxed font-body">
                Whipped buttermilk batter griddled to golden perfection upon order. Drenched in pure Belgian chocolate ganache, authentic maple, and hazelnut Nutella.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#3B2417]/50 flex items-center gap-2 text-xs font-mono text-[#C9945C]">
              <Heart className="w-4 h-4 text-[#B97845]" />
              <span>Served Fresh & Piping Warm</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
