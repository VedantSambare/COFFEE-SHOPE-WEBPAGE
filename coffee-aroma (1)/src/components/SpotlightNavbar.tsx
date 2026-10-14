import React, { useState, useEffect } from 'react';
import { ShoppingBag, Coffee, Menu, X, Shield, Lock, Receipt, Award, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShopStatus } from '../types';

interface SpotlightNavbarProps {
  onNavigate?: (view: string) => void;
  setCurrentView?: (view: string) => void;
  activeView?: string;
  currentView?: string;
  shopStatus?: ShopStatus | null;
}

export const SpotlightNavbar: React.FC<SpotlightNavbarProps> = ({
  onNavigate,
  setCurrentView,
  activeView,
  currentView,
  shopStatus,
}) => {
  const {
    totalItemCount,
    setIsCartOpen,
    currentBill,
    setIsBillModalOpen,
    loyaltyAccount,
    setIsLoyaltyModalOpen,
  } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const navigate = onNavigate || setCurrentView || (() => {});
  const active = activeView || currentView || 'home';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const navLinks = [
    { name: 'HOME', view: 'home' },
    { name: 'MENU', view: 'menu' },
    { name: 'SPECIALS', view: 'specials' },
    { name: 'PANCAKES', view: 'pancakes' },
    { name: 'DRINKS', view: 'drinks' },
    { name: 'OFFERS', view: 'offers' },
    { name: 'ABOUT', view: 'about' },
    { name: 'LOCATION', view: 'location' },
  ];

  const handleNavClick = (view: string) => {
    navigate(view);
    setIsMobileMenuOpen(false);

    if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (['specials', 'pancakes', 'drinks', 'offers', 'about', 'location'].includes(view)) {
      if (active !== 'home') {
        navigate('home');
        setTimeout(() => {
          const el = document.getElementById(view);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(view);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      id="spotlight-navbar"
      onMouseMove={handleMouseMove}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0A0908]/90 backdrop-blur-xl border-b border-[#3B2417]/40 py-3 shadow-2xl shadow-black/60'
          : 'bg-gradient-to-b from-[#0A0908]/90 via-[#0A0908]/40 to-transparent py-5'
      }`}
      style={{
        backgroundImage: isScrolled
          ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(185, 120, 69, 0.08), transparent 80%)`
          : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          id="nav-brand-logo"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B97845] to-[#3B2417] p-0.5 shadow-lg shadow-[#B97845]/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0A0908] rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-[#C9945C] group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-display text-xl sm:text-2xl font-bold tracking-widest text-[#FFF9F2] uppercase flex items-center gap-1.5">
              COFFEE AROMA
              <span className="w-1.5 h-1.5 rounded-full bg-[#B97845]"></span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9945C] font-semibold block -mt-1">
              Pune • Est. 2024
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#21150F]/60 border border-[#3B2417]/50 rounded-full px-4 py-1.5 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = active === link.view;
            return (
              <button
                key={link.name}
                id={`nav-link-${link.name.toLowerCase()}`}
                onClick={() => handleNavClick(link.view)}
                className={`px-3.5 py-1.5 text-xs font-semibold tracking-wider rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#B97845] text-[#FFF9F2] shadow-md shadow-[#B97845]/30'
                    : 'text-[#F4E7D7]/80 hover:text-[#FFF9F2] hover:bg-[#3B2417]/40'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 'My Loyalty' Points Indicator */}
          <button
            id="nav-my-loyalty-btn"
            onClick={() => setIsLoyaltyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#2B1B14] to-[#1E120D] hover:from-[#3B2417] hover:to-[#2B1B14] border border-[#B97845]/60 text-amber-300 text-xs font-mono font-bold transition-all shadow-md group hover:border-amber-400 cursor-pointer"
            title="View your Coffee Aroma Loyalty Points & Tier (100 pts = ₹1)"
          >
            <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Award className="w-3 h-3 text-amber-300" />
            </div>
            <span className="text-[11px] font-bold tracking-wide text-[#FFF9F2] hidden md:inline">
              My Loyalty:
            </span>
            <span className="text-amber-400 font-extrabold text-xs">
              {loyaltyAccount?.points || 0} <span className="text-[9px] text-[#C9945C]">PTS</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase font-mono font-bold border border-amber-500/30">
              ₹{((loyaltyAccount?.points || 0) / 100).toFixed(2)}
            </span>
          </button>

          {/* View Last Generated Bill if Customer Placed an Order */}
          {currentBill && (
            <button
              id="nav-view-bill-btn"
              onClick={() => setIsBillModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 hover:bg-emerald-900/80 text-xs font-mono font-bold transition-all shadow-md animate-pulse"
              title="View your generated Tax Invoice / Bill"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">BILL ({currentBill.billNumber})</span>
              <span className="sm:hidden">BILL</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            id="nav-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] hover:border-[#B97845] hover:bg-[#3B2417] transition-all duration-300 group shadow-md"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#C9945C] group-hover:scale-110 transition-transform" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#B97845] text-[#FFF9F2] font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-[#0A0908] animate-bounce">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Liquid Metal Admin / POS Access Button */}
          {isAuthenticated ? (
            <button
              id="nav-admin-dashboard-btn"
              onClick={() => navigate('admin-dashboard')}
              className="liquid-metal px-4 py-2 rounded-full text-xs font-extrabold tracking-wider text-[#0A0908] uppercase shadow-lg shadow-[#B97845]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-[#0A0908]" />
              <span className="hidden sm:inline">
                {user?.role === 'ADMIN' ? 'ADMIN PANEL' : 'POS TERMINAL'}
              </span>
              <span className="sm:hidden">PORTAL</span>
            </button>
          ) : (
            <button
              id="nav-admin-login-btn"
              onClick={() => navigate('admin-login')}
              className="liquid-metal px-4 py-2 rounded-full text-xs font-extrabold tracking-wider text-[#0A0908] uppercase shadow-lg shadow-[#B97845]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#0A0908]" />
              <span className="hidden sm:inline">STAFF / ADMIN</span>
              <span className="sm:hidden">LOGIN</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] hover:bg-[#3B2417] transition-all"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-[#0A0908]/98 backdrop-blur-2xl border-t border-[#3B2417] z-40 flex flex-col justify-between p-6 overflow-y-auto animate-fadeIn">
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#3B2417]/60">
              <span className="text-xs uppercase tracking-widest text-[#C9945C] font-semibold">
                EXPERIENCE NAVIGATION
              </span>
              <span className="text-xs font-mono text-[#F4E7D7]/60 uppercase">
                COFFEE AROMA
              </span>
            </div>

            {/* Mobile My Loyalty Quick Banner */}
            <button
              onClick={() => {
                setIsLoyaltyModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#21150F] to-[#2B1B14] border border-[#B97845]/60 flex items-center justify-between shadow-lg text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9945C] block font-semibold">
                    My Loyalty Rewards
                  </span>
                  <span className="font-display text-base font-bold text-[#FFF9F2]">
                    {loyaltyAccount?.points || 0} Points ({loyaltyAccount?.tier || 'BRONZE'})
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                VIEW →
              </span>
            </button>

            {navLinks.map((link, idx) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.view)}
                className={`w-full text-left py-3.5 px-4 rounded-xl font-display text-lg tracking-wider transition-all flex items-center justify-between ${
                  active === link.view
                    ? 'bg-[#B97845]/20 text-[#FFF9F2] border border-[#B97845]/50'
                    : 'text-[#F4E7D7]/80 hover:bg-[#21150F] hover:text-[#FFF9F2]'
                }`}
              >
                <span>{link.name}</span>
                <span className="text-xs font-mono text-[#B97845]">0{idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-[#3B2417]/60 space-y-3">
            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-[#C9945C]" />
              <span>VIEW CART ({totalItemCount} ITEMS)</span>
            </button>

            {isAuthenticated ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigate('admin-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#B97845] text-[#FFF9F2] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-4 h-4" />
                  {user?.role === 'ADMIN' ? 'ADMIN DASHBOARD' : 'POS BILLING'}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-3 px-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 font-semibold text-xs"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate('admin-login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full liquid-metal py-3.5 px-4 rounded-xl text-[#0A0908] font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                ADMIN / STAFF ACCESS
              </button>
            )}

            <div className="pt-2 text-center text-xs text-[#C9945C]/60 font-mono">
              Pimple Saudagar, Rahatani, Pune • +91 7709054465
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

