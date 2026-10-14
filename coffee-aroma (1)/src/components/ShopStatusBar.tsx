import React from 'react';
import { Clock, MapPin, Phone, AlertCircle, Sparkles } from 'lucide-react';
import { ShopStatus } from '../types';

interface ShopStatusBarProps {
  shopStatus: ShopStatus | null;
}

export const ShopStatusBar: React.FC<ShopStatusBarProps> = ({ shopStatus }) => {
  const isOpen = shopStatus?.isOpen ?? true;

  return (
    <div
      id="shop-status-bar"
      className={`border-y transition-colors duration-500 py-3 px-4 ${
        isOpen
          ? 'bg-[#21150F]/70 border-[#3B2417] text-[#FFF9F2]'
          : 'bg-rose-950/40 border-rose-900/50 text-rose-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Status Alert */}
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              isOpen ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-rose-500'
            }`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold tracking-wider uppercase text-sm">
              {isOpen ? '🟢 FRESHLY BREWING' : '🔴 CURRENTLY CLOSED'}
            </span>
            <span className="hidden sm:inline text-[#B97845]">•</span>
            <span className="text-[#F4E7D7]/80">
              {isOpen
                ? shopStatus?.statusMessage || 'Freshly brewing in Pimple Saudagar. Walk in or order online!'
                : "We'll be brewing something amazing again soon ☕ Online ordering is paused."}
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-[#F4E7D7]/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#B97845]" />
            <span>{shopStatus?.openingHours || '08:00 AM – 11:30 PM'}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#B97845]" />
            <span>Pimple Saudagar, Pune</span>
          </div>

          <a
            href="tel:+917709054465"
            className="flex items-center gap-1.5 text-[#C9945C] hover:text-[#FFF9F2] transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+91 7709054465</span>
          </a>
        </div>

      </div>
    </div>
  );
};
