import React, { useState, useEffect } from 'react';
import { Timer, Tag, Sparkles, ArrowRight } from 'lucide-react';
import { Offer } from '../types';

interface OffersSectionProps {
  offers: Offer[];
  onExploreMenu: () => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ offers, onExploreMenu }) => {
  const activeOffers = offers.filter(o => o.isActive && new Date(o.endDate).getTime() > Date.now());

  // Countdown timer state for the primary offer
  const primaryOffer = activeOffers[0];
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '02',
    minutes: '14',
    seconds: '37',
  });

  useEffect(() => {
    if (!primaryOffer) return;

    const updateTimer = () => {
      const difference = new Date(primaryOffer.endDate).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        hours: hours < 10 ? `0${hours}` : `${hours}`,
        minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
        seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [primaryOffer]);

  if (activeOffers.length === 0) return null;

  return (
    <section id="offers" className="py-24 bg-[#120C08] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#B97845]/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
            <Tag className="w-3.5 h-3.5 text-[#C9945C]" />
            <span>LIMITED TIME PROMOTIONS</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase text-[#FFF9F2] tracking-tight">
            LIVE OFFERS <br />
            <span className="italic font-serif-luxury text-[#F4E7D7]">& REWARDS</span>
          </h2>
        </div>

        {/* Primary Hero Offer Card */}
        {primaryOffer && (
          <div className="bg-[#1C110B] border border-[#B97845]/50 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/80 relative overflow-hidden mb-12 group">
            
            {/* Background Texture / Art */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none hidden md:block">
              <img
                src={primaryOffer.bannerImage || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"}
                alt="Offer Background"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1C110B]" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B97845] text-[#0A0908] text-xs font-mono font-bold uppercase tracking-wider shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{primaryOffer.badgeText || "TODAY'S SPECIAL"}</span>
                </div>

                <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FFF9F2] uppercase tracking-tight leading-tight">
                  {primaryOffer.title}
                </h3>

                <p className="text-sm sm:text-base text-[#F4E7D7]/80 font-body max-w-lg leading-relaxed">
                  {primaryOffer.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-[#C9945C]">
                  <span>Applies to: {primaryOffer.applicableCategories?.join(', ') || 'All Menu Items'}</span>
                  <span>•</span>
                  <span>Flat {primaryOffer.discountPercent}% OFF at checkout</span>
                </div>
              </div>

              {/* Countdown Clock Display */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
                <div className="bg-[#0A0908]/90 border border-[#3B2417] p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-xl text-center space-y-4 w-full max-w-sm">
                  <div className="flex items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#B97845] font-bold">
                    <Timer className="w-4 h-4 text-[#C9945C] animate-pulse" />
                    <span>OFFER ENDS IN</span>
                  </div>

                  {/* Big Number Digits */}
                  <div className="flex items-center justify-center gap-3 text-center">
                    <div className="bg-[#21150F] border border-[#3B2417] rounded-2xl px-3 sm:px-4 py-3 min-w-[70px]">
                      <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#FFF9F2]">
                        {timeLeft.hours}
                      </span>
                      <span className="block text-[9px] font-mono text-[#F4E7D7]/60 uppercase tracking-widest mt-1">
                        HRS
                      </span>
                    </div>

                    <span className="font-mono text-2xl font-bold text-[#B97845]">:</span>

                    <div className="bg-[#21150F] border border-[#3B2417] rounded-2xl px-3 sm:px-4 py-3 min-w-[70px]">
                      <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#FFF9F2]">
                        {timeLeft.minutes}
                      </span>
                      <span className="block text-[9px] font-mono text-[#F4E7D7]/60 uppercase tracking-widest mt-1">
                        MIN
                      </span>
                    </div>

                    <span className="font-mono text-2xl font-bold text-[#B97845]">:</span>

                    <div className="bg-[#21150F] border border-[#3B2417] rounded-2xl px-3 sm:px-4 py-3 min-w-[70px]">
                      <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#C9945C]">
                        {timeLeft.seconds}
                      </span>
                      <span className="block text-[9px] font-mono text-[#F4E7D7]/60 uppercase tracking-widest mt-1">
                        SEC
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onExploreMenu}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs tracking-wider uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#B97845]/30"
                  >
                    <span>CLAIM DISCOUNT NOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
