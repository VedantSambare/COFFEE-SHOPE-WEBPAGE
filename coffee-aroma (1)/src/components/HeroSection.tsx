import React, { useState, useEffect } from 'react';
import { ArrowDown, Sparkles, Coffee, Flame, ChevronRight } from 'lucide-react';
import { ShopStatus } from '../types';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onOrderNow: () => void;
  shopStatus: ShopStatus | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMenu,
  onOrderNow,
  shopStatus,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activeStoryWord, setActiveStoryWord] = useState(0);

  const storySteps = [
    { word: 'COFFEE', desc: 'Single-origin beans roasted to perfection' },
    { word: 'AROMA', desc: 'Intense blooming notes of cocoa and toasted hazelnut' },
    { word: 'CRAFTED WITH LOVE', desc: 'Precision-extracted ristretto & velvety textured microfoam' },
    { word: 'SERVED WITH JOY', desc: 'An unforgettable culinary moment in Pune' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStoryWord((prev) => (prev + 1) % storySteps.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [storySteps.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  return (
    <section
      id="hero-section"
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 bg-[#0A0908]"
    >
      {/* Ambient Lighting & Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-b from-[#B97845]/15 via-[#6F4E37]/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] bg-[#3B2417]/20 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-20 w-[350px] h-[350px] bg-[#21150F]/40 blur-3xl rounded-full" />
        
        {/* Subtle cinematic film grain grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(#FFF9F2 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Editorial Content */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">

          {/* Flip Fade Hero Main Title */}
          <div className="space-y-1">
            <p className="font-handwriting text-2xl sm:text-3xl text-[#C9945C] tracking-wide transform -rotate-1">
              Made with Love, Crafted Fresh
            </p>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#FFF9F2] uppercase leading-[0.95]">
              COFFEE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF9F2] via-[#F4E7D7] to-[#B97845]">
                AROMA
              </span>
            </h1>
          </div>

          {/* Subtext with Live Shop Status Indicator */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-mono tracking-[0.25em] text-[#C9945C] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-[#B97845]" /> GOOD COFFEE
            </span>
            <span className="text-[#3B2417]">•</span>
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#B97845]" /> GOOD FOOD
            </span>
            <span className="text-[#3B2417]">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B97845]" /> GOOD MOOD
            </span>
          </div>

          {/* Shop Open Badge */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
              shopStatus?.isOpen !== false
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
            }`}>
              <span className="relative flex h-2 w-2">
                {shopStatus?.isOpen !== false && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  shopStatus?.isOpen !== false ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></span>
              </span>
              <span>{shopStatus?.isOpen !== false ? 'SHOP OPEN • ACCEPTING ORDERS' : 'SHOP CURRENTLY CLOSED'}</span>
            </div>
          </div>

          <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base text-[#F4E7D7]/75 font-body font-normal leading-relaxed">
            Welcome to Coffee Aroma — where artisanal roasts meet warm fluffy pancake towers and gourmet signature elixirs. Crafted with passion right here in Rahatani, Pune.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              id="hero-order-now-btn"
              onClick={onOrderNow}
              disabled={shopStatus?.isOpen === false}
              className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl ${
                shopStatus?.isOpen !== false
                  ? 'bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] hover:scale-105 hover:shadow-[#B97845]/40 active:scale-95'
                  : 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <span>{shopStatus?.isOpen !== false ? 'SHOP OPEN • ORDER NOW' : 'SHOP CLOSED'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-explore-menu-btn"
              onClick={onExploreMenu}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-sm tracking-widest uppercase text-[#FFF9F2] bg-[#21150F] border border-[#3B2417] hover:border-[#B97845] hover:bg-[#3B2417]/60 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>EXPLORE MENU</span>
            </button>
          </div>

          {/* Live Dynamic Story Indicator */}
          <div className="pt-6 border-t border-[#3B2417]/50 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-[#C9945C]/80 mb-2">
              <span>CRAFT CHRONICLE</span>
              <span className="w-8 h-[1px] bg-[#3B2417]"></span>
              <span>STEP 0{activeStoryWord + 1} OF 04</span>
            </div>
            <div className="h-14 flex flex-col justify-center">
              <div className="font-editorial text-xl sm:text-2xl text-[#FFF9F2] transition-all duration-500">
                {storySteps[activeStoryWord].word}
              </div>
              <p className="text-xs text-[#F4E7D7]/60 font-body">
                {storySteps[activeStoryWord].desc}
              </p>
            </div>
          </div>

        </div>

        {/* Right Cinematic Coffee & Pancake Visual Stage */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div
            className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden border border-[#3B2417]/80 bg-[#160E0A] shadow-2xl shadow-black/80 group transition-transform duration-300"
            style={{
              transform: `perspective(1000px) rotateY(${mouseOffset.x * 0.5}deg) rotateX(${-mouseOffset.y * 0.5}deg)`,
            }}
          >
            {/* Background Master Coffee Visual */}
            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80"
              alt="Coffee Aroma Signature Roast"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 filter brightness-95"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#21150F]/40 to-transparent" />

            {/* Steam Animation Elements */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none flex gap-2">
              <div className="w-1.5 h-16 bg-white/30 rounded-full blur-[3px] animate-steam" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-20 bg-white/20 rounded-full blur-[4px] animate-steam" style={{ animationDelay: '0.8s' }} />
              <div className="w-1 h-14 bg-white/30 rounded-full blur-[2px] animate-steam" style={{ animationDelay: '1.6s' }} />
            </div>

            {/* Floating Editorial Badge */}
            <div className="absolute top-5 right-5 bg-[#0A0908]/85 backdrop-blur-md border border-[#3B2417] px-3.5 py-2 rounded-2xl shadow-lg">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9945C] block font-bold">
                ROAST PROFILE
              </span>
              <span className="text-xs font-semibold text-[#FFF9F2]">
                Medium-Dark Arabica
              </span>
            </div>

            {/* Bottom Card Info */}
            <div className="absolute bottom-5 left-5 right-5 bg-[#0A0908]/90 backdrop-blur-md border border-[#3B2417]/80 p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold tracking-wider block">
                  CHEF'S RECOMMENDATION
                </span>
                <span className="text-sm font-bold text-[#FFF9F2] block font-display">
                  Tiramisu Latte & Nutella Stack
                </span>
                <span className="text-xs text-[#F4E7D7]/70 font-mono">
                  From ₹99 • Freshly Prepared
                </span>
              </div>
              <button
                onClick={onOrderNow}
                className="w-10 h-10 rounded-full bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] flex items-center justify-center transition-colors shadow-md"
                aria-label="Order Recommendation"
              >
                <ChevronRight className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll Down Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#F4E7D7]">SCROLL TO DISCOVER</span>
        <ArrowDown className="w-3.5 h-3.5 text-[#B97845] animate-bounce" />
      </div>
    </section>
  );
};
