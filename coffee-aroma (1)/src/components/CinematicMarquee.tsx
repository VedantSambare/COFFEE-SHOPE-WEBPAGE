import React from 'react';

export const CinematicMarquee: React.FC = () => {
  const items = [
    'ESPRESSO ☕',
    'CAPPUCCINO ☕',
    'LATTE ☕',
    'FRAPPES 🥤',
    'PANCAKES 🥞',
    'HOT CHOCOLATE 🍫',
    'SPECIALITY DRINKS ✨',
    'TIRAMISU LATTE 🍮',
    'GOOD COFFEE • GOOD FOOD • GOOD MOOD',
    'NUTELLA STACK 🥞',
    'DIET COKE ESPRESSO 🥤',
    'RAHATANI PUNE 📍',
  ];

  return (
    <div id="cinematic-marquee" className="py-5 bg-[#160E0A] border-y border-[#3B2417]/60 overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
        {/* Double array for infinite loop effect */}
        {[...items, ...items, ...items].map((item, idx) => (
          <span
            key={idx}
            className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] uppercase text-[#F4E7D7]/80 hover:text-[#C9945C] transition-colors flex items-center gap-6"
          >
            <span>{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B97845]/60" />
          </span>
        ))}
      </div>
    </div>
  );
};
