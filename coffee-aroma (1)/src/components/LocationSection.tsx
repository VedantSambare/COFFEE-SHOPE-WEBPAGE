import React from 'react';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const mapsUrl = 'https://maps.app.goo.gl/riGQMPZFcG4AhXQb7?g_st=aw';

  return (
    <section id="location" className="py-24 bg-[#0A0908] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#B97845]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
            VISIT OUR COFFEE HOUSE
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase text-[#FFF9F2] tracking-tight">
            FIND YOUR <br />
            <span className="italic font-serif-luxury text-[#F4E7D7]">COFFEE MOMENT.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Details Card */}
          <div className="lg:col-span-5 bg-[#160E0A] border border-[#3B2417] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 text-left">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#B97845] block mb-1">
                LOCATION & ADDRESS
              </span>
              <h3 className="font-display text-3xl font-bold text-[#FFF9F2] uppercase mb-3">
                COFFEE AROMA
              </h3>
              <p className="text-sm text-[#F4E7D7]/80 font-body leading-relaxed flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#C9945C] flex-shrink-0 mt-0.5" />
                <span>
                  Shop No. 4, Royal Vista, Near Kokane Chowk, Pimple Saudagar, Rahatani, Pune, Maharashtra 411027
                </span>
              </p>
            </div>

            <div className="pt-6 border-t border-[#3B2417]/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#21150F] border border-[#3B2417] flex items-center justify-center text-[#C9945C]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#F4E7D7]/60 block">
                    DIRECT CALL / ENQUIRIES
                  </span>
                  <a
                    href="tel:+917709054465"
                    className="text-sm font-mono font-bold text-[#FFF9F2] hover:text-[#C9945C] transition-colors"
                  >
                    +91 7709054465
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#21150F] border border-[#3B2417] flex items-center justify-center text-[#C9945C]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#F4E7D7]/60 block">
                    BREWING HOURS
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#FFF9F2]">
                    Monday – Sunday : 08:00 AM – 11:30 PM
                  </span>
                </div>
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs tracking-widest uppercase hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#B97845]/20"
            >
              <Navigation className="w-4 h-4" />
              <span>GET DIRECTIONS ON MAPS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Right Embedded Interactive Map */}
          <div className="lg:col-span-7 h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#3B2417] shadow-2xl relative bg-[#160E0A]">
            <iframe
              title="Coffee Aroma Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.442838384078!2d73.78854427599026!3d18.60144676676182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9186641e755%3A0x6b8408f972b9a7fa!2sPimple%20Saudagar%2C%20Pimpri-Chinchwad%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full border-0 filter invert-[0.9] hue-rotate-180 contrast-125 opacity-90"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            
            <div className="absolute bottom-4 right-4 bg-[#0A0908]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#3B2417] text-left shadow-lg pointer-events-none">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B97845] font-bold block">
                COFFEE AROMA
              </span>
              <span className="text-xs text-[#FFF9F2] font-semibold">
                Pimple Saudagar, Rahatani, Pune
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
