import React from 'react';
import { Coffee, ArrowUp, Phone, MapPin, Heart } from 'lucide-react';
import { ShopStatus } from '../types';

interface FooterProps {
  onNavigate: (view: string) => void;
  shopStatus: ShopStatus | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, shopStatus }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070605] border-t border-[#3B2417]/60 pt-16 pb-12 text-[#FFF9F2] relative overflow-hidden">
      
      {/* Background Soft Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#B97845]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-[#3B2417]/40 text-left">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B97845] to-[#3B2417] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0A0908] rounded-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-[#C9945C]" />
                </div>
              </div>
              <span className="font-display text-2xl font-bold tracking-widest text-[#FFF9F2] uppercase">
                COFFEE AROMA
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F4E7D7]/70 font-body max-w-sm leading-relaxed">
              Crafting unforgettable coffee moments, decadent buttermilk pancakes, and gourmet artisanal elixirs in Pune.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-[#C9945C]">
              <span
                className={`w-2 h-2 rounded-full ${
                  shopStatus?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{shopStatus?.isOpen ? 'Open Now in Pune' : 'Currently Closed'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#B97845]">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-xs font-body text-[#F4E7D7]/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#FFF9F2] transition-colors">
                  Home Experience
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-[#FFF9F2] transition-colors">
                  Complete Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('specials')} className="hover:text-[#FFF9F2] transition-colors">
                  Speciality Reserves
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pancakes')} className="hover:text-[#FFF9F2] transition-colors">
                  Gourmet Pancakes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('offers')} className="hover:text-[#FFF9F2] transition-colors">
                  Live Offers & Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Visit Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#B97845]">
              COFFEE HOUSE
            </h4>
            <div className="space-y-2 text-xs text-[#F4E7D7]/80 font-body">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-[#C9945C] flex-shrink-0 mt-0.5" />
                <span>Pimple Saudagar, Rahatani, Pune, Maharashtra 411027</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#C9945C] flex-shrink-0" />
                <a href="tel:+917709054465" className="hover:text-[#FFF9F2] font-mono">
                  +91 7709054465
                </a>
              </p>
              <p className="text-[11px] font-mono text-[#C9945C] pt-1">
                Mon - Sun : 08:00 AM – 11:30 PM
              </p>
            </div>
          </div>

          {/* Portal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#B97845]">
              PORTAL ACCESS
            </h4>
            <ul className="space-y-2 text-xs font-body text-[#F4E7D7]/80">
              <li>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="text-[#C9945C] hover:text-[#FFF9F2] transition-colors font-mono font-semibold flex items-center gap-1"
                >
                  <span>→ Staff & Admin Login</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="hover:text-[#FFF9F2] transition-colors font-mono"
                >
                  POS Billing Terminal
                </button>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/riGQMPZFcG4AhXQb7?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFF9F2] transition-colors"
                >
                  Write Google Review ↗
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits & Scroll Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#F4E7D7]/60">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} COFFEE AROMA. Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>in Pune, India.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-[#FFF9F2] transition-colors"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#B97845]" />
          </button>
        </div>

      </div>
    </footer>
  );
};
