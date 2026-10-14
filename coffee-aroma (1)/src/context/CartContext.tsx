import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, AddOnOption, CartItem, Bill, Offer, LoyaltyAccount, LoyaltyTransaction } from '../types';
import { api } from '../lib/api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedAddOns?: AddOnOption[]) => void;
  removeItem: (productId: string, addOnKey?: string) => void;
  updateQuantity: (productId: string, quantity: number, addOnKey?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  discount: number;
  total: number;
  totalItemCount: number;
  activeOffer: Offer | null;
  currentBill: Bill | null;
  setCurrentBill: (bill: Bill | null) => void;
  isBillModalOpen: boolean;
  setIsBillModalOpen: (open: boolean) => void;
  checkout: (customerDetails: { customerName: string; customerPhone?: string; tableNo?: string }) => Promise<Bill>;
  isCheckingOut: boolean;
  // Loyalty System
  loyaltyAccount: LoyaltyAccount;
  pointsToRedeem: number;
  setPointsToRedeem: (pts: number) => void;
  pointsDiscountValue: number;
  redeemPointsDiscount: (pts: number) => void;
  isLoyaltyModalOpen: boolean;
  setIsLoyaltyModalOpen: (open: boolean) => void;
  addLoyaltyPoints: (points: number, billNumber?: string, description?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getAddOnKey(addOns: AddOnOption[] = []): string {
  return addOns.map(a => a.id).sort().join('-');
}

const DEFAULT_LOYALTY: LoyaltyAccount = {
  points: 120, // Initial welcome points for preview
  totalPointsEarned: 120,
  totalPointsRedeemed: 0,
  tier: 'BRONZE',
  history: [
    {
      id: 'tx-welcome',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
      type: 'EARNED',
      points: 120,
      description: 'Welcome Bonus Reward ☕',
    },
  ],
};

function calculateTier(lifetimeEarned: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
  if (lifetimeEarned >= 3000) return 'PLATINUM';
  if (lifetimeEarned >= 1500) return 'GOLD';
  if (lifetimeEarned >= 500) return 'SILVER';
  return 'BRONZE';
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('coffee_aroma_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Loyalty System State
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount>(() => {
    try {
      const saved = localStorage.getItem('coffee_aroma_loyalty');
      return saved ? JSON.parse(saved) : DEFAULT_LOYALTY;
    } catch {
      return DEFAULT_LOYALTY;
    }
  });
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);

  // Save Loyalty to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coffee_aroma_loyalty', JSON.stringify(loyaltyAccount));
    } catch (e) {
      console.error('Failed to persist loyalty account:', e);
    }
  }, [loyaltyAccount]);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coffee_aroma_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  // Fetch active promotional offer
  useEffect(() => {
    api.getOffers()
      .then(offers => {
        const valid = offers.find(o => o.isActive && new Date(o.endDate).getTime() > Date.now());
        if (valid) setActiveOffer(valid);
      })
      .catch(() => {});
  }, []);

  const addItem = (product: Product, quantity = 1, selectedAddOns: AddOnOption[] = []) => {
    const key = getAddOnKey(selectedAddOns);
    setItems(prev => {
      const existingIndex = prev.findIndex(
        it => it.product.id === product.id && getAddOnKey(it.selectedAddOns) === key
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [...prev, { product, quantity, selectedAddOns }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, addOnKey = '') => {
    setItems(prev => prev.filter(it => !(it.product.id === productId && getAddOnKey(it.selectedAddOns) === addOnKey)));
  };

  const updateQuantity = (productId: string, quantity: number, addOnKey = '') => {
    if (quantity <= 0) {
      removeItem(productId, addOnKey);
      return;
    }

    setItems(prev =>
      prev.map(it => {
        if (it.product.id === productId && getAddOnKey(it.selectedAddOns) === addOnKey) {
          return { ...it, quantity };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setPointsToRedeem(0);
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => {
    const addOnTotal = it.selectedAddOns.reduce((a, b) => a + b.price, 0);
    return acc + (it.product.price + addOnTotal) * it.quantity;
  }, 0);

  // Calculate discount from active offers
  let offerDiscount = 0;
  if (activeOffer && activeOffer.discountPercent > 0) {
    let eligibleSubtotal = 0;
    for (const it of items) {
      if (!activeOffer.applicableCategories || activeOffer.applicableCategories.length === 0) {
        eligibleSubtotal += (it.product.price + it.selectedAddOns.reduce((a, b) => a + b.price, 0)) * it.quantity;
      } else if (activeOffer.applicableCategories.includes(it.product.category)) {
        eligibleSubtotal += (it.product.price + it.selectedAddOns.reduce((a, b) => a + b.price, 0)) * it.quantity;
      }
    }
    offerDiscount = Math.round((eligibleSubtotal * activeOffer.discountPercent) / 100);
  }

  // Calculate points discount (100 points = ₹1, limited by subtotal - offerDiscount and available points)
  const rupeePointsValue = Math.floor(loyaltyAccount.points / 100);
  const maxRedeemableRupees = Math.min(rupeePointsValue, Math.max(0, subtotal - offerDiscount));
  const maxRedeemablePoints = maxRedeemableRupees * 100;
  // Ensure points redeemed are counted in multiples of 100 or capped safely
  const validPointsRedeemed = Math.min(pointsToRedeem, maxRedeemablePoints);
  const pointsDiscountValue = Math.floor(validPointsRedeemed / 100);

  const discount = offerDiscount + pointsDiscountValue;
  const total = Math.max(0, subtotal - discount);
  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  const redeemPointsDiscount = (pts: number) => {
    const safePts = Math.max(0, Math.min(pts, maxRedeemablePoints));
    setPointsToRedeem(safePts);
  };

  const addLoyaltyPoints = (earnedPoints: number, billNumber?: string, description?: string) => {
    if (earnedPoints <= 0) return;
    setLoyaltyAccount(prev => {
      const totalEarned = prev.totalPointsEarned + earnedPoints;
      const newPoints = prev.points + earnedPoints;
      const newTier = calculateTier(totalEarned);
      const newTx: LoyaltyTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
        type: 'EARNED',
        points: earnedPoints,
        billNumber,
        description: description || `Points for Order ${billNumber ? '#' + billNumber : ''}`,
      };

      return {
        ...prev,
        points: newPoints,
        totalPointsEarned: totalEarned,
        tier: newTier,
        history: [newTx, ...prev.history],
      };
    });
  };

  const checkout = async (customerDetails: { customerName: string; customerPhone?: string; tableNo?: string }) => {
    setIsCheckingOut(true);
    try {
      const payload = {
        customerName: customerDetails.customerName || 'Coffee Aroma Guest',
        customerPhone: customerDetails.customerPhone || '',
        tableNo: customerDetails.tableNo || 'Counter Pickup',
        items: items.map(it => {
          const itemAddOnTotal = it.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
          return {
            productId: it.product.id,
            productName: it.product.name,
            price: it.product.price,
            quantity: it.quantity,
            selectedAddOns: it.selectedAddOns.map(a => ({ name: a.name, price: a.price })),
            subtotal: (it.product.price + itemAddOnTotal) * it.quantity,
          };
        }),
      };

      const bill = await api.checkoutCustomerOrder(payload);
      setCurrentBill(bill);

      // Reward Loyalty Points: 1 point for every ₹10 spent on final bill
      const pointsEarned = Math.max(1, Math.round(bill.total / 10));

      setLoyaltyAccount(prev => {
        let currentPts = prev.points;
        let redeemedTotal = prev.totalPointsRedeemed;
        const newHistory = [...prev.history];

        // Deduct redeemed points if used in this checkout
        if (validPointsRedeemed > 0) {
          currentPts = Math.max(0, currentPts - validPointsRedeemed);
          redeemedTotal += validPointsRedeemed;
          newHistory.unshift({
            id: `tx-red-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
            type: 'REDEEMED',
            points: validPointsRedeemed,
            billNumber: bill.billNumber,
            description: `Redeemed discount on Bill #${bill.billNumber}`,
          });
        }

        // Add newly earned loyalty points
        const finalEarned = prev.totalPointsEarned + pointsEarned;
        const finalPoints = currentPts + pointsEarned;
        const finalTier = calculateTier(finalEarned);
        newHistory.unshift({
          id: `tx-earn-${Date.now() + 1}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
          type: 'EARNED',
          points: pointsEarned,
          billNumber: bill.billNumber,
          description: `Earned on Bill #${bill.billNumber} (₹${bill.total})`,
        });

        return {
          points: finalPoints,
          totalPointsEarned: finalEarned,
          totalPointsRedeemed: redeemedTotal,
          tier: finalTier,
          history: newHistory,
        };
      });

      clearCart();
      setIsCartOpen(false);
      setIsBillModalOpen(true);
      return bill;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        discount,
        total,
        totalItemCount,
        activeOffer,
        currentBill,
        setCurrentBill,
        isBillModalOpen,
        setIsBillModalOpen,
        checkout,
        isCheckingOut,
        loyaltyAccount,
        pointsToRedeem,
        setPointsToRedeem,
        pointsDiscountValue,
        redeemPointsDiscount,
        isLoyaltyModalOpen,
        setIsLoyaltyModalOpen,
        addLoyaltyPoints,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
