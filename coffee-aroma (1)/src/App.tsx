import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './lib/api';
import { Product, Offer, ShopStatus, Bill, Category } from './types';

// Components
import { SpotlightNavbar } from './components/SpotlightNavbar';
import { HeroSection } from './components/HeroSection';
import { CinematicMarquee } from './components/CinematicMarquee';
import { StorySection } from './components/StorySection';
import { SpecialMenuCarousel } from './components/SpecialMenuCarousel';
import { PancakeSection } from './components/PancakeSection';
import { SpecialityDrinksSection } from './components/SpecialityDrinksSection';
import { FullMenuSection } from './components/FullMenuSection';
import { FoodMacroSection } from './components/FoodMacroSection';
import { OffersSection } from './components/OffersSection';
import { BrandManifesto } from './components/BrandManifesto';
import { GoogleReviews } from './components/GoogleReviews';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';

// Modals & Drawers
import { ProductCustomizerModal } from './components/ProductCustomizerModal';
import { NotifyModal } from './components/NotifyModal';
import { CartDrawer } from './components/CartDrawer';
import { BillModal } from './components/BillModal';
import { LoyaltyModal } from './components/LoyaltyModal';

// Admin Views
import { AdminLoginView } from './views/AdminLoginView';
import { AdminDashboardView } from './views/AdminDashboardView';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { setIsCartOpen, currentBill, setCurrentBill, isBillModalOpen, setIsBillModalOpen } = useCart();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');

  // Application Data
  const [shopStatus, setShopStatus] = useState<ShopStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [notifyingProduct, setNotifyingProduct] = useState<Product | null>(null);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);

  const fetchAppData = async () => {
    try {
      const [statusRes, catRes, prodRes, offersRes] = await Promise.all([
        api.getShopStatus(),
        api.getCategories(),
        api.getProducts(),
        api.getOffers(),
      ]);
      setShopStatus(statusRes);
      setCategories(catRes.map((c: Category) => c.name));
      setProducts(prodRes || []);
      setOffers(offersRes || []);
    } catch (err) {
      console.error('Failed to load initial data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
    // Poll shop status every 30 seconds
    const interval = setInterval(async () => {
      try {
        const s = await api.getShopStatus();
        setShopStatus(s);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // When checkout completes in CartContext, show the receipt modal
  useEffect(() => {
    if (currentBill) {
      setCompletedBill(currentBill);
    }
  }, [currentBill]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (['menu', 'specials', 'pancakes', 'drinks', 'offers', 'about', 'location'].includes(view)) {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(view);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Admin routing
  if (currentView === 'admin-dashboard') {
    if (!isAuthenticated) {
      return (
        <AdminLoginView
          onBackToHome={() => setCurrentView('home')}
          onLoginSuccess={() => setCurrentView('admin-dashboard')}
        />
      );
    }
    return (
      <AdminDashboardView
        onBackToHome={() => {
          fetchAppData();
          setCurrentView('home');
        }}
      />
    );
  }

  if (currentView === 'admin-login') {
    return (
      <AdminLoginView
        onBackToHome={() => setCurrentView('home')}
        onLoginSuccess={() => setCurrentView('admin-dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#FFF9F2] flex flex-col relative selection:bg-[#B97845] selection:text-[#0A0908]">
      
      {/* Top Navbar */}
      <SpotlightNavbar
        onNavigate={handleNavigate}
        activeView={currentView}
        shopStatus={shopStatus}
      />

      {/* Main Home / Storefront View */}
      <main className="flex-1">
        
        {/* Cinematic Flip Fade Hero */}
        <HeroSection
          onExploreMenu={() => handleNavigate('menu')}
          onOrderNow={() => setIsCartOpen(true)}
          shopStatus={shopStatus}
        />

        {/* Infinite Luxury Marquee */}
        <CinematicMarquee />

        {/* Brand Manifesto & Pillars */}
        <StorySection />

        {/* Special 3D Perspective Carousel */}
        <SpecialMenuCarousel
          products={products}
          onOpenCustomizer={(prod) => setCustomizingProduct(prod)}
        />

        {/* Warm Cream Delicious Pancakes Section */}
        <PancakeSection
          products={products}
          onOpenCustomizer={(prod) => setCustomizingProduct(prod)}
          onOpenNotify={(prod) => setNotifyingProduct(prod)}
        />

        {/* Speciality Signature Drinks Section */}
        <SpecialityDrinksSection
          products={products}
          onOpenCustomizer={(prod) => setCustomizingProduct(prod)}
          onOpenNotify={(prod) => setNotifyingProduct(prod)}
        />

        {/* Complete Menu with Filters & Search */}
        <FullMenuSection
          products={products}
          categories={categories}
          onOpenCustomizer={(prod) => setCustomizingProduct(prod)}
          onOpenNotify={(prod) => setNotifyingProduct(prod)}
        />

        {/* Macro Cinematography Section */}
        <FoodMacroSection />

        {/* Live Offers with Countdown Clock */}
        <OffersSection
          offers={offers}
          onExploreMenu={() => handleNavigate('menu')}
        />

        {/* Brand Manifesto Statement */}
        <BrandManifesto />

        {/* Google Reviews */}
        <GoogleReviews />

        {/* Location & Contact */}
        <LocationSection />

      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} shopStatus={shopStatus} />

      {/* Modals & Drawers */}
      <ProductCustomizerModal
        product={customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />

      <NotifyModal
        product={notifyingProduct}
        onClose={() => setNotifyingProduct(null)}
      />

      <CartDrawer shopStatus={shopStatus} />

      <LoyaltyModal />

      <BillModal
        bill={currentBill || completedBill}
        isOpen={isBillModalOpen || Boolean(completedBill)}
        onClose={() => {
          setIsBillModalOpen(false);
          setCurrentBill(null);
          setCompletedBill(null);
        }}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
