import React from 'react';
import { Star, MessageSquare, ExternalLink, Award } from 'lucide-react';

export const GoogleReviews: React.FC = () => {
  const reviewUrl = 'https://maps.app.goo.gl/riGQMPZFcG4AhXQb7?g_st=aw';

  return (
    <section className="py-24 bg-[#120C08] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#B97845]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
            <Award className="w-4 h-4 text-[#C9945C]" />
            <span>COMMUNITY FEEDBACK</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase text-[#FFF9F2] tracking-tight">
            LOVE YOUR COFFEE? <br />
            <span className="italic font-serif-luxury text-[#F4E7D7]">TELL THE WORLD.</span>
          </h2>
        </div>

        {/* Rating Summary Card */}
        <div className="bg-[#1C110B] border border-[#3B2417] rounded-3xl p-8 max-w-xl mx-auto shadow-2xl space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-5xl font-extrabold text-[#FFF9F2]">
              4.9
            </span>
            <div className="text-left">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-mono text-[#F4E7D7]/70 uppercase tracking-wider block mt-1">
                Verified Google Reviews
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#F4E7D7]/80 font-body leading-relaxed">
            Your reviews fuel our craft! Share your experience with our speciality brews, fluffy pancakes, and cozy ambiance in Pimple Saudagar.
          </p>

          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-xl shadow-[#B97845]/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WRITE A REVIEW ON GOOGLE</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
