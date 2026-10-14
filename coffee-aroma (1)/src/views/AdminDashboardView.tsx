import React, { useState, useEffect, useMemo } from 'react';
import {
  Coffee,
  ShoppingBag,
  Layers,
  Package,
  FileText,
  Tag,
  Users,
  Bell,
  BarChart3,
  LogOut,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Printer,
  RefreshCw,
  Search,
  AlertTriangle,
  Percent,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  KeyRound,
  Settings,
  Database,
  TrendingUp,
  Clock,
  Calendar,
  DollarSign,
  ShieldAlert,
  Award,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Utensils,
  Globe,
  UserCheck,
  Crown,
  Filter,
  User as UserIcon,
  CreditCard,
  Banknote,
  Gift,
  FileSpreadsheet,
  CalendarRange,
  CalendarDays,
  Receipt,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Product,
  InventoryItem,
  Bill,
  Offer,
  User,
  NotificationRequest,
  ShopStatus,
  AddOnOption,
  Category,
  AnalyticsData,
  PaymentMethod,
  IngredientRecipe,
} from '../types';
import { BillModal } from '../components/BillModal';

interface AdminDashboardViewProps {
  onBackToHome: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToHome }) => {
  const { user, token, logout, isAdmin } = useAuth();

  // Active Tab - POS & Orders available for employee
  const [activeTab, setActiveTab] = useState<
    'pos' | 'dashboard' | 'products' | 'inventory' | 'bills' | 'offers' | 'staff' | 'waitlist' | 'analytics' | 'audit' | 'settings'
  >('pos');

  // Enforce POS and orders tabs for employee
  useEffect(() => {
    if (!isAdmin && activeTab !== 'pos' && activeTab !== 'bills') {
      setActiveTab('pos');
    }
  }, [isAdmin, activeTab]);

  // Core Data States
  const [shopStatus, setShopStatus] = useState<ShopStatus | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationRequest[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Settings & Reset Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isClearBillsModalOpen, setIsClearBillsModalOpen] = useState(false);
  const [clearBillsConfirmInput, setClearBillsConfirmInput] = useState('');
  const [isClearingBills, setIsClearingBills] = useState(false);

  // Audit State
  const [auditDateFilter, setAuditDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Loading / Feedback States
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // Live Order Action Modal State (Payment Method & Reason on Accept / Reject / Mark Paid)
  const [orderActionModal, setOrderActionModal] = useState<{
    isOpen: boolean;
    bill: Bill | null;
    action: 'ACCEPTED' | 'CANCELLED' | 'PAID' | null;
    paymentMethod: PaymentMethod;
  }>({
    isOpen: false,
    bill: null,
    action: null,
    paymentMethod: 'CASH',
  });

  // Bill Modal State
  const [activeBill, setActiveBill] = useState<Bill | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  // POS State
  const [posCategory, setPosCategory] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [posCart, setPosCart] = useState<
    { product: Product; quantity: number; selectedAddOns: AddOnOption[] }[]
  >([]);
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posTableNo, setPosTableNo] = useState('Table 1');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'CASH' | 'ONLINE' | 'COMPLIMENTARY' | 'PAY_AT_COUNTER'>('CASH');
  const [posDiscountType, setPosDiscountType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [posDiscountValue, setPosDiscountValue] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // POS Custom Historical Date / Previous Bill Calendar State
  const [posUseCustomDate, setPosUseCustomDate] = useState(false);
  const [posCustomDate, setPosCustomDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [posCustomTime, setPosCustomTime] = useState<string>('12:00 PM');

  // Product Edit / New Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Standalone Category Management Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Inventory Edit / New Modal State
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Partial<InventoryItem> | null>(null);

  // Employee Edit / New Modal State
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<User> | null>(null);
  const [employeePassword, setEmployeePassword] = useState('');

  // Offer Edit / New Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);

  // In-App Deletion Confirmation State (replaces window.confirm for iframe reliability)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'inventory' | 'offer' | 'staff' | 'bill';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Admin Product Category Filter & Search (Synced with Home Page categories)
  const [adminProductCategory, setAdminProductCategory] = useState('');
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminMenuSortOrder, setAdminMenuSortOrder] = useState<'price-asc' | 'price-desc' | 'name-asc'>('price-asc');

  // Bill & Order Status & Date Filter State
  const [billStatusFilter, setBillStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED'>('ALL');
  const [billSearchQuery, setBillSearchQuery] = useState<string>('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('ALL');
  const [staffViewMode, setStaffViewMode] = useState<'MY_BILLS' | 'ONLINE_ORDERS' | 'ALL'>('MY_BILLS');
  
  // Bills Calendar & Date Filter State
  const [billDatePreset, setBillDatePreset] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [billSelectedDate, setBillSelectedDate] = useState<string>('');
  const [billStartDate, setBillStartDate] = useState<string>('');
  const [billEndDate, setBillEndDate] = useState<string>('');
  const [billPaymentMethodFilter, setBillPaymentMethodFilter] = useState<'ALL' | 'CASH' | 'ONLINE' | 'COMPLIMENTARY' | 'PAY_AT_COUNTER' | 'DISCOUNT'>('ALL');

  // Dashboard Calendar & Specific Date Filter State
  const [dashboardPaymentFilter, setDashboardPaymentFilter] = useState<'ALL' | 'CASH' | 'ONLINE' | 'COMPLIMENTARY' | 'DISCOUNT'>('ALL');
  const [dashboardTimeframe, setDashboardTimeframe] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'SPECIFIC_DATE' | 'CUSTOM_RANGE'>('TODAY');
  const [dashboardSelectedDate, setDashboardSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dashboardStartDate, setDashboardStartDate] = useState<string>(() => new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [dashboardEndDate, setDashboardEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dashboardReportSearch, setDashboardReportSearch] = useState<string>('');

  // Inventory Custom Categories & Recipe State
  const [inventoryTabMode, setInventoryTabMode] = useState<'stock' | 'recipes'>('stock');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('ALL');
  const [inventorySearchQuery, setInventorySearchQuery] = useState<string>('');
  const [isInventoryCustomCatMode, setIsInventoryCustomCatMode] = useState(false);
  const [customInventoryCatInput, setCustomInventoryCatInput] = useState('');
  const [isAddInventoryCatModalOpen, setIsAddInventoryCatModalOpen] = useState(false);
  const [newInventoryCatName, setNewInventoryCatName] = useState('');

  // Recipe Builder Modal State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipeProduct, setEditingRecipeProduct] = useState<Product | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<IngredientRecipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  // Current IST Clock for POS Terminal
  const [currentIstTime, setCurrentIstTime] = useState<string>('');
  const [currentIstDate, setCurrentIstDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentIstTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentIstDate(
        now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data + Live Background Sync for Bills & Shop Status every 4 seconds
  const loadAllData = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const [
        statusRes,
        catRes,
        prodRes,
        invRes,
        billsRes,
        offersRes,
        empRes,
        notifRes,
        statsRes,
      ] = await Promise.all([
        api.getShopStatus().catch((e) => {
          console.warn('Failed to load shop status:', e);
          return null;
        }),
        api.getCategories().catch((e) => {
          console.warn('Failed to load categories:', e);
          return null;
        }),
        api.getProducts().catch((e) => {
          console.warn('Failed to load products:', e);
          return null;
        }),
        api.getInventory().catch((e) => {
          console.warn('Failed to load inventory:', e);
          return null;
        }),
        api.getBills().catch((e) => {
          console.warn('Failed to load bills:', e);
          return null;
        }),
        api.getOffers().catch((e) => {
          console.warn('Failed to load offers:', e);
          return null;
        }),
        isAdmin
          ? api.getEmployees().catch((e) => {
              console.warn('Failed to load employees:', e);
              return null;
            })
          : Promise.resolve([]),
        api.getNotifications().catch((e) => {
          console.warn('Failed to load notifications:', e);
          return null;
        }),
        api.getAnalytics().catch((e) => {
          console.warn('Failed to load analytics:', e);
          return null;
        }),
      ]);

      if (statusRes) setShopStatus(statusRes);
      if (catRes) setCategories(catRes);
      if (prodRes) setProducts(prodRes);
      if (invRes) setInventory(invRes);
      if (billsRes) setBills(billsRes);
      if (offersRes) setOffers(offersRes);
      if (empRes) setEmployees(empRes);
      if (notifRes) setNotifications(notifRes);
      if (statsRes) setAnalytics(statsRes);
    } catch (err: any) {
      if (!isBackground) {
        console.error('Error loading dashboard data:', err);
        setActionErrorMsg(err.message || 'Failed to load backend data');
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(false);

    // Live auto-polling every 4 seconds to catch new customer orders and bills in real time
    const interval = setInterval(() => {
      loadAllData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [token, isAdmin]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(''), 4000);
    } else {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  // Toggle Shop Open/Close
  const handleToggleShopStatus = async () => {
    if (!isAdmin) {
      showToast('Store status can only be modified by Admin accounts.', true);
      return;
    }
    if (!shopStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateShopStatus({
        isOpen: !shopStatus.isOpen,
        statusMessage: !shopStatus.isOpen
          ? 'Freshly brewing in Pimple Saudagar. Walk in or order online!'
          : 'Store is currently closed. Will reopen shortly.',
      });
      setShopStatus(updated);
      showToast(
        updated.isOpen
          ? '🟢 Store marked as OPEN. Live orders enabled.'
          : '🔴 Store marked as CLOSED. Online ordering paused.'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update shop status', true);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ================= POS HANDLERS =================
  // Only categories that have at least 1 item (remove 0-item categories)
  const categoriesWithProducts = useMemo(() => {
    return categories.filter((cat) =>
      products.some((p) => p.category.toLowerCase() === cat.name.toLowerCase())
    );
  }, [categories, products]);

  const activePosCategory = (posCategory && posCategory !== 'All' && categoriesWithProducts.some(c => c.name.toLowerCase() === posCategory.toLowerCase()))
    ? posCategory
    : (categoriesWithProducts[0]?.name || categories[0]?.name || 'Pancake');

  const filteredPosProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCat = p.category.toLowerCase() === activePosCategory.toLowerCase();
        const matchesSearch =
          posSearch.trim() === '' ||
          p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(posSearch.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => a.price - b.price);
  }, [products, activePosCategory, posSearch]);

  const addToPosCart = (product: Product) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, selectedAddOns: [] }];
    });
  };

  const updatePosCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setPosCart((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const clearPosCart = () => {
    setPosCart([]);
    setPosDiscountValue(0);
    setShowDiscountInput(false);
  };

  const posSubtotal = posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const posDiscount = useMemo(() => {
    if (!posDiscountValue || posDiscountValue <= 0) return 0;
    if (posDiscountType === 'PERCENT') {
      const pct = Math.min(100, Math.max(0, posDiscountValue));
      return Math.min(posSubtotal, Math.round((posSubtotal * pct) / 100));
    }
    return Math.min(posSubtotal, Math.max(0, posDiscountValue));
  }, [posSubtotal, posDiscountType, posDiscountValue]);

  const posTotal = Math.max(0, posSubtotal - posDiscount);

  const handleCreatePosBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) {
      showToast('Please add items to the POS bill first.', true);
      return;
    }

    setIsSubmittingBill(true);
    try {
      const billPayload: any = {
        customerName: posCustomerName.trim() || 'Walk-in Guest',
        customerPhone: posCustomerPhone.trim(),
        tableNo: posTableNo,
        items: posCart.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          quantity: it.quantity,
          price: it.product.price,
          selectedAddOns: it.selectedAddOns,
          subtotal: it.product.price * it.quantity,
        })),
        subtotal: posSubtotal,
        discount: posDiscount,
        total: posTotal,
        paymentMethod: posPaymentMethod,
        createdBy: user?.name || (isAdmin ? 'Rutik Mane' : 'Staff Member'),
        createdById: user?.id || '',
        createdByRole: user?.role || (isAdmin ? 'ADMIN' : 'EMPLOYEE'),
      };

      // If custom historical date is specified (adding previous bill)
      if (posUseCustomDate && posCustomDate) {
        billPayload.date = posCustomDate;
        billPayload.time = posCustomTime || '12:00 PM';
        billPayload.createdAt = `${posCustomDate}T12:00:00Z`;
      }

      const bill = await api.createBill(billPayload);
      setActiveBill(bill);
      setIsBillModalOpen(true);
      clearPosCart();
      setPosCustomerName('');
      setPosCustomerPhone('');
      setPosDiscountValue(0);
      setShowDiscountInput(false);
      showToast(`Bill #${bill.billNumber} created successfully!`);
      // Reload bills & inventory
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create bill', true);
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // ================= COMPUTED DASHBOARD BREAKDOWN & FILTERED BILLS =================
  const dashboardBreakdown = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const scopeBills = bills.filter((b) => {
      const bDateStr = b.date || (b.createdAt ? b.createdAt.slice(0, 10) : '');
      if (dashboardTimeframe === 'TODAY') return bDateStr === todayStr;
      if (dashboardTimeframe === 'YESTERDAY') {
        const yestStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
        return bDateStr === yestStr;
      }
      if (dashboardTimeframe === 'WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
        return bDateStr >= weekAgo && bDateStr <= todayStr;
      }
      if (dashboardTimeframe === 'MONTH') {
        return bDateStr.startsWith(todayStr.slice(0, 7));
      }
      if (dashboardTimeframe === 'SPECIFIC_DATE') {
        return bDateStr === dashboardSelectedDate;
      }
      if (dashboardTimeframe === 'CUSTOM_RANGE') {
        return (
          (!dashboardStartDate || bDateStr >= dashboardStartDate) &&
          (!dashboardEndDate || bDateStr <= dashboardEndDate)
        );
      }
      return true;
    });

    const totalRevenue = scopeBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const totalSubtotal = scopeBills.reduce((sum, b) => sum + (b.subtotal || b.total || 0), 0);

    const cashBills = scopeBills.filter((b) => b.paymentMethod === 'CASH');
    const cashTotal = cashBills.reduce((sum, b) => sum + (b.total || 0), 0);

    const onlineBills = scopeBills.filter((b) => b.paymentMethod === 'ONLINE' || b.paymentMethod === 'PAY_AT_COUNTER');
    const onlineTotal = onlineBills.reduce((sum, b) => sum + (b.total || 0), 0);

    const compBills = scopeBills.filter((b) => b.paymentMethod === 'COMPLIMENTARY');
    const compTotalWaived = compBills.reduce((sum, b) => sum + (b.subtotal || b.total || 0), 0);

    const discountBills = scopeBills.filter((b) => (b.discount || 0) > 0);
    const totalDiscountGiven = discountBills.reduce((sum, b) => sum + (b.discount || 0), 0);
    const discountRevenue = discountBills.reduce((sum, b) => sum + (b.total || 0), 0);

    return {
      scopeBills,
      scopeBillsCount: scopeBills.length,
      totalRevenue,
      totalSubtotal,
      cashBills,
      cashBillsCount: cashBills.length,
      cashTotal,
      onlineBills,
      onlineBillsCount: onlineBills.length,
      onlineTotal,
      compBills,
      compBillsCount: compBills.length,
      compTotalWaived,
      discountBills,
      discountBillsCount: discountBills.length,
      totalDiscountGiven,
      discountRevenue,
    };
  }, [bills, dashboardTimeframe, dashboardSelectedDate, dashboardStartDate, dashboardEndDate]);

  // Calendar Day Navigation Helpers
  const handleStepDashboardDate = (dayOffset: number) => {
    const base = dashboardSelectedDate ? new Date(dashboardSelectedDate) : new Date();
    base.setDate(base.getDate() + dayOffset);
    const dateStr = base.toISOString().split('T')[0];
    setDashboardSelectedDate(dateStr);
    setDashboardTimeframe('SPECIFIC_DATE');
  };

  const handleSelectDashboardToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setDashboardSelectedDate(todayStr);
    setDashboardTimeframe('TODAY');
  };

  // Inventory Categories List
  const allInventoryCategories = useMemo(() => {
    const baseCategories = [
      'Coffee Beans',
      'Dairy & Milk',
      'Syrups & Flavors',
      'Chocolate & Cocoa',
      'Bakery & Flour',
      'Pancake Mix & Batter',
      'Milk Shake Purees',
      'Refreshers & Teas',
      'Packaging & Cups',
      'Add-ons & Garnishes',
    ];
    const fromItems = inventory.map((i) => i.category).filter(Boolean);
    const set = new Set([...baseCategories, ...fromItems]);
    return Array.from(set);
  }, [inventory]);

  // Filtered Inventory Stock Items
  const filteredInventoryItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCat =
        inventoryCategoryFilter === 'ALL' ||
        item.category.toLowerCase() === inventoryCategoryFilter.toLowerCase();
      const matchesSearch =
        !inventorySearchQuery.trim() ||
        item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
        (item.supplier || '').toLowerCase().includes(inventorySearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [inventory, inventoryCategoryFilter, inventorySearchQuery]);

  // Handle Save Recipe Formula
  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Recipe editing is only available to Admin accounts.', true);
      return;
    }
    if (!editingRecipeProduct) return;
    setIsSavingRecipe(true);
    try {
      const updated = await api.updateProduct(editingRecipeProduct.id, {
        ingredients: recipeIngredients,
      });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`Recipe formula for "${updated.name}" saved successfully!`);
      setIsRecipeModalOpen(false);
      setEditingRecipeProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save recipe formula', true);
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const dashboardFilteredBills = useMemo(() => {
    let list = dashboardBreakdown.scopeBills;

    if (dashboardPaymentFilter === 'CASH') {
      list = list.filter((b) => b.paymentMethod === 'CASH');
    } else if (dashboardPaymentFilter === 'ONLINE') {
      list = list.filter((b) => b.paymentMethod === 'ONLINE' || b.paymentMethod === 'PAY_AT_COUNTER');
    } else if (dashboardPaymentFilter === 'COMPLIMENTARY') {
      list = list.filter((b) => b.paymentMethod === 'COMPLIMENTARY');
    } else if (dashboardPaymentFilter === 'DISCOUNT') {
      list = list.filter((b) => (b.discount || 0) > 0);
    }

    if (dashboardReportSearch.trim()) {
      const q = dashboardReportSearch.toLowerCase();
      list = list.filter((b) => {
        const matchBill = b.billNumber.toLowerCase().includes(q);
        const matchStaff = (b.createdBy || '').toLowerCase().includes(q);
        const matchGuest = (b.customerName || '').toLowerCase().includes(q);
        const matchPhone = (b.customerPhone || '').toLowerCase().includes(q);
        const matchTable = (b.tableNo || '').toLowerCase().includes(q);
        const matchItems = b.items?.some((it) => it.productName.toLowerCase().includes(q));
        return matchBill || matchStaff || matchGuest || matchPhone || matchTable || matchItems;
      });
    }

    return list;
  }, [dashboardBreakdown, dashboardPaymentFilter, dashboardReportSearch]);

  // ================= INVENTORY HANDLERS =================
  const handleUpdateStock = async (itemId: string, quantity: number) => {
    if (!isAdmin) {
      showToast('Edit option is only available to Admin accounts.', true);
      return;
    }
    try {
      const updated = await api.updateInventoryItem(itemId, { quantity });
      setInventory((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      showToast(`Stock updated for ${updated.name}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock', true);
    }
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Edit option is only available to Admin accounts.', true);
      return;
    }
    if (!editingInventory) return;
    try {
      if (editingInventory.id) {
        const updated = await api.updateInventoryItem(editingInventory.id, editingInventory);
        setInventory((prev) => prev.map((i) => (i.id === editingInventory.id ? updated : i)));
        showToast(`Stock item "${updated.name}" updated!`);
      } else {
        const created = await api.createInventoryItem(editingInventory);
        setInventory((prev) => [created, ...prev]);
        showToast(`Stock item "${created.name}" added to inventory!`);
      }
      setIsInventoryModalOpen(false);
      setEditingInventory(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save inventory item', true);
    }
  };

  // ================= PRODUCT MANAGEMENT =================
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const elem = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const scaleSize = MAX_WIDTH / img.width;
          if (scaleSize < 1) {
            elem.width = MAX_WIDTH;
            elem.height = img.height * scaleSize;
          } else {
            elem.width = img.width;
            elem.height = img.height;
          }
          const ctx = elem.getContext('2d');
          ctx?.drawImage(img, 0, 0, elem.width, elem.height);
          const dataUrl = elem.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Edit option is only available to Admin accounts.', true);
      return;
    }
    if (!editingProduct) return;

    try {
      const finalCategory = (isCustomCategoryMode && customCategoryInput.trim())
        ? customCategoryInput.trim()
        : (editingProduct.category?.trim() || categories[0]?.name || 'Speciality Coffees');

      const productPayload = {
        ...editingProduct,
        category: finalCategory,
      };

      if (editingProduct.id) {
        const updated = await api.updateProduct(editingProduct.id, productPayload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        showToast(`Product "${updated.name}" updated successfully!`);
      } else {
        const created = await api.createProduct(productPayload);
        setProducts((prev) => [created, ...prev]);
        showToast(`Product "${created.name}" added to menu under "${finalCategory}"!`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setIsCustomCategoryMode(false);
      setCustomCategoryInput('');
      // Synchronize all dashboard tabs, categories, homepage, and analytics
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', true);
    }
  };

  const handleCreateStandaloneCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Category creation is restricted to Admin.', true);
      return;
    }
    if (!newCategoryName.trim()) {
      showToast('Category name is required', true);
      return;
    }
    setIsSavingCategory(true);
    try {
      const created = await api.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
        slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
        icon: 'Coffee',
      });
      showToast(`Category "${created.name}" created and synced to Homepage & POS!`);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setIsCategoryModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', true);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleToggleProductAvailability = async (product: Product) => {
    if (!isAdmin) {
      showToast('Edit option is only available to Admin accounts.', true);
      return;
    }
    try {
      const updated = await api.updateProduct(product.id, { availability: !product.availability });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showToast(
        `${product.name} is now ${updated.availability ? 'IN STOCK' : 'OUT OF STOCK (Sold Out)'}`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle availability', true);
    }
  };

  const handleSyncAll62Products = async () => {
    try {
      showToast('Syncing all 62 menu items with database...');
      const res = await api.syncAll62Products();
      if (res.products) {
        setProducts(res.products);
        showToast(`✅ Successfully synced all ${res.products.length} menu items!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to sync 62 menu items', true);
    }
  };

  // ================= EMPLOYEE MANAGEMENT =================
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Edit option is only available to Admin accounts.', true);
      return;
    }
    if (!editingEmployee) return;
    try {
      if (editingEmployee.id) {
        const payload: any = {
          name: editingEmployee.name,
          role: editingEmployee.role,
          phone: editingEmployee.phone,
        };
        if (employeePassword.trim()) {
          payload.password = employeePassword.trim();
        }
        const updated = await api.updateEmployee(editingEmployee.id, payload);
        setEmployees((prev) => prev.map((emp) => (emp.id === editingEmployee.id ? { ...emp, ...updated } : emp)));
        showToast(`Staff account for ${updated.name} updated!`);
      } else {
        const payload = {
          name: editingEmployee.name,
          username: editingEmployee.username,
          password: employeePassword.trim() || 'staff123',
          role: editingEmployee.role || 'EMPLOYEE',
          phone: editingEmployee.phone || '',
        };
        const created = await api.createEmployee(payload);
        setEmployees((prev) => [...prev, created]);
        showToast(`Staff account created for ${created.name}!`);
      }
      setIsEmployeeModalOpen(false);
      setEditingEmployee(null);
      setEmployeePassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to save staff account', true);
    }
  };

  // ================= OFFER MANAGEMENT =================
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Edit option is only available to Admin accounts.', true);
      return;
    }
    if (!editingOffer) return;
    try {
      if (editingOffer.id) {
        const updated = await api.updateOffer(editingOffer.id, editingOffer);
        setOffers((prev) => prev.map((o) => (o.id === editingOffer.id ? updated : o)));
        showToast(`Offer "${updated.title}" updated!`);
      } else {
        const created = await api.createOffer(editingOffer);
        setOffers((prev) => [created, ...prev]);
        showToast(`Offer "${created.title}" published!`);
      }
      setIsOfferModalOpen(false);
      setEditingOffer(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save offer', true);
    }
  };

  const handleToggleOffer = async (offer: Offer) => {
    if (!isAdmin) {
      showToast('Edit option is only available to Admin accounts.', true);
      return;
    }
    try {
      const updated = await api.updateOffer(offer.id, { isActive: !offer.isActive });
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
      showToast(`Offer ${updated.isActive ? 'ACTIVATED' : 'DEACTIVATED'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle offer', true);
    }
  };

  // ================= UNIFIED SAFE DELETE EXECUTION =================
  const handleExecuteDelete = async () => {
    if (!isAdmin) {
      showToast('Delete option is only available to Admin accounts.', true);
      setDeleteTarget(null);
      return;
    }
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'product') {
        await api.deleteProduct(deleteTarget.id);
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        showToast(`Product "${deleteTarget.name}" removed from menu.`);
      } else if (deleteTarget.type === 'inventory') {
        await api.deleteInventoryItem(deleteTarget.id);
        setInventory((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        showToast(`Ingredient "${deleteTarget.name}" deleted from stock tracker.`);
      } else if (deleteTarget.type === 'offer') {
        await api.deleteOffer(deleteTarget.id);
        setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        showToast(`Offer "${deleteTarget.name}" deleted.`);
      } else if (deleteTarget.type === 'staff') {
        await api.deleteEmployee(deleteTarget.id);
        setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        showToast(`Staff account for ${deleteTarget.name} deleted.`);
      } else if (deleteTarget.type === 'bill') {
        await api.deleteBill(deleteTarget.id);
        setBills((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        showToast(`Bill #${deleteTarget.name} record deleted.`);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete item', true);
    } finally {
      setIsDeleting(false);
    }
  };

  // ================= ADMIN SETTINGS & AUDIT ACTIONS =================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showToast('New password must be at least 4 characters long', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', true);
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await api.resetPassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      showToast(res.message || 'Password reset successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', true);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleClearAllBills = async () => {
    if (!isAdmin) {
      showToast('Clear bills option is only available to Admin accounts.', true);
      setIsClearBillsModalOpen(false);
      return;
    }
    if (clearBillsConfirmInput !== 'CLEAR_ALL_BILLS_PERMANENTLY') {
      showToast('Please type CLEAR_ALL_BILLS_PERMANENTLY to confirm', true);
      return;
    }

    setIsClearingBills(true);
    try {
      await api.clearAllBills('CLEAR_ALL_BILLS_PERMANENTLY');
      setBills([]);
      if (analytics) {
        setAnalytics({
          ...analytics,
          salesToday: 0,
          totalBillsToday: 0,
          weeklySales: analytics.weeklySales.map(d => ({ ...d, sales: 0 })),
          recentHourlySales: analytics.recentHourlySales.map(h => ({ ...h, sales: 0 })),
        });
      }
      showToast('All order history and sales invoices cleared successfully!');
      setIsClearBillsModalOpen(false);
      setClearBillsConfirmInput('');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear bills', true);
    } finally {
      setIsClearingBills(false);
    }
  };

  const handleExportAuditCSV = () => {
    if (bills.length === 0) {
      showToast('No sales or bill records to export', true);
      return;
    }

    let filtered = [...bills];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (auditDateFilter === 'TODAY') {
      filtered = filtered.filter(b => b.date === todayStr);
    } else if (auditDateFilter === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(b => new Date(b.createdAt).getTime() >= weekAgo.getTime());
    } else if (auditDateFilter === 'MONTH') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(b => new Date(b.createdAt).getTime() >= monthAgo.getTime());
    }

    if (filtered.length === 0) {
      showToast('No sales records match the selected date filter', true);
      return;
    }

    const headers = [
      'Bill Number',
      'Date',
      'Time',
      'Customer Name',
      'Customer Phone',
      'Table / Order Type',
      'Payment Method',
      'Subtotal (INR)',
      'Discount (INR)',
      'Total (INR)',
      'Status',
      'Staff Operator',
      'Items Purchased',
    ];

    const rows = filtered.map(b => {
      const itemsFormatted = b.items
        .map(i => `${i.productName} (x${i.quantity} @ Rs.${i.price})`)
        .join('; ');

      return [
        `"${b.billNumber}"`,
        `"${b.date}"`,
        `"${b.time}"`,
        `"${b.customerName || 'Walk-in'}"`,
        `"${b.customerPhone || 'N/A'}"`,
        `"${b.tableNo || 'Counter'}"`,
        `"${b.paymentMethod}"`,
        b.subtotal,
        b.discount || 0,
        b.total,
        `"${b.status}"`,
        `"${b.createdBy}"`,
        `"${itemsFormatted.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coffee_aroma_sales_audit_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filtered.length} sales records to CSV!`);
  };

  const handleExportDashboardReportCSV = (reportData: Bill[], filterTitle: string) => {
    if (reportData.length === 0) {
      showToast(`No transaction records found for ${filterTitle} filter to export`, true);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const headers = [
      'Bill Number',
      'Date',
      'Time (IST)',
      'Customer Name',
      'Customer Phone',
      'Table / Mode',
      'Payment Method',
      'Subtotal (INR)',
      'Discount (INR)',
      'Net Paid (INR)',
      'Status',
      'Staff Operator',
      'Items Ordered',
    ];

    const rows = reportData.map(b => {
      const itemsFormatted = b.items
        .map(i => `${i.productName} (x${i.quantity} @ Rs.${i.price})`)
        .join('; ');

      return [
        `"${b.billNumber}"`,
        `"${b.date}"`,
        `"${b.time}"`,
        `"${b.customerName || 'Walk-in Guest'}"`,
        `"${b.customerPhone || 'N/A'}"`,
        `"${b.tableNo || 'Counter Pickup'}"`,
        `"${b.paymentMethod}"`,
        b.subtotal || 0,
        b.discount || 0,
        b.total || 0,
        `"${b.status}"`,
        `"${b.createdBy || 'Staff'}"`,
        `"${itemsFormatted.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coffee_aroma_${filterTitle.toLowerCase().replace(/\s+/g, '_')}_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✅ Exported ${reportData.length} records for ${filterTitle} to CSV!`);
  };

  // ================= ORDER STATUS UPDATE (ACCEPT / REJECT / COMPLETE) =================
  const handleOrderStatusUpdate = async (
    billId: string,
    newStatus: 'ACCEPTED' | 'CANCELLED' | 'PAID',
    customPaymentMethod?: PaymentMethod
  ) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateBillStatus(billId, newStatus, customPaymentMethod);
      setBills((prev) =>
        prev.map((b) =>
          b.id === billId
            ? { ...b, status: updated.status, paymentMethod: updated.paymentMethod }
            : b
        )
      );
      if (activeBill && activeBill.id === billId) {
        setActiveBill({ ...activeBill, status: updated.status, paymentMethod: updated.paymentMethod });
      }

      if (newStatus === 'ACCEPTED') {
        showToast(
          `Order #${updated.billNumber} ACCEPTED! Set payment: ${updated.paymentMethod}. Sent to Kitchen ☕`
        );
      } else if (newStatus === 'CANCELLED') {
        showToast(`Order #${updated.billNumber} has been REJECTED / CANCELLED.`);
      } else if (newStatus === 'PAID') {
        showToast(
          `Order #${updated.billNumber} marked as PAID (${updated.paymentMethod}) & COMPLETED! ✅`
        );
      }
      setOrderActionModal({ isOpen: false, bill: null, action: null, paymentMethod: 'CASH' });
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', true);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openOrderActionDialog = (bill: Bill, action: 'ACCEPTED' | 'CANCELLED' | 'PAID') => {
    // Default initial payment method to current bill payment method or CASH if PAY_AT_COUNTER
    let initialMethod: PaymentMethod = bill.paymentMethod;
    if (initialMethod === 'PAY_AT_COUNTER') {
      initialMethod = 'CASH';
    }
    setOrderActionModal({
      isOpen: true,
      bill,
      action,
      paymentMethod: initialMethod,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#FFF9F2] flex flex-col selection:bg-[#B97845] selection:text-[#0A0908]">
      
      {/* Top Navigation Bar */}
      <header className="bg-[#160E0A] border-b border-[#3B2417] px-4 sm:px-6 py-3 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand & Role */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="w-9 h-9 rounded-xl bg-[#21150F] hover:bg-[#B97845] text-[#FFF9F2] flex items-center justify-center transition-colors border border-[#3B2417]"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B97845] to-[#3B2417] flex items-center justify-center text-[#FFF9F2] font-bold">
                <Coffee className="w-4 h-4 text-[#C9945C]" />
              </div>
              <div>
                <h1 className="font-display font-bold text-base tracking-wider uppercase">
                  {isAdmin ? 'COFFEE AROMA POS & ADMIN' : 'COFFEE AROMA • STAFF TERMINAL'}
                </h1>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#F4E7D7]/70">
                  <span>LOGGED IN AS: <strong className="text-[#FFF9F2] uppercase">{user?.name || user?.username}</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-[#B97845]/20 text-[#C9945C] border border-[#B97845]/40 font-bold uppercase">
                    {isAdmin ? 'ADMINISTRATOR' : 'STAFF (POS & ORDERS)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Live Store Status */}
          <div className="flex items-center gap-3 bg-[#0A0908] border border-[#3B2417] rounded-full px-4 py-1.5 shadow-inner">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#F4E7D7]/80">
              STORE STATUS:
            </span>
            {isAdmin ? (
              <button
                onClick={handleToggleShopStatus}
                disabled={isUpdatingStatus}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  shopStatus?.isOpen
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
                title="Click to toggle store open / closed status (Admin only)"
              >
                <span className={`w-2 h-2 rounded-full ${shopStatus?.isOpen ? 'bg-black animate-pulse' : 'bg-white'}`} />
                <span>{shopStatus?.isOpen ? 'OPEN (LIVE)' : 'CLOSED'}</span>
              </button>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-md ${
                  shopStatus?.isOpen
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${shopStatus?.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{shopStatus?.isOpen ? 'STORE OPEN' : 'STORE CLOSED'}</span>
              </span>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Live IST Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[11px] font-mono text-[#F4E7D7]">
              <Clock className="w-3.5 h-3.5 text-[#C9945C]" />
              <div>
                <span className="text-[#FFF9F2] font-bold">{currentIstTime || 'IST Live'}</span>
                <span className="text-[#C9945C] text-[9px] ml-1.5 font-bold">IST</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#21150F] border border-emerald-900/50 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-[#C9945C]" />
              <span>Cloud SQL (Live)</span>
            </div>

            <button
              onClick={() => loadAllData(false)}
              className="p-2 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] border border-[#3B2417] transition-colors"
              title="Refresh all data from Google Cloud SQL"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-[#21150F] hover:bg-rose-950 text-rose-300 border border-[#3B2417] hover:border-rose-800 transition-colors text-xs font-mono font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>

        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#120C08] border-b border-[#3B2417] px-4 sm:px-6 overflow-x-auto select-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('pos')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'pos'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>All 62 Menu Items & POS Billing</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Menu & Stock Catalog ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Live Inventory ({inventory.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bills')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap relative ${
                  activeTab === 'bills'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Live Orders & History ({bills.length})</span>
                {bills.filter((b) => b.status === 'PENDING').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-mono font-black animate-bounce">
                    {bills.filter((b) => b.status === 'PENDING').length} NEW
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sales Audit & CSV</span>
              </button>

              <button
                onClick={() => setActiveTab('offers')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'offers'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Promotions & Deals ({offers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'staff'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff Accounts ({employees.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('waitlist')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'waitlist'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Waitlist Alerts ({notifications.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Sales Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                    : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('pos')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'pos'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                      : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>POS Billing ({products.length} Items)</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                      : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Menu & Stock Catalog ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('bills')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap relative ${
                    activeTab === 'bills'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                      : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Online Customer Orders ({bills.length})</span>
                  {bills.filter((b) => b.status === 'PENDING').length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-mono font-black animate-bounce shadow-sm">
                      {bills.filter((b) => b.status === 'PENDING').length} NEW
                    </span>
                  )}
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#F4E7D7]/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Staff Terminal • POS Counter Orders & Online Orders</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Notifications Toast */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-950 border border-rose-500 text-rose-200 px-5 py-3 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 text-left">
        
        {/* ================= TAB 1: POS BILLING TERMINAL ================= */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-start">
            
            {/* Left: Product Selector Grid */}
            <div className="md:col-span-7 lg:col-span-7 space-y-4">
              
              {/* Filter bar with Category-wise Dropdown Menu */}
              <div className="bg-[#160E0A] border border-[#3B2417] p-3.5 sm:p-4 rounded-3xl space-y-3 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  
                  {/* Category Wise Dropdown */}
                  <div className="sm:col-span-6 relative">
                    <label className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block mb-1 font-bold tracking-wider flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-[#B97845]" />
                      <span>Select Category</span>
                    </label>
                    <div className="relative">
                      <select
                        value={activePosCategory}
                        onChange={(e) => setPosCategory(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-[#0A0908] border-2 border-[#3B2417] hover:border-[#B97845] focus:border-[#B97845] text-xs font-mono font-bold text-[#FFF9F2] focus:outline-none transition-all appearance-none cursor-pointer shadow-inner"
                      >
                        {categoriesWithProducts.map((cat) => {
                          const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                          return (
                            <option key={cat.id} value={cat.name} className="bg-[#160E0A] text-[#FFF9F2] py-1 font-mono">
                              {cat.name} ({count} items)
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#B97845]">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="sm:col-span-6">
                    <label className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block mb-1 font-bold tracking-wider flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-[#B97845]" />
                      <span>Search In {activePosCategory}</span>
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#B97845] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        placeholder={`Search ${activePosCategory.toLowerCase()}...`}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-xs text-[#FFF9F2] focus:outline-none focus:border-[#B97845]"
                      />
                    </div>
                  </div>

                </div>

                {/* Category Summary Status */}
                <div className="flex items-center justify-between pt-1 border-t border-[#3B2417]/50 text-xs font-mono">
                  <span className="text-[#F4E7D7]/70 text-[11px]">
                    Active Category: <strong className="text-[#C9945C] uppercase">{activePosCategory}</strong>
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#21150F] border border-[#3B2417] text-emerald-400 font-bold">
                    {filteredPosProducts.length} Items Available
                  </span>
                </div>
              </div>

              {/* Products Quick Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 max-h-[600px] md:max-h-[720px] lg:max-h-[640px] overflow-y-auto pr-1">
                {filteredPosProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToPosCart(p)}
                    className="bg-[#160E0A] border border-[#3B2417] hover:border-[#B97845] rounded-2xl p-2.5 text-left transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between group h-40 relative overflow-hidden"
                  >
                    <div className="flex gap-2.5 items-start">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover bg-[#0A0908] flex-shrink-0 border border-[#3B2417]/40"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono text-[#B97845] font-bold block uppercase truncate">
                          {p.category}
                        </span>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-[#FFF9F2] group-hover:text-[#F4E7D7] line-clamp-2 leading-tight">
                          {p.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#3B2417]/50 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#C9945C]">
                          ₹{p.price}
                        </span>
                        {p.isBestSeller && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#B97845]/20 text-[#C9945C] font-bold">
                            HOT
                          </span>
                        )}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#21150F] text-[#FFF9F2] group-hover:bg-[#B97845] group-hover:text-[#0A0908] flex items-center justify-center text-xs font-bold">
                        +
                      </div>
                    </div>
                  </button>
                ))}
              </div>

            </div>

            {/* Right: Live POS Bill Terminal */}
            <div className="md:col-span-5 lg:col-span-5 bg-[#160E0A] border border-[#3B2417] rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl space-y-4 sm:space-y-6 md:sticky md:top-20">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#3B2417]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#21150F] flex items-center justify-center text-[#C9945C]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#FFF9F2] uppercase">
                      ACTIVE BILL
                    </h3>
                    <span className="text-[10px] font-mono text-[#C9945C] block">
                      {currentIstDate} • {currentIstTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#21150F] border border-[#3B2417] text-[10px] font-mono text-[#F4E7D7]/70">
                    {posCart.length} Items
                  </span>
                  {posCart.length > 0 && (
                    <button
                      onClick={clearPosCart}
                      className="text-xs font-mono text-rose-400 hover:text-rose-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Table / Customer details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    placeholder="Walk-in Guest"
                    className="w-full px-3 py-2 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block mb-1">
                    Table / Mode
                  </label>
                  <select
                    value={posTableNo}
                    onChange={(e) => setPosTableNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                  >
                    <option value="Table 1">Table 01</option>
                    <option value="Table 2">Table 02</option>
                    <option value="Table 3">Table 03</option>
                    <option value="Table 4">Table 04</option>
                    <option value="Takeaway Parcel">Takeaway Parcel</option>
                    <option value="Counter Pickup">Counter Pickup</option>
                  </select>
                </div>
              </div>

              {/* POS BILL DATE / CALENDAR FOR ADDING PREVIOUS BILLS */}
              <div className="bg-[#0A0908] border border-[#3B2417] rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B97845]" />
                    <span className="text-[10px] font-mono uppercase text-[#FFF9F2] font-bold tracking-wider">
                      BILL DATE (CALENDAR)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPosUseCustomDate(!posUseCustomDate)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all ${
                      posUseCustomDate
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#21150F] border-[#3B2417] text-[#C9945C] hover:border-[#B97845]'
                    }`}
                  >
                    <span>{posUseCustomDate ? '📅 Historical Date Mode' : '+ Add Previous Bill'}</span>
                  </button>
                </div>

                {!posUseCustomDate ? (
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#F4E7D7]/70 bg-[#160E0A] px-3 py-1.5 rounded-xl border border-[#3B2417]/40">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Time
                    </span>
                    <span className="text-xs text-[#FFF9F2] font-bold">{currentIstDate} • {currentIstTime}</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1 animate-fadeIn text-xs font-mono">
                    <div className="bg-amber-950/30 border border-amber-500/40 p-2 rounded-xl text-[10px] text-amber-200 leading-relaxed flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>Backdate Mode:</strong> This bill will be recorded into Cloud SQL with the chosen previous date.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase text-[#F4E7D7]/70 block mb-1 font-bold">
                          Select Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={posCustomDate}
                          onChange={(e) => setPosCustomDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[#21150F] border border-amber-500/60 text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase text-[#F4E7D7]/70 block mb-1 font-bold">
                          Time of Bill *
                        </label>
                        <input
                          type="text"
                          value={posCustomTime}
                          onChange={(e) => setPosCustomTime(e.target.value)}
                          placeholder="e.g. 02:30 PM"
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[#21150F] border border-amber-500/60 text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                        />
                      </div>
                    </div>

                    {/* Quick jump presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setPosCustomDate(today);
                        }}
                        className={`px-2 py-1 rounded-md text-[9px] border font-bold transition-colors ${
                          posCustomDate === new Date().toISOString().split('T')[0]
                            ? 'bg-[#B97845] text-[#0A0908] border-[#B97845]'
                            : 'bg-[#160E0A] border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]'
                        }`}
                      >
                        Today
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                          setPosCustomDate(yest);
                        }}
                        className={`px-2 py-1 rounded-md text-[9px] border font-bold transition-colors ${
                          posCustomDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                            ? 'bg-[#B97845] text-[#0A0908] border-[#B97845]'
                            : 'bg-[#160E0A] border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]'
                        }`}
                      >
                        Yesterday
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const d2 = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
                          setPosCustomDate(d2);
                        }}
                        className={`px-2 py-1 rounded-md text-[9px] border font-bold transition-colors ${
                          posCustomDate === new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
                            ? 'bg-[#B97845] text-[#0A0908] border-[#B97845]'
                            : 'bg-[#160E0A] border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]'
                        }`}
                      >
                        2 Days Ago
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const d7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
                          setPosCustomDate(d7);
                        }}
                        className={`px-2 py-1 rounded-md text-[9px] border font-bold transition-colors ${
                          posCustomDate === new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
                            ? 'bg-[#B97845] text-[#0A0908] border-[#B97845]'
                            : 'bg-[#160E0A] border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]'
                        }`}
                      >
                        7 Days Ago
                      </button>

                      <button
                        type="button"
                        onClick={() => setPosUseCustomDate(false)}
                        className="px-2 py-1 rounded-md text-[9px] text-rose-400 hover:text-rose-300 ml-auto"
                      >
                        Reset Live
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Items Table */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {posCart.length === 0 ? (
                  <div className="text-center py-8 text-xs font-mono text-[#F4E7D7]/50 border border-dashed border-[#3B2417] rounded-2xl">
                    Tap items on the left to add to this bill.
                  </div>
                ) : (
                  posCart.map((it) => (
                    <div
                      key={it.product.id}
                      className="bg-[#0A0908] border border-[#3B2417] p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[#FFF9F2] block truncate">
                          {it.product.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#C9945C]">
                          ₹{it.product.price} each
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-[#21150F] rounded-lg px-2 py-1">
                        <button
                          onClick={() => updatePosCartQty(it.product.id, it.quantity - 1)}
                          className="w-4 h-4 flex items-center justify-center text-[#F4E7D7]"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-4 text-center">{it.quantity}</span>
                        <button
                          onClick={() => updatePosCartQty(it.product.id, it.quantity + 1)}
                          className="w-4 h-4 flex items-center justify-center text-[#F4E7D7]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-xs text-[#FFF9F2] w-14 text-right">
                        ₹{it.product.price * it.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#F4E7D7]/80 block font-bold">
                  PAYMENT TENDER
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  {(['CASH', 'ONLINE', 'COMPLIMENTARY', 'PAY_AT_COUNTER'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPosPaymentMethod(method)}
                      className={`py-2 rounded-xl border text-center font-bold transition-colors ${
                        posPaymentMethod === method
                          ? 'bg-[#B97845] border-[#B97845] text-[#0A0908]'
                          : 'bg-[#0A0908] border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]'
                      }`}
                    >
                      {method === 'ONLINE' ? 'UPI/CARD' : method === 'PAY_AT_COUNTER' ? 'COUNTER' : method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Section (Optional) */}
              <div className="bg-[#0A0908] border border-[#3B2417] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#B97845]" />
                    <span className="text-[10px] font-mono uppercase text-[#FFF9F2] font-bold tracking-wider">
                      DISCOUNT
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#21150F] text-[#F4E7D7]/60 border border-[#3B2417]">
                      OPTIONAL
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                    className="text-[11px] font-mono text-[#B97845] hover:text-[#C9945C] flex items-center gap-1 font-semibold"
                  >
                    <span>{showDiscountInput ? 'Hide' : posDiscount > 0 ? `Applied: ₹${posDiscount}` : '+ Add Discount'}</span>
                    {showDiscountInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showDiscountInput && (
                  <div className="pt-2 border-t border-[#3B2417]/60 space-y-3 text-xs font-mono animate-fadeIn">
                    {/* Mode Toggle: Percentage vs Flat Amount */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#F4E7D7]/70 uppercase">Discount Type:</span>
                      <div className="flex bg-[#21150F] rounded-lg p-0.5 border border-[#3B2417]">
                        <button
                          type="button"
                          onClick={() => setPosDiscountType('PERCENT')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                            posDiscountType === 'PERCENT'
                              ? 'bg-[#B97845] text-[#0A0908]'
                              : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2]'
                          }`}
                        >
                          % Percentage
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosDiscountType('FLAT')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                            posDiscountType === 'FLAT'
                              ? 'bg-[#B97845] text-[#0A0908]'
                              : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2]'
                          }`}
                        >
                          ₹ Flat Cash
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#F4E7D7]/60 block">Quick Presets:</span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {posDiscountType === 'PERCENT'
                          ? [5, 10, 15, 20].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPosDiscountValue(val)}
                                className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                  posDiscountValue === val
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'bg-[#21150F] border-[#3B2417] text-[#F4E7D7]/80 hover:border-[#B97845]'
                                }`}
                              >
                                {val}%
                              </button>
                            ))
                          : [20, 50, 100, 200].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPosDiscountValue(val)}
                                className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                  posDiscountValue === val
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'bg-[#21150F] border-[#3B2417] text-[#F4E7D7]/80 hover:border-[#B97845]'
                                }`}
                              >
                                ₹{val}
                              </button>
                            ))}
                        <button
                          type="button"
                          onClick={() => setPosDiscountValue(0)}
                          className="py-1 rounded-lg text-[10px] font-bold border bg-[#21150F] border-[#3B2417] text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Reset discount to zero"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Direct Input Field */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#B97845] font-bold">
                          {posDiscountType === 'PERCENT' ? '%' : '₹'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={posDiscountType === 'PERCENT' ? 100 : posSubtotal}
                          value={posDiscountValue === 0 ? '' : posDiscountValue}
                          onChange={(e) => setPosDiscountValue(e.target.value === '' ? 0 : Number(e.target.value))}
                          placeholder={posDiscountType === 'PERCENT' ? 'Custom % (optional)' : 'Custom ₹ (optional)'}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] text-xs focus:outline-none focus:border-[#B97845]"
                        />
                      </div>
                      {posDiscount > 0 && (
                        <span className="text-[11px] font-bold text-emerald-400 whitespace-nowrap">
                          -₹{posDiscount}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Totals */}
              <div className="bg-[#0A0908] border border-[#3B2417] p-4 rounded-2xl space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#F4E7D7]/70">
                  <span>Subtotal</span>
                  <span>₹{posSubtotal}</span>
                </div>

                {posDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Discount ({posDiscountType === 'PERCENT' ? `${posDiscountValue}%` : 'Flat'})
                    </span>
                    <span>-₹{posDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-[#FFF9F2] pt-2 border-t border-[#3B2417]">
                  <span>Total Amount</span>
                  <span className="text-[#C9945C]">₹{posTotal}</span>
                </div>
              </div>

              {/* Bill Submit Button */}
              <button
                onClick={handleCreatePosBill}
                disabled={isSubmittingBill || posCart.length === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#B97845]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingBill ? (
                  <span>GENERATING BILL...</span>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>PRINT & SAVE BILL • ₹{posTotal}</span>
                  </>
                )}
              </button>

            </div>

          </div>
        )}

        {/* ================= TAB 2: PRODUCTS & MENU ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                  MENU & PRODUCT MASTER
                </h3>
                <p className="text-xs text-[#F4E7D7]/70 font-body">
                  Manage active coffees, hot chocolates, cold brews, gourmet pancakes, and live availability toggles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSyncAll62Products}
                  className="px-4 py-2.5 rounded-full bg-[#21150F] text-[#C9945C] border border-[#3B2417] hover:border-[#B97845] font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                  title="Reload and guarantee all official menu items are in database"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>SYNC OFFICIAL MENU</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setNewCategoryName('');
                        setNewCategoryDesc('');
                        setIsCategoryModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-full bg-[#21150F] text-[#F4E7D7] border border-[#3B2417] hover:border-[#B97845] font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                      title="Create a new Category that syncs across Homepage & POS"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B97845]" />
                      <span>+ ADD CATEGORY</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsCustomCategoryMode(false);
                        setCustomCategoryInput('');
                        setEditingProduct({
                          name: '',
                          category: categories[0]?.name || 'Hot',
                          price: 129,
                          description: '',
                          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                          availability: true,
                          inventoryQuantity: 50,
                          minStock: 5,
                          isFeatured: false,
                          isBestSeller: false,
                          isSpecial: false,
                          addOns: [],
                          ingredients: [],
                        });
                        setIsProductModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-full bg-[#B97845] text-[#0A0908] font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#C9945C] transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ADD NEW MENU ITEM</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Category Filter, Search Bar & Price Sort (Category-wise Dropdown Menu) */}
            {(() => {
              const activeAdminCategory = (adminProductCategory && adminProductCategory !== 'All' && categoriesWithProducts.some(c => c.name.toLowerCase() === adminProductCategory.toLowerCase()))
                ? adminProductCategory
                : (categoriesWithProducts[0]?.name || categories[0]?.name || 'Pancake');

              const filteredAndSortedAdminProducts = products
                .filter((p) => {
                  const matchesCat = p.category.toLowerCase() === activeAdminCategory.toLowerCase();
                  const matchesSearch =
                    adminProductSearch.trim() === '' ||
                    p.name.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
                    (p.description || '').toLowerCase().includes(adminProductSearch.toLowerCase());
                  return matchesCat && matchesSearch;
                })
                .sort((a, b) => {
                  if (adminMenuSortOrder === 'price-asc') return a.price - b.price;
                  if (adminMenuSortOrder === 'price-desc') return b.price - a.price;
                  if (adminMenuSortOrder === 'name-asc') return a.name.localeCompare(b.name);
                  return a.price - b.price;
                });

              return (
                <div className="bg-[#160E0A] border border-[#3B2417] p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Category Wise Dropdown */}
                    <div className="sm:col-span-4 relative">
                      <label className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block mb-1 font-bold tracking-wider flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-[#B97845]" />
                        <span>Select Category</span>
                      </label>
                      <div className="relative">
                        <select
                          value={activeAdminCategory}
                          onChange={(e) => setAdminProductCategory(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-[#0A0908] border-2 border-[#3B2417] hover:border-[#B97845] focus:border-[#B97845] text-xs font-mono font-bold text-[#FFF9F2] focus:outline-none transition-all appearance-none cursor-pointer shadow-inner"
                        >
                          {categoriesWithProducts.map((cat) => {
                            const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                            return (
                              <option key={cat.id} value={cat.name} className="bg-[#160E0A] text-[#FFF9F2] py-1 font-mono">
                                {cat.name} ({count} items)
                              </option>
                            );
                          })}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#B97845]">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block mb-1 font-bold tracking-wider flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-[#B97845]" />
                        <span>Search in {activeAdminCategory}</span>
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-[#B97845] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={adminProductSearch}
                          onChange={(e) => setAdminProductSearch(e.target.value)}
                          placeholder="Search items by name, ingredients, notes..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-xs text-[#FFF9F2] focus:outline-none focus:border-[#B97845]"
                        />
                      </div>
                    </div>

                    {/* Sort Selector: Price Low to High */}
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-mono text-[#F4E7D7]/70 uppercase block mb-1 font-bold tracking-wider flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#B97845]" />
                        <span>Sort Items</span>
                      </label>
                      <div className="relative">
                        <select
                          value={adminMenuSortOrder}
                          onChange={(e) => setAdminMenuSortOrder(e.target.value as any)}
                          className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-xs font-mono font-bold text-[#FFF9F2] focus:outline-none focus:border-[#B97845] cursor-pointer"
                        >
                          <option value="price-asc" className="bg-[#160E0A] text-[#FFF9F2]">Price: Low to High (₹)</option>
                          <option value="price-desc" className="bg-[#160E0A] text-[#FFF9F2]">Price: High to Low (₹)</option>
                          <option value="name-asc" className="bg-[#160E0A] text-[#FFF9F2]">Name: (A – Z)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#B97845]">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#3B2417]/50 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F4E7D7]/70">
                        Category: <strong className="text-[#C9945C] uppercase">{activeAdminCategory}</strong>
                      </span>
                      <span className="text-[#F4E7D7]/40">•</span>
                      <span className="text-[#F4E7D7]/70">
                        Sort: <strong className="text-emerald-400">{adminMenuSortOrder === 'price-asc' ? 'Lowest to Highest Price (₹)' : adminMenuSortOrder === 'price-desc' ? 'Highest to Lowest Price (₹)' : 'Alphabetical (A-Z)'}</strong>
                      </span>
                    </div>

                    <span className="text-[10px] px-3 py-1 rounded-full bg-[#21150F] border border-[#3B2417] text-emerald-400 font-bold">
                      {filteredAndSortedAdminProducts.length} Items
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Products Table */}
            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-[#0A0908] border-b border-[#3B2417] text-[10px] font-mono uppercase text-[#B97845] tracking-wider">
                    <tr>
                      <th className="p-4">Item & Image</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price (₹)</th>
                      <th className="p-4">Status (Stock)</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4 text-right">{isAdmin ? 'Actions' : 'Management'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B2417]/50">
                    {(() => {
                      const activeCat = (adminProductCategory && adminProductCategory !== 'All' && categoriesWithProducts.some(c => c.name.toLowerCase() === adminProductCategory.toLowerCase()))
                        ? adminProductCategory
                        : (categoriesWithProducts[0]?.name || categories[0]?.name || 'Pancake');

                      return products
                        .filter((p) => {
                          const matchesCat = p.category.toLowerCase() === activeCat.toLowerCase();
                          const matchesSearch =
                            adminProductSearch.trim() === '' ||
                            p.name.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
                            (p.description || '').toLowerCase().includes(adminProductSearch.toLowerCase());
                          return matchesCat && matchesSearch;
                        })
                        .sort((a, b) => {
                          if (adminMenuSortOrder === 'price-asc') return a.price - b.price;
                          if (adminMenuSortOrder === 'price-desc') return b.price - a.price;
                          if (adminMenuSortOrder === 'name-asc') return a.name.localeCompare(b.name);
                          return a.price - b.price;
                        })
                        .map((p) => (
                      <tr key={p.id} className="hover:bg-[#21150F]/40 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-[#0A0908]"
                          />
                          <div>
                            <span className="font-bold text-sm text-[#FFF9F2] block">{p.name}</span>
                            <span className="text-[11px] text-[#F4E7D7]/60 line-clamp-1 max-w-xs">{p.description}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-[#F4E7D7]/80">
                          {p.category}
                        </td>

                        <td className="p-4 font-mono font-bold text-[#C9945C] text-sm">
                          ₹{p.price}
                        </td>

                        <td className="p-4">
                          {isAdmin ? (
                            <button
                              onClick={() => handleToggleProductAvailability(p)}
                              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                                p.availability
                                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                                  : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                              }`}
                              title="Click to toggle stock status (Admin only)"
                            >
                              {p.availability ? '● IN STOCK' : '○ SOLD OUT'}
                            </button>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-block ${
                                p.availability
                                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                                  : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                              }`}
                            >
                              {p.availability ? '● IN STOCK' : '○ SOLD OUT'}
                            </span>
                          )}
                        </td>

                        <td className="p-4 space-x-1">
                          {p.isBestSeller && (
                            <span className="px-2 py-0.5 rounded bg-[#B97845]/20 text-[#C9945C] text-[10px] font-mono font-bold">
                              BESTSELLER
                            </span>
                          )}
                          {p.isSpecial && (
                            <span className="px-2 py-0.5 rounded bg-[#6F4E37]/40 text-[#F4E7D7] text-[10px] font-mono font-bold">
                              SPECIAL
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] transition-colors"
                                title="Edit product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeleteTarget({ type: 'product', id: p.id, name: p.name })}
                                className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-mono text-[#F4E7D7]/40">Admin Only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    )()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: LIVE INVENTORY & RECIPES ================= */}
        {isAdmin && activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Header & Mode Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase flex items-center gap-2.5">
                  <Package className="w-6 h-6 text-[#B97845]" />
                  <span>INVENTORY & DISH RECIPES MASTER</span>
                </h3>
                <p className="text-xs text-[#F4E7D7]/70 font-body mt-1">
                  Manage raw ingredients, custom stock categories, and link ingredients to dish recipes for automatic POS stock deductions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* View Mode Toggle */}
                <div className="bg-[#160E0A] border border-[#3B2417] p-1 rounded-2xl flex items-center gap-1 shadow-inner">
                  <button
                    onClick={() => setInventoryTabMode('stock')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                      inventoryTabMode === 'stock'
                        ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                        : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Raw Stock ({inventory.length})</span>
                  </button>

                  <button
                    onClick={() => setInventoryTabMode('recipes')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                      inventoryTabMode === 'recipes'
                        ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                        : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Dish Recipes ({products.length})</span>
                  </button>
                </div>

                {isAdmin && inventoryTabMode === 'stock' && (
                  <>
                    <button
                      onClick={() => {
                        setNewInventoryCatName('');
                        setIsAddInventoryCatModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-full bg-[#21150F] text-[#F4E7D7] border border-[#3B2417] hover:border-[#B97845] font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg"
                      title="Add a new custom Inventory Category"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B97845]" />
                      <span>+ ADD CATEGORY</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingInventory({
                          name: '',
                          category: allInventoryCategories[0] || 'Coffee Beans',
                          quantity: 1000,
                          unit: 'g',
                          minStock: 200,
                          supplier: 'Coorg Artisan Estate',
                        });
                        setIsInventoryModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-full bg-[#B97845] text-[#0A0908] font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#C9945C] transition-all flex items-center gap-1.5 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ADD INGREDIENT</span>
                    </button>
                  </>
                )}

                {isAdmin && inventoryTabMode === 'recipes' && (
                  <button
                    onClick={() => {
                      if (products.length > 0) {
                        setEditingRecipeProduct(products[0]);
                        setRecipeIngredients(products[0].ingredients || []);
                        setIsRecipeModalOpen(true);
                      }
                    }}
                    className="px-5 py-2 rounded-full bg-[#B97845] text-[#0A0908] font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#C9945C] transition-all flex items-center gap-1.5 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ CONFIGURE RECIPE</span>
                  </button>
                )}
              </div>
            </div>

            {/* ================= INVENTORY STOCK VIEW ================= */}
            {inventoryTabMode === 'stock' && (
              <div className="space-y-6">
                {/* Search & Category Filter Bar */}
                <div className="bg-[#160E0A] border border-[#3B2417] p-4 rounded-3xl shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="w-4 h-4 text-[#B97845] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inventorySearchQuery}
                        onChange={(e) => setInventorySearchQuery(e.target.value)}
                        placeholder="Search ingredients, category, supplier..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-xs font-mono text-[#FFF9F2] focus:outline-none focus:border-[#B97845]"
                      />
                    </div>

                    <div className="text-xs font-mono text-[#F4E7D7]/60 flex items-center gap-2">
                      <span>Total: <strong>{filteredInventoryItems.length}</strong> items</span>
                      {inventory.some(i => i.quantity <= i.minStock) && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                          {inventory.filter(i => i.quantity <= i.minStock).length} Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inventory Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 select-none">
                    <button
                      onClick={() => setInventoryCategoryFilter('ALL')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap ${
                        inventoryCategoryFilter === 'ALL'
                          ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                          : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
                      }`}
                    >
                      All Categories ({inventory.length})
                    </button>

                    {allInventoryCategories.map((cat) => {
                      const count = inventory.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setInventoryCategoryFilter(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap ${
                            inventoryCategoryFilter.toLowerCase() === cat.toLowerCase()
                              ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                              : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stock Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInventoryItems.map((inv) => {
                    const isLow = inv.quantity <= inv.minStock;
                    const usedInProducts = products.filter((p) =>
                      p.ingredients?.some((ing) => ing.ingredientId === inv.id || ing.name.toLowerCase() === inv.name.toLowerCase())
                    );

                    return (
                      <div
                        key={inv.id}
                        className={`bg-[#160E0A] border rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between ${
                          isLow ? 'border-rose-700/80 bg-rose-950/10' : 'border-[#3B2417]'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                                {inv.category || 'INGREDIENT ITEM'}
                              </span>
                              <h4 className="font-display text-lg font-bold text-[#FFF9F2]">
                                {inv.name}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isLow ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-900/80 text-rose-200 border border-rose-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  LOW STOCK
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                                  OPTIMAL
                                </span>
                              )}

                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingInventory(inv);
                                      setIsInventoryModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] transition-colors"
                                    title="Edit raw stock item"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setDeleteTarget({ type: 'inventory', id: inv.id, name: inv.name })}
                                    className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 transition-colors"
                                    title="Delete raw stock item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Stock gauge */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-[#F4E7D7]/70">Current Level:</span>
                              <span className="font-bold text-[#FFF9F2]">
                                {inv.quantity} {inv.unit}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#0A0908] rounded-full overflow-hidden border border-[#3B2417]">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isLow ? 'bg-rose-500' : 'bg-[#B97845]'
                                }`}
                                style={{
                                  width: `${Math.min(100, (inv.quantity / (Math.max(1, inv.minStock) * 3)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-[#F4E7D7]/50 block">
                              Min threshold: {inv.minStock} {inv.unit} {inv.supplier ? `• Supplier: ${inv.supplier}` : ''}
                            </span>
                          </div>

                          {/* Recipe Links */}
                          <div className="pt-2 border-t border-[#3B2417]/50">
                            <div className="text-[10px] font-mono text-[#F4E7D7]/60 flex items-center justify-between">
                              <span>Used In Recipes:</span>
                              <span className="font-bold text-[#C9945C]">{usedInProducts.length} dishes</span>
                            </div>
                            {usedInProducts.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {usedInProducts.slice(0, 3).map((p) => (
                                  <span key={p.id} className="px-2 py-0.5 rounded bg-[#21150F] text-[#F4E7D7]/80 text-[9px] font-mono border border-[#3B2417]">
                                    {p.name}
                                  </span>
                                ))}
                                {usedInProducts.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#21150F] text-[#B97845] text-[9px] font-mono">
                                    +{usedInProducts.length - 3} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-[#F4E7D7]/40 block mt-0.5">
                                Not linked to any recipe yet.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Adjustment Controls (Admin only) */}
                        {isAdmin ? (
                          <div className="pt-2 border-t border-[#3B2417]/50 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-[#F4E7D7]/70">Quick Adjust:</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleUpdateStock(inv.id, Math.max(0, inv.quantity - (inv.unit === 'g' || inv.unit === 'ml' ? 100 : 1)))}
                                className="px-2 py-1 rounded-lg bg-[#21150F] hover:bg-[#3B2417] text-xs font-mono text-[#F4E7D7]"
                              >
                                -{inv.unit === 'g' || inv.unit === 'ml' ? '100' : '1'}
                              </button>
                              <button
                                onClick={() => handleUpdateStock(inv.id, inv.quantity + (inv.unit === 'g' || inv.unit === 'ml' ? 500 : 5))}
                                className="px-3 py-1 rounded-lg bg-[#B97845] hover:bg-[#C9945C] text-xs font-mono font-bold text-[#0A0908]"
                              >
                                +{inv.unit === 'g' || inv.unit === 'ml' ? '500' : '5'} {inv.unit} Restock
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-[#3B2417]/50 flex items-center justify-between text-[11px] font-mono text-[#F4E7D7]/50">
                            <span>Stock Monitoring:</span>
                            <span className="text-[#C9945C] font-semibold">{inv.quantity} {inv.unit}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= INVENTORY DISH RECIPES VIEW ================= */}
            {inventoryTabMode === 'recipes' && (
              <div className="space-y-6">
                <div className="bg-[#160E0A] border border-[#3B2417] p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-[#B97845] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recipeSearch}
                      onChange={(e) => setRecipeSearch(e.target.value)}
                      placeholder="Search dish recipe, pancakes, coffees..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-xs font-mono text-[#FFF9F2] focus:outline-none focus:border-[#B97845]"
                    />
                  </div>

                  <div className="text-xs font-mono text-[#F4E7D7]/70 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#B97845]" />
                    <span>Recipes Configured: <strong>{products.filter(p => (p.ingredients?.length || 0) > 0).length} / {products.length}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter((p) => {
                      if (!recipeSearch.trim()) return true;
                      const q = recipeSearch.toLowerCase();
                      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
                    })
                    .map((prod) => {
                      const hasRecipe = prod.ingredients && prod.ingredients.length > 0;

                      // Compute estimated stock capability (how many dishes can be made)
                      let maxServings = Infinity;
                      if (hasRecipe) {
                        prod.ingredients?.forEach((ing) => {
                          const stockItem = inventory.find(
                            (i) => i.id === ing.ingredientId || i.name.toLowerCase() === ing.name.toLowerCase()
                          );
                          if (stockItem && ing.amount > 0) {
                            const possible = Math.floor(stockItem.quantity / ing.amount);
                            if (possible < maxServings) maxServings = possible;
                          }
                        });
                      }
                      if (maxServings === Infinity) maxServings = 0;

                      return (
                        <div
                          key={prod.id}
                          className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                                  {prod.category}
                                </span>
                                <h4 className="font-display text-lg font-bold text-[#FFF9F2]">
                                  {prod.name}
                                </h4>
                                <span className="text-xs font-mono font-bold text-[#C9945C]">
                                  Menu Price: ₹{prod.price}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  setEditingRecipeProduct(prod);
                                  setRecipeIngredients(prod.ingredients || []);
                                  setIsRecipeModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] font-mono text-xs border border-[#3B2417] flex items-center gap-1.5 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>{hasRecipe ? 'Edit Formula' : '+ Add Recipe'}</span>
                              </button>
                            </div>

                            {/* Ingredient Recipe Breakdown */}
                            <div className="bg-[#0A0908] border border-[#3B2417] rounded-2xl p-3.5 space-y-2">
                              <span className="text-[10px] font-mono uppercase text-[#F4E7D7]/60 block font-bold">
                                RECIPE INGREDIENTS ({prod.ingredients?.length || 0}):
                              </span>
                              {hasRecipe ? (
                                <ul className="space-y-1 text-xs font-mono">
                                  {prod.ingredients?.map((ing, idx) => {
                                    const stockItem = inventory.find(
                                      (i) => i.id === ing.ingredientId || i.name.toLowerCase() === ing.name.toLowerCase()
                                    );
                                    const isLow = stockItem && stockItem.quantity < ing.amount;

                                    return (
                                      <li key={idx} className="flex items-center justify-between text-[#F4E7D7]/80">
                                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                                          <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                                          <span className="truncate">{ing.name}</span>
                                        </div>
                                        <span className="text-[#C9945C] font-bold">
                                          {ing.amount} {ing.unit}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <div className="text-center py-3 text-xs font-mono text-[#F4E7D7]/40">
                                  No recipe ingredients added yet.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stock Portion Readiness */}
                          <div className="pt-2 border-t border-[#3B2417]/50 flex items-center justify-between text-xs font-mono">
                            <span className="text-[#F4E7D7]/70">Yield Capability:</span>
                            {hasRecipe ? (
                              <span className={`font-bold ${maxServings > 10 ? 'text-emerald-400' : maxServings > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                                ~{maxServings} portions in stock
                              </span>
                            ) : (
                              <span className="text-[#F4E7D7]/40">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 4: ORDER & BILLS HISTORY (LIVE ORDER MANAGEMENT) ================= */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase tracking-wide">
                    {isAdmin ? 'LIVE ORDERS & INVOICE MANAGEMENT' : 'STAFF ORDERS & LIVE INVOICES'}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE ({bills.length})
                  </span>
                  {bills.filter((b) => b.status === 'PENDING').length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-[10px] font-mono font-black text-amber-300 flex items-center gap-1.5 animate-pulse shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      {bills.filter((b) => b.status === 'PENDING').length} PENDING ACCEPTANCE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#F4E7D7]/70 font-body mt-1">
                  {isAdmin
                    ? 'Track all employee bills with real-time filters, accept incoming web orders, monitor shift sales, and print PDF invoices.'
                    : 'Manage your individual shift bills and review incoming online customer orders.'}
                </p>
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      const updated = await api.getBills();
                      setBills(updated);
                      showToast('Live orders refreshed!');
                    } catch (err: any) {
                      showToast(err.message || 'Failed to refresh orders', true);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#FFF9F2] font-mono text-xs flex items-center gap-1.5 transition-colors border border-[#3B2417]"
                  title="Refresh Orders"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#B97845]" />
                  <span>REFRESH</span>
                </button>
              </div>
            </div>

            {/* EMPLOYEE MODE SUB-TABS (When logged in as Staff) */}
            {!isAdmin && (
              <div className="bg-[#160E0A] border border-[#3B2417] p-2 rounded-2xl flex items-center gap-2 overflow-x-auto shadow-lg">
                <button
                  onClick={() => setStaffViewMode('MY_BILLS')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                    staffViewMode === 'MY_BILLS'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                      : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2]'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>MY SHIFT BILLS ({user?.name || 'Staff'})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${staffViewMode === 'MY_BILLS' ? 'bg-black/30 text-white' : 'bg-[#0A0908] text-[#B97845]'}`}>
                    {bills.filter((b) => {
                      const myName = (user?.name || '').toLowerCase();
                      const myUser = (user?.username || '').toLowerCase();
                      const creator = (b.createdBy || '').toLowerCase();
                      return creator.includes(myName) || creator.includes(myUser) || (user?.id && b.createdById === user.id);
                    }).length}
                  </span>
                </button>

                <button
                  onClick={() => setStaffViewMode('ONLINE_ORDERS')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                    staffViewMode === 'ONLINE_ORDERS'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                      : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2]'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>ONLINE CUSTOMER ORDERS</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${staffViewMode === 'ONLINE_ORDERS' ? 'bg-black/30 text-white' : 'bg-[#0A0908] text-[#B97845]'}`}>
                    {bills.filter((b) => (b.createdBy || '').toLowerCase().includes('online') || (b.createdBy || '').toLowerCase().includes('customer')).length}
                  </span>
                </button>

                <button
                  onClick={() => setStaffViewMode('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                    staffViewMode === 'ALL'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                      : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2]'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>ALL CAFE ORDERS ({bills.length})</span>
                </button>
              </div>
            )}

            {/* EMPLOYEE SHIFT PERFORMANCE BANNER (For logged-in Staff) */}
            {!isAdmin && staffViewMode === 'MY_BILLS' && (() => {
              const myName = (user?.name || '').toLowerCase();
              const myUser = (user?.username || '').toLowerCase();
              const myBills = bills.filter((b) => {
                const creator = (b.createdBy || '').toLowerCase();
                return creator.includes(myName) || creator.includes(myUser) || (user?.id && b.createdById === user.id);
              });
              const myTotal = myBills.reduce((acc, b) => acc + (b.total || 0), 0);
              const myCash = myBills.filter((b) => b.paymentMethod === 'CASH').reduce((acc, b) => acc + (b.total || 0), 0);
              const myOnline = myBills.filter((b) => b.paymentMethod === 'ONLINE' || b.paymentMethod === 'PAY_AT_COUNTER').reduce((acc, b) => acc + (b.total || 0), 0);

              return (
                <div className="bg-gradient-to-r from-[#21150F] to-[#160E0A] border border-[#B97845]/40 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#B97845]/20 border border-[#B97845]/50 flex items-center justify-center text-[#B97845]">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-[#FFF9F2] uppercase">{user?.name || 'Staff Member'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-700">MY SHIFT</span>
                      </div>
                      <p className="text-xs text-[#F4E7D7]/70 font-body">All bills punched under your staff account. Synchronized in real-time.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs divide-x divide-[#3B2417]">
                    <div>
                      <span className="text-[10px] uppercase text-[#F4E7D7]/60 block">Orders Punched</span>
                      <span className="font-bold text-[#FFF9F2] text-sm sm:text-base">{myBills.length} Bills</span>
                    </div>
                    <div className="pl-4 sm:pl-6">
                      <span className="text-[10px] uppercase text-[#B97845] font-bold block">Your Shift Total</span>
                      <span className="font-bold text-emerald-400 text-sm sm:text-base">₹{myTotal}</span>
                    </div>
                    <div className="pl-4 sm:pl-6 hidden sm:block">
                      <span className="text-[10px] uppercase text-[#F4E7D7]/60 block">Cash / Online</span>
                      <span className="font-bold text-[#FFF9F2] text-xs">₹{myCash} / ₹{myOnline}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ADMIN EMPLOYEE FILTER SELECTOR BAR */}
            {isAdmin && (
              <div className="bg-[#160E0A] border border-[#3B2417] p-4 rounded-3xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#3B2417]/50">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#B97845]">
                    <Filter className="w-4 h-4" />
                    <span>Filter Bills by Employee / Creator:</span>
                  </div>
                  {selectedEmployeeFilter !== 'ALL' && (
                    <button
                      onClick={() => setSelectedEmployeeFilter('ALL')}
                      className="text-[11px] font-mono text-[#C9945C] hover:text-[#FFF9F2] underline cursor-pointer"
                    >
                      Clear Employee Filter (Show All)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
                  {/* Option: ALL */}
                  <button
                    onClick={() => setSelectedEmployeeFilter('ALL')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedEmployeeFilter === 'ALL'
                        ? 'bg-[#B97845] text-[#0A0908] shadow-md'
                        : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#2B1B14]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Creators & Online</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedEmployeeFilter === 'ALL' ? 'bg-black/30 text-white' : 'bg-[#0A0908] text-[#B97845]'}`}>
                      {bills.length}
                    </span>
                  </button>

                  {/* Registered Employees from database */}
                  {employees.map((emp) => {
                    const empBills = bills.filter((b) => (b.createdBy || '').toLowerCase().includes(emp.name.toLowerCase()) || (b.createdBy || '').toLowerCase().includes(emp.username.toLowerCase()));
                    const isSelected = selectedEmployeeFilter.toLowerCase() === emp.name.toLowerCase() || selectedEmployeeFilter.toLowerCase() === emp.username.toLowerCase();

                    return (
                      <button
                        key={emp.id}
                        onClick={() => setSelectedEmployeeFilter(emp.name)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? 'bg-emerald-500 text-[#0A0908] shadow-md font-extrabold'
                            : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#2B1B14]'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{emp.name} ({emp.role})</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-[#0A0908] text-[#B97845]'}`}>
                          {empBills.length}
                        </span>
                      </button>
                    );
                  })}

                  {/* Online Customers Pill */}
                  {(() => {
                    const onlineBills = bills.filter((b) => (b.createdBy || '').toLowerCase().includes('online') || (b.createdBy || '').toLowerCase().includes('customer'));
                    const isSelected = selectedEmployeeFilter === 'ONLINE_CUSTOMER';

                    return (
                      <button
                        onClick={() => setSelectedEmployeeFilter('ONLINE_CUSTOMER')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? 'bg-indigo-500 text-[#0A0908] shadow-md font-extrabold'
                            : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#2B1B14]'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Online Web Orders</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-[#0A0908] text-[#B97845]'}`}>
                          {onlineBills.length}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ADMIN FILTERED EMPLOYEE SALES SUMMARY BANNER */}
            {isAdmin && selectedEmployeeFilter !== 'ALL' && (() => {
              const target = selectedEmployeeFilter === 'ONLINE_CUSTOMER' ? 'online' : selectedEmployeeFilter.toLowerCase();
              const filteredList = bills.filter((b) => (b.createdBy || '').toLowerCase().includes(target));
              const empTotal = filteredList.reduce((acc, b) => acc + (b.total || 0), 0);
              const empCash = filteredList.filter((b) => b.paymentMethod === 'CASH').reduce((acc, b) => acc + (b.total || 0), 0);
              const empOnline = filteredList.filter((b) => b.paymentMethod === 'ONLINE' || b.paymentMethod === 'PAY_AT_COUNTER').reduce((acc, b) => acc + (b.total || 0), 0);
              const avgTicket = filteredList.length > 0 ? Math.round(empTotal / filteredList.length) : 0;

              return (
                <div className="bg-gradient-to-r from-[#21150F] to-[#160E0A] border border-emerald-500/50 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400">
                      {selectedEmployeeFilter === 'ONLINE_CUSTOMER' ? <Globe className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                          {selectedEmployeeFilter === 'ONLINE_CUSTOMER' ? 'Online Web Orders' : `${selectedEmployeeFilter}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-700">FILTER ACTIVE</span>
                      </div>
                      <p className="text-xs text-[#F4E7D7]/70 font-body">Showing only bills created and billed by this operator/source.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs divide-x divide-[#3B2417]">
                    <div>
                      <span className="text-[10px] uppercase text-[#F4E7D7]/60 block">Billed Invoices</span>
                      <span className="font-bold text-[#FFF9F2] text-sm sm:text-base">{filteredList.length} Orders</span>
                    </div>
                    <div className="pl-4 sm:pl-6">
                      <span className="text-[10px] uppercase text-emerald-400 font-bold block">Total Billed Revenue</span>
                      <span className="font-bold text-emerald-400 text-sm sm:text-base">₹{empTotal}</span>
                    </div>
                    <div className="pl-4 sm:pl-6">
                      <span className="text-[10px] uppercase text-[#F4E7D7]/60 block">Cash / Online</span>
                      <span className="font-bold text-[#FFF9F2] text-xs">₹{empCash} / ₹{empOnline}</span>
                    </div>
                    <div className="pl-4 sm:pl-6 hidden sm:block">
                      <span className="text-[10px] uppercase text-[#F4E7D7]/60 block">Avg Bill Size</span>
                      <span className="font-bold text-[#C9945C] text-xs">₹{avgTicket}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* CALENDAR & DATE PRESET FILTER BAR FOR FETCHING PREVIOUS BILLS */}
            <div className="bg-[#160E0A] border-2 border-[#3B2417] p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#3B2417]/50">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#B97845]">
                  <Calendar className="w-4 h-4" />
                  <span>FETCH & FILTER PREVIOUS BILLS BY CALENDAR / DATE:</span>
                </div>
                <div className="flex items-center gap-2">
                  {(billDatePreset !== 'ALL' || billSelectedDate || billStartDate || billEndDate || billPaymentMethodFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setBillDatePreset('ALL');
                        setBillSelectedDate('');
                        setBillStartDate('');
                        setBillEndDate('');
                        setBillPaymentMethodFilter('ALL');
                      }}
                      className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1 mr-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset Calendar & Filters</span>
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const updated = await api.getBills();
                        setBills(updated);
                        showToast('📅 Fetched latest invoices from database!');
                      } catch (err: any) {
                        showToast(err.message || 'Failed to fetch bills', true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] border border-[#3B2417] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-[#B97845]" />
                    <span>FETCH / REFRESH</span>
                  </button>
                </div>
              </div>

              {/* Date Presets + Custom Calendar Input */}
              <div className="flex flex-wrap items-center gap-2 select-none">
                {(
                  [
                    { id: 'ALL', label: 'All Dates (Full History)' },
                    { id: 'TODAY', label: 'Today' },
                    { id: 'YESTERDAY', label: 'Yesterday' },
                    { id: 'WEEK', label: 'Last 7 Days' },
                    { id: 'MONTH', label: 'This Month' },
                    { id: 'CUSTOM', label: '📅 Pick Date / Calendar Range' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setBillDatePreset(d.id);
                      if (d.id === 'CUSTOM' && !billSelectedDate && !billStartDate) {
                        setBillSelectedDate(new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      billDatePreset === d.id
                        ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                        : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#2B1B14]'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Calendar Date Inputs */}
              {billDatePreset === 'CUSTOM' && (
                <div className="bg-[#0A0908] border border-[#3B2417] p-4 rounded-2xl flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold uppercase text-[#B97845] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Specific Date:
                    </span>
                    <input
                      type="date"
                      value={billSelectedDate}
                      onChange={(e) => {
                        setBillSelectedDate(e.target.value);
                        setBillStartDate('');
                        setBillEndDate('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] text-xs font-mono focus:outline-none focus:border-[#B97845]"
                    />
                  </div>

                  <span className="text-xs text-[#F4E7D7]/40 hidden sm:inline">— OR Select Range:</span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase text-[#F4E7D7]/60">From:</span>
                    <input
                      type="date"
                      value={billStartDate}
                      onChange={(e) => {
                        setBillStartDate(e.target.value);
                        setBillSelectedDate('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] text-xs font-mono focus:outline-none focus:border-[#B97845]"
                    />
                    <span className="text-[10px] uppercase text-[#F4E7D7]/60">To:</span>
                    <input
                      type="date"
                      value={billEndDate}
                      onChange={(e) => {
                        setBillEndDate(e.target.value);
                        setBillSelectedDate('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#21150F] border border-[#3B2417] text-[#FFF9F2] text-xs font-mono focus:outline-none focus:border-[#B97845]"
                    />
                  </div>
                </div>
              )}

              {/* Calendar Date Summary Strip */}
              {(billDatePreset !== 'ALL' || billSelectedDate || billStartDate || billEndDate) && (
                <div className="p-3 bg-[#0A0908] border border-[#3B2417] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#C9945C]">
                    <Clock className="w-4 h-4 text-[#B97845]" />
                    <span>
                      📅 Calendar Active: <strong>{billDatePreset === 'CUSTOM' ? (billSelectedDate || `${billStartDate} to ${billEndDate}`) : billDatePreset}</strong>
                    </span>
                  </div>

                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const matching = bills.filter((b) => {
                      const bDateStr = b.date || (b.createdAt ? b.createdAt.slice(0, 10) : '');
                      if (billDatePreset === 'TODAY') return bDateStr === todayStr;
                      if (billDatePreset === 'YESTERDAY') {
                        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                        return bDateStr === yesterday;
                      }
                      if (billDatePreset === 'WEEK') {
                        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
                        return bDateStr >= weekAgo && bDateStr <= todayStr;
                      }
                      if (billDatePreset === 'MONTH') {
                        return bDateStr.startsWith(todayStr.slice(0, 7));
                      }
                      if (billDatePreset === 'CUSTOM') {
                        if (billSelectedDate && bDateStr !== billSelectedDate) return false;
                        if (billStartDate && bDateStr < billStartDate) return false;
                        if (billEndDate && bDateStr > billEndDate) return false;
                        return true;
                      }
                      return true;
                    });

                    const total = matching.reduce((sum, b) => sum + (b.total || 0), 0);
                    const cash = matching.filter(b => b.paymentMethod === 'CASH').reduce((sum, b) => sum + (b.total || 0), 0);
                    const online = matching.filter(b => b.paymentMethod === 'ONLINE' || b.paymentMethod === 'PAY_AT_COUNTER').reduce((sum, b) => sum + (b.total || 0), 0);

                    return (
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-[#FFF9F2]"><strong>{matching.length}</strong> Invoices</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">Total: ₹{total}</span>
                        <span className="text-[#F4E7D7]/60 hidden md:inline">(Cash: ₹{cash} | Online: ₹{online})</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Filter Pill Controls & Search Bar */}
            <div className="bg-[#160E0A] border border-[#3B2417] p-4 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg">
              {/* Status & Payment Method Filter Buttons */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 select-none">
                  {(['ALL', 'PENDING', 'ACCEPTED', 'PAID', 'CANCELLED'] as const).map((st) => {
                    const count = st === 'ALL' ? bills.length : bills.filter((b) => b.status === st).length;
                    const isCurrent = billStatusFilter === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setBillStatusFilter(st)}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          isCurrent
                            ? st === 'PENDING'
                              ? 'bg-amber-500 text-[#0A0908] shadow-md font-bold'
                              : st === 'ACCEPTED'
                              ? 'bg-emerald-500 text-[#0A0908] shadow-md font-bold'
                              : st === 'PAID'
                              ? 'bg-sky-500 text-[#0A0908] shadow-md font-bold'
                              : st === 'CANCELLED'
                              ? 'bg-rose-500 text-[#0A0908] shadow-md font-bold'
                              : 'bg-[#B97845] text-[#0A0908] shadow-md font-bold'
                            : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#2B1B14]'
                        }`}
                      >
                        <span>{st === 'ALL' ? 'All Status' : st}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isCurrent ? 'bg-black/30 text-white' : 'bg-[#0A0908] text-[#B97845]'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Payment Method Quick Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 select-none">
                  <span className="text-[10px] font-mono uppercase text-[#F4E7D7]/60 mr-1">Payment:</span>
                  {(
                    [
                      { id: 'ALL', label: 'All Modes' },
                      { id: 'CASH', label: 'Cash Only' },
                      { id: 'ONLINE', label: 'Online UPI' },
                      { id: 'COMPLIMENTARY', label: 'Complimentary' },
                      { id: 'DISCOUNT', label: 'Discounted' },
                    ] as const
                  ).map((pm) => {
                    const isCurrent = billPaymentMethodFilter === pm.id;
                    return (
                      <button
                        key={pm.id}
                        onClick={() => setBillPaymentMethodFilter(pm.id)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all whitespace-nowrap ${
                          isCurrent
                            ? 'bg-[#C9945C] text-[#0A0908] shadow-sm font-bold'
                            : 'bg-[#0A0908] border border-[#3B2417] text-[#F4E7D7]/60 hover:text-[#FFF9F2]'
                        }`}
                      >
                        {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Bill Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#B97845] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={billSearchQuery}
                  onChange={(e) => setBillSearchQuery(e.target.value)}
                  placeholder="Search by Bill #, Staff, Guest, Table..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-xs text-[#FFF9F2] placeholder-[#F4E7D7]/40 focus:outline-none focus:border-[#B97845]"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-[#0A0908] border-b border-[#3B2417] text-[10px] font-mono uppercase text-[#B97845] tracking-wider">
                    <tr>
                      <th className="p-4">Bill #</th>
                      <th className="p-4">Date & Time (IST)</th>
                      <th className="p-4">Billed By / Staff</th>
                      <th className="p-4">Guest & Table</th>
                      <th className="p-4">Ordered Items</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Live Status</th>
                      <th className="p-4 text-right">Accept / Reject / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B2417]/50">
                    {(() => {
                      const todayStr = new Date().toISOString().split('T')[0];

                      const filteredBills = bills.filter((b) => {
                        // Status filter
                        if (billStatusFilter !== 'ALL' && b.status !== billStatusFilter) return false;

                        // Payment method filter
                        if (billPaymentMethodFilter !== 'ALL') {
                          if (billPaymentMethodFilter === 'DISCOUNT') {
                            if (!b.discount || b.discount <= 0) return false;
                          } else if (billPaymentMethodFilter === 'ONLINE') {
                            if (b.paymentMethod !== 'ONLINE' && b.paymentMethod !== 'PAY_AT_COUNTER') return false;
                          } else if (b.paymentMethod !== billPaymentMethodFilter) {
                            return false;
                          }
                        }

                        // Calendar / Date filtering
                        const bDateStr = b.date || (b.createdAt ? b.createdAt.slice(0, 10) : '');

                        if (billDatePreset === 'TODAY') {
                          if (bDateStr !== todayStr) return false;
                        } else if (billDatePreset === 'YESTERDAY') {
                          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                          if (bDateStr !== yesterday) return false;
                        } else if (billDatePreset === 'WEEK') {
                          const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
                          if (bDateStr < weekAgo || bDateStr > todayStr) return false;
                        } else if (billDatePreset === 'MONTH') {
                          const currentMonth = todayStr.slice(0, 7);
                          if (!bDateStr.startsWith(currentMonth)) return false;
                        } else if (billDatePreset === 'CUSTOM') {
                          if (billSelectedDate && bDateStr !== billSelectedDate) return false;
                          if (billStartDate && bDateStr < billStartDate) return false;
                          if (billEndDate && bDateStr > billEndDate) return false;
                        }

                        // Employee filter for Admin
                        if (isAdmin) {
                          if (selectedEmployeeFilter !== 'ALL') {
                            const target = selectedEmployeeFilter === 'ONLINE_CUSTOMER' ? 'online' : selectedEmployeeFilter.toLowerCase();
                            if (!(b.createdBy || '').toLowerCase().includes(target)) return false;
                          }
                        } else {
                          // Employee View mode filters
                          if (staffViewMode === 'MY_BILLS') {
                            const myName = (user?.name || '').toLowerCase();
                            const myUser = (user?.username || '').toLowerCase();
                            const creator = (b.createdBy || '').toLowerCase();
                            const matchesMe = creator.includes(myName) || creator.includes(myUser) || (user?.id && b.createdById === user.id);
                            if (!matchesMe) return false;
                          } else if (staffViewMode === 'ONLINE_ORDERS') {
                            const isOnline = (b.createdBy || '').toLowerCase().includes('online') || (b.createdBy || '').toLowerCase().includes('customer');
                            if (!isOnline) return false;
                          }
                        }

                        // Search Query
                        if (billSearchQuery.trim()) {
                          const q = billSearchQuery.toLowerCase();
                          const matchBill = b.billNumber.toLowerCase().includes(q);
                          const matchStaff = (b.createdBy || '').toLowerCase().includes(q);
                          const matchGuest = (b.customerName || '').toLowerCase().includes(q);
                          const matchPhone = (b.customerPhone || '').toLowerCase().includes(q);
                          const matchTable = (b.tableNo || '').toLowerCase().includes(q);
                          const matchItems = b.items.some((it) => it.productName.toLowerCase().includes(q));
                          if (!matchBill && !matchStaff && !matchGuest && !matchPhone && !matchTable && !matchItems) return false;
                        }

                        return true;
                      });

                      if (filteredBills.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} className="p-12 text-center text-[#F4E7D7]/50 font-mono text-xs">
                              <Utensils className="w-8 h-8 text-[#B97845]/40 mx-auto mb-3" />
                              No orders found matching the selected filter criteria. New customer or POS orders will appear here automatically.
                            </td>
                          </tr>
                        );
                      }

                      return filteredBills.map((b) => {
                        const isPending = b.status === 'PENDING';
                        const isAccepted = b.status === 'ACCEPTED';
                        const isPaid = b.status === 'PAID';
                        const isCancelled = b.status === 'CANCELLED';

                        return (
                          <tr
                            key={b.id}
                            className={`transition-colors ${
                              isPending
                                ? 'bg-amber-950/20 hover:bg-amber-950/30 border-l-4 border-l-amber-500'
                                : isAccepted
                                ? 'bg-emerald-950/15 hover:bg-emerald-950/25 border-l-4 border-l-emerald-500'
                                : isPaid
                                ? 'hover:bg-[#21150F]/40'
                                : 'bg-rose-950/10 hover:bg-rose-950/20 opacity-70'
                            }`}
                          >
                            {/* Bill Number */}
                            <td className="p-4 font-mono font-bold text-[#FFF9F2] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{b.billNumber}</span>
                                {isPending && (
                                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                )}
                              </div>
                            </td>

                            {/* IST Time */}
                            <td className="p-4 font-mono text-[#F4E7D7]/80 whitespace-nowrap">
                              <span className="font-bold text-[#FFF9F2] block">
                                {b.date.includes('-')
                                  ? new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : b.date}
                              </span>
                              <span className="text-[10px] text-[#C9945C] font-semibold">{b.time}</span>
                            </td>

                            {/* Billed By / Staff Member */}
                            <td className="p-4 whitespace-nowrap">
                              {b.createdBy?.toLowerCase().includes('online') || b.createdBy?.toLowerCase().includes('customer') ? (
                                <button
                                  onClick={() => isAdmin && setSelectedEmployeeFilter('ONLINE_CUSTOMER')}
                                  className="px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1 hover:border-indigo-400 transition-colors"
                                  title="Online Customer Order"
                                >
                                  <Globe className="w-3 h-3 text-indigo-400" />
                                  <span>Online Customer</span>
                                </button>
                              ) : b.createdBy?.toLowerCase().includes('rutik') || b.createdByRole === 'ADMIN' ? (
                                <button
                                  onClick={() => isAdmin && setSelectedEmployeeFilter(b.createdBy)}
                                  className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 hover:border-amber-400 transition-colors"
                                  title="Admin Billed Order"
                                >
                                  <Crown className="w-3 h-3 text-amber-400" />
                                  <span>{b.createdBy || 'Admin'}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => isAdmin && setSelectedEmployeeFilter(b.createdBy)}
                                  className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 hover:border-emerald-400 transition-colors"
                                  title="Staff Billed Order"
                                >
                                  <UserCheck className="w-3 h-3 text-emerald-400" />
                                  <span>{b.createdBy || 'Staff'}</span>
                                </button>
                              )}
                            </td>

                            {/* Guest & Table */}
                            <td className="p-4">
                              <span className="font-bold text-[#FFF9F2] block truncate max-w-[150px]">
                                {b.customerName || 'Walk-in Guest'}
                              </span>
                              <span className="text-[10px] font-mono text-[#C9945C] block">
                                {b.tableNo || 'Counter'} {b.customerPhone ? `• ${b.customerPhone}` : ''}
                              </span>
                            </td>

                            {/* Items Purchased */}
                            <td className="p-4 text-xs text-[#F4E7D7]/80 max-w-xs">
                              <div className="space-y-0.5">
                                {b.items.map((it, idx) => (
                                  <div key={idx} className="truncate">
                                    <span className="font-bold text-[#FFF9F2]">{it.quantity}x</span> {it.productName}
                                    {it.selectedAddOns && it.selectedAddOns.length > 0 && (
                                      <span className="text-[10px] text-[#C9945C] ml-1">
                                        (+{it.selectedAddOns.map((a) => a.name).join(', ')})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Payment Method */}
                            <td className="p-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-[#21150F] border border-[#3B2417] text-[10px] font-mono font-bold text-[#FFF9F2] block w-fit">
                                {b.paymentMethod === 'PAY_AT_COUNTER' ? 'PAY AT COUNTER' : b.paymentMethod}
                              </span>
                            </td>

                            {/* Total Amount */}
                            <td className="p-4 font-mono font-bold text-sm text-[#C9945C] whitespace-nowrap">
                              ₹{b.total}
                            </td>

                            {/* Status Badge */}
                            <td className="p-4 whitespace-nowrap">
                              {isPending && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500 text-amber-300 text-[10px] font-mono font-extrabold uppercase flex items-center gap-1.5 w-fit">
                                  <AlertCircle className="w-3 h-3 text-amber-400 animate-spin" />
                                  PENDING
                                </span>
                              )}
                              {isAccepted && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[10px] font-mono font-extrabold uppercase flex items-center gap-1.5 w-fit">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ACCEPTED / PREP
                                </span>
                              )}
                              {isPaid && (
                                <span className="px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-500 text-sky-300 text-[10px] font-mono font-extrabold uppercase flex items-center gap-1.5 w-fit">
                                  <Check className="w-3 h-3 text-sky-400" />
                                  PAID & SERVED
                                </span>
                              )}
                              {isCancelled && (
                                <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 text-[10px] font-mono font-extrabold uppercase flex items-center gap-1.5 w-fit">
                                  <XCircle className="w-3 h-3 text-rose-400" />
                                  REJECTED
                                </span>
                              )}
                            </td>

                            {/* Actions Column (ACCEPT / REJECT / MARK PAID / VIEW BILL / DELETE) */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* ACCEPT BUTTON with Payment Method Selection */}
                                {isPending && (
                                  <button
                                    onClick={() => openOrderActionDialog(b, 'ACCEPTED')}
                                    disabled={isUpdatingStatus}
                                    className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[10px] font-extrabold uppercase transition-all shadow-md flex items-center gap-1 hover:scale-105 active:scale-95"
                                    title="Accept order and choose payment method"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>ACCEPT</span>
                                  </button>
                                )}

                                {/* REJECT BUTTON */}
                                {isPending && (
                                  <button
                                    onClick={() => openOrderActionDialog(b, 'CANCELLED')}
                                    disabled={isUpdatingStatus}
                                    className="px-2.5 py-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-300 font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-1"
                                    title="Reject and decline order"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    <span>REJECT</span>
                                  </button>
                                )}

                                {/* MARK PAID with Payment Method Selection */}
                                {isAccepted && (
                                  <button
                                    onClick={() => openOrderActionDialog(b, 'PAID')}
                                    disabled={isUpdatingStatus}
                                    className="px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-mono text-[10px] font-extrabold uppercase transition-all shadow-md flex items-center gap-1 hover:scale-105 active:scale-95"
                                    title="Confirm payment method and mark order paid"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>MARK PAID</span>
                                  </button>
                                )}

                                {/* REJECT/CANCEL for Accepted order if needed */}
                                {isAccepted && (
                                  <button
                                    onClick={() => openOrderActionDialog(b, 'CANCELLED')}
                                    disabled={isUpdatingStatus}
                                    className="px-2 py-1.5 rounded-full bg-[#21150F] hover:bg-rose-950 text-rose-400 border border-rose-900/50 font-mono text-[10px] font-bold uppercase transition-all"
                                    title="Cancel order"
                                  >
                                    <span>CANCEL</span>
                                  </button>
                                )}

                                {/* VIEW BILL MODAL */}
                                <button
                                  onClick={() => {
                                    setActiveBill(b);
                                    setIsBillModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-full bg-[#21150F] hover:bg-[#B97845] hover:text-[#0A0908] text-[#FFF9F2] font-mono text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1.5 border border-[#3B2417]"
                                  title="View and print invoice receipt"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>VIEW BILL</span>
                                </button>

                                {/* ADMIN DELETE */}
                                {isAdmin && (
                                  <button
                                    onClick={() => setDeleteTarget({ type: 'bill', id: b.id, name: b.billNumber })}
                                    className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 transition-colors inline-flex items-center"
                                    title="Delete invoice record permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 5: OFFERS & PROMOTIONS ================= */}
        {isAdmin && activeTab === 'offers' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                  DEALS & BANNER PROMOTIONS
                </h3>
                <p className="text-xs text-[#F4E7D7]/70 font-body">
                  Configure real-time discounts, countdown timers, and special announcements displayed to customers.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingOffer({
                      title: '',
                      subtitle: '',
                      badgeText: "TODAY'S SPECIAL",
                      discountPercent: 10,
                      applicableCategories: [],
                      isActive: true,
                      startDate: new Date().toISOString(),
                      endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                      bannerImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=80',
                    });
                    setIsOfferModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#B97845] text-[#0A0908] font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#C9945C] transition-all flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>CREATE NEW OFFER</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((off) => (
                <div
                  key={off.id}
                  className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#B97845]/20 text-[#C9945C] border border-[#B97845]/40">
                        {off.badgeText}
                      </span>
                      {isAdmin ? (
                        <button
                          onClick={() => handleToggleOffer(off)}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-colors ${
                            off.isActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-rose-950/60'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-emerald-950/60'
                          }`}
                          title="Click to toggle offer active/paused (Admin only)"
                        >
                          {off.isActive ? '● ACTIVE LIVE' : 'PAUSED'}
                        </button>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            off.isActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {off.isActive ? '● ACTIVE LIVE' : 'PAUSED'}
                        </span>
                      )}
                    </div>

                    <h4 className="font-display text-2xl font-bold text-[#FFF9F2]">
                      {off.title}
                    </h4>
                    <p className="text-xs text-[#F4E7D7]/80 font-body">{off.subtitle}</p>
                  </div>

                  <div className="pt-3 border-t border-[#3B2417]/50 flex items-center justify-between text-xs font-mono">
                    <div className="text-[#C9945C]">
                      <span>Flat {off.discountPercent}% Discount</span>
                      <span className="block text-[10px] text-[#F4E7D7]/60">Valid until: {new Date(off.endDate).toLocaleDateString()}</span>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingOffer(off);
                            setIsOfferModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] transition-colors"
                          title="Edit promotion offer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'offer', id: off.id, name: off.title })}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 transition-colors"
                          title="Delete promotion offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 6: STAFF & EMPLOYEES ================= */}
        {activeTab === 'staff' && isAdmin && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                  STAFF ACCOUNTS & RBAC
                </h3>
                <p className="text-xs text-[#F4E7D7]/70 font-body">
                  Create dedicated logins for baristas, cashiers, and store managers.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingEmployee({
                    name: '',
                    username: '',
                    role: 'EMPLOYEE',
                    phone: '',
                  });
                  setEmployeePassword('');
                  setIsEmployeeModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-full bg-[#B97845] text-[#0A0908] font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#C9945C] transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>ADD STAFF MEMBER</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((emp) => {
                const empBills = bills.filter((b) => (b.createdBy || '').toLowerCase().includes(emp.name.toLowerCase()) || (b.createdBy || '').toLowerCase().includes(emp.username.toLowerCase()));
                const empRevenue = empBills.reduce((acc, b) => acc + (b.total || 0), 0);

                return (
                  <div
                    key={emp.id}
                    className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-[#B97845]/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          emp.role === 'ADMIN'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-[#B97845]/20 text-[#C9945C] border border-[#B97845]/40'
                        }`}>
                          {emp.role}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setEmployeePassword('');
                              setIsEmployeeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] transition-colors"
                            title="Edit staff account"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && emp.username !== 'rutik_mane' && (
                            <button
                              onClick={() => setDeleteTarget({ type: 'staff', id: emp.id, name: emp.name })}
                              className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 transition-colors"
                              title="Delete staff account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display text-xl font-bold text-[#FFF9F2]">{emp.name}</h4>
                        <p className="text-xs font-mono text-[#F4E7D7]/70">Username: @{emp.username}</p>
                        {emp.phone && (
                          <p className="text-[11px] font-mono text-[#C9945C]">Phone: {emp.phone}</p>
                        )}
                      </div>

                      {/* Performance Snapshot */}
                      <div className="bg-[#0A0908] p-3 rounded-2xl border border-[#3B2417] grid grid-cols-2 gap-2 text-center font-mono">
                        <div>
                          <span className="text-[10px] text-[#F4E7D7]/60 block uppercase">Bills Punched</span>
                          <span className="font-bold text-[#FFF9F2] text-sm">{empBills.length}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#B97845] block uppercase font-bold">Total Sales</span>
                          <span className="font-bold text-emerald-400 text-sm">₹{empRevenue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#3B2417]/50 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#F4E7D7]/50">
                        Created: {new Date(emp.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedEmployeeFilter(emp.name);
                          setActiveTab('bills');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#21150F] hover:bg-[#B97845] hover:text-[#0A0908] text-[#C9945C] font-mono text-[10px] font-bold uppercase transition-colors border border-[#3B2417] flex items-center gap-1"
                        title="View all bills created by this employee"
                      >
                        <span>View Bills ({empBills.length})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= TAB 7: NOTIFICATIONS & WAITLIST ================= */}
        {isAdmin && activeTab === 'waitlist' && (
          <div className="space-y-6">
            
            <div>
              <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                CUSTOMER NOTIFICATION WAITLIST
              </h3>
              <p className="text-xs text-[#F4E7D7]/70 font-body">
                Guests who requested email alerts when sold-out items are brewed fresh.
              </p>
            </div>

            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs font-body">
                <thead className="bg-[#0A0908] border-b border-[#3B2417] text-[10px] font-mono uppercase text-[#B97845] tracking-wider">
                  <tr>
                    <th className="p-4">Customer Email</th>
                    <th className="p-4">Requested Item</th>
                    <th className="p-4">Date Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3B2417]/50">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-[#21150F]/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#FFF9F2]">{n.email}</td>
                      <td className="p-4 font-semibold text-[#C9945C]">{n.productName}</td>
                      <td className="p-4 font-mono text-[#F4E7D7]/70">{n.date || new Date().toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 1: MAIN DASHBOARD (SALES GRAPH, PAYMENT FILTERS & LIVE REPORT) ================= */}
        {isAdmin && activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Dashboard Header with Calendar Date & Timeframe Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FFF9F2] uppercase tracking-wide">
                    SALES OVERVIEW & FINANCIAL REPORTS
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                </div>
                <p className="text-xs text-[#F4E7D7]/70 font-body mt-1">
                  Analyze daily, weekly, or specific calendar date sales revenue, payment splits, and live customer orders.
                </p>
              </div>

              {/* Timeframe selector & actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="bg-[#160E0A] border border-[#3B2417] p-1 rounded-2xl flex items-center gap-1 shadow-inner overflow-x-auto">
                  {(
                    [
                      { id: 'TODAY', label: 'Today' },
                      { id: 'YESTERDAY', label: 'Yesterday' },
                      { id: 'WEEK', label: '7 Days' },
                      { id: 'MONTH', label: 'This Month' },
                      { id: 'SPECIFIC_DATE', label: '📅 Pick Date' },
                      { id: 'ALL', label: 'All Time' },
                    ] as const
                  ).map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => {
                        setDashboardTimeframe(tf.id);
                        if (tf.id === 'TODAY') {
                          setDashboardSelectedDate(new Date().toISOString().split('T')[0]);
                        } else if (tf.id === 'YESTERDAY') {
                          setDashboardSelectedDate(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap ${
                        dashboardTimeframe === tf.id
                          ? 'bg-[#B97845] text-[#0A0908] shadow-md font-extrabold'
                          : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2] hover:bg-[#21150F]'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleExportDashboardReportCSV(
                    dashboardFilteredBills,
                    dashboardPaymentFilter === 'ALL'
                      ? 'All_Sales'
                      : dashboardPaymentFilter === 'CASH'
                      ? 'Cash_Sales'
                      : dashboardPaymentFilter === 'ONLINE'
                      ? 'Online_Sales'
                      : dashboardPaymentFilter === 'COMPLIMENTARY'
                      ? 'Complimentary_Orders'
                      : 'Discounted_Orders'
                  )}
                  className="px-4 py-2 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] border border-[#3B2417] text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md"
                  title="Export Current Filtered Report as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#B97845]" />
                  <span>Export Report (CSV)</span>
                </button>

                <button
                  onClick={() => setActiveTab('pos')}
                  className="px-4 py-2 rounded-xl bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>New Sale (POS)</span>
                </button>
              </div>
            </div>

            {/* ================= CALENDAR SPECIFIC DATE PICKER & DAY NAVIGATOR ================= */}
            <div className="bg-gradient-to-r from-[#160E0A] via-[#21150F] to-[#160E0A] border border-[#B97845]/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#B97845]/20 border border-[#B97845]/50 flex items-center justify-center text-[#B97845] flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold">
                      CALENDAR DATE FILTER:
                    </span>
                    <span className="text-xs font-mono font-extrabold text-[#FFF9F2] bg-[#0A0908] px-2.5 py-0.5 rounded-lg border border-[#3B2417]">
                      {dashboardTimeframe === 'TODAY'
                        ? `Today (${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })})`
                        : dashboardTimeframe === 'YESTERDAY'
                        ? `Yesterday (${new Date(Date.now() - 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })})`
                        : dashboardTimeframe === 'WEEK'
                        ? 'Last 7 Days Rolling'
                        : dashboardTimeframe === 'MONTH'
                        ? 'This Current Month'
                        : dashboardTimeframe === 'SPECIFIC_DATE'
                        ? `Specific Date: ${dashboardSelectedDate}`
                        : 'All Recorded Time'}
                    </span>
                  </div>
                  <div className="text-xs text-[#F4E7D7]/80 font-mono mt-0.5 flex items-center gap-2">
                    <span><strong>{dashboardBreakdown.scopeBillsCount}</strong> orders found</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">₹{dashboardBreakdown.totalRevenue} Total Sales</span>
                    <span>•</span>
                    <span className="text-[#C9945C]">Cash: ₹{dashboardBreakdown.cashTotal} | Online: ₹{dashboardBreakdown.onlineTotal}</span>
                  </div>
                </div>
              </div>

              {/* Date Input and Day Navigator Controls */}
              <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                {/* Step to previous day */}
                <button
                  type="button"
                  onClick={() => handleStepDashboardDate(-1)}
                  className="px-3 py-2 rounded-xl bg-[#0A0908] hover:bg-[#21150F] text-[#F4E7D7] border border-[#3B2417] hover:border-[#B97845] transition-all flex items-center gap-1"
                  title="View Previous Day Sales"
                >
                  <span>◀ Prev Day</span>
                </button>

                {/* Direct Calendar Date Input */}
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dashboardSelectedDate}
                    onChange={(e) => {
                      setDashboardSelectedDate(e.target.value);
                      setDashboardTimeframe('SPECIFIC_DATE');
                    }}
                    className="bg-[#0A0908] border border-[#B97845] text-[#FFF9F2] text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#B97845] cursor-pointer"
                  />
                </div>

                {/* Step to next day */}
                <button
                  type="button"
                  onClick={() => handleStepDashboardDate(1)}
                  className="px-3 py-2 rounded-xl bg-[#0A0908] hover:bg-[#21150F] text-[#F4E7D7] border border-[#3B2417] hover:border-[#B97845] transition-all flex items-center gap-1"
                  title="View Next Day Sales"
                >
                  <span>Next Day ▶</span>
                </button>

                {/* Jump to Today button */}
                <button
                  type="button"
                  onClick={handleSelectDashboardToday}
                  className="px-3 py-2 rounded-xl bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] font-bold transition-all shadow-md"
                  title="Jump to Today's Live Sales"
                >
                  Today
                </button>
              </div>
            </div>

            {/* ================= PAYMENT METHOD & DISCOUNT FILTER BAR ================= */}
            <div className="bg-[#160E0A] border-2 border-[#3B2417] p-4 sm:p-5 rounded-3xl space-y-3.5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#3B2417]/50">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#B97845]">
                  <Filter className="w-4 h-4" />
                  <span>FILTER DASHBOARD & REPORTS BY PAYMENT METHOD / TYPE:</span>
                </div>
                {dashboardPaymentFilter !== 'ALL' && (
                  <button
                    onClick={() => setDashboardPaymentFilter('ALL')}
                    className="text-[11px] font-mono text-[#C9945C] hover:text-[#FFF9F2] underline cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset Filter (Show All Sales)</span>
                  </button>
                )}
              </div>

              {/* Interactive Filter Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 select-none">
                {/* Option 1: ALL */}
                <button
                  onClick={() => setDashboardPaymentFilter('ALL')}
                  className={`p-3 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between ${
                    dashboardPaymentFilter === 'ALL'
                      ? 'bg-gradient-to-br from-[#B97845] to-[#8C532B] text-[#0A0908] border-[#FFF9F2]/30 shadow-lg scale-[1.02]'
                      : 'bg-[#0A0908] text-[#FFF9F2] border-[#3B2417] hover:border-[#B97845]/60 hover:bg-[#21150F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider">All Sales</span>
                    <Sparkles className={`w-3.5 h-3.5 ${dashboardPaymentFilter === 'ALL' ? 'text-[#0A0908]' : 'text-[#B97845]'}`} />
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-lg sm:text-xl font-extrabold block">
                      ₹{dashboardBreakdown.totalRevenue}
                    </span>
                    <span className={`text-[10px] font-mono ${dashboardPaymentFilter === 'ALL' ? 'text-[#0A0908]/80' : 'text-[#F4E7D7]/60'}`}>
                      {dashboardBreakdown.scopeBillsCount} Orders
                    </span>
                  </div>
                </button>

                {/* Option 2: CASH */}
                <button
                  onClick={() => setDashboardPaymentFilter('CASH')}
                  className={`p-3 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between ${
                    dashboardPaymentFilter === 'CASH'
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-400 shadow-lg shadow-emerald-900/30 scale-[1.02]'
                      : 'bg-[#0A0908] text-[#FFF9F2] border-[#3B2417] hover:border-emerald-500/60 hover:bg-[#21150F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Cash Payments</span>
                    <Banknote className={`w-3.5 h-3.5 ${dashboardPaymentFilter === 'CASH' ? 'text-white' : 'text-emerald-400'}`} />
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-lg sm:text-xl font-extrabold block">
                      ₹{dashboardBreakdown.cashTotal}
                    </span>
                    <span className={`text-[10px] font-mono ${dashboardPaymentFilter === 'CASH' ? 'text-white/80' : 'text-[#F4E7D7]/60'}`}>
                      {dashboardBreakdown.cashBillsCount} Cash Bills
                    </span>
                  </div>
                </button>

                {/* Option 3: ONLINE / UPI */}
                <button
                  onClick={() => setDashboardPaymentFilter('ONLINE')}
                  className={`p-3 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between ${
                    dashboardPaymentFilter === 'ONLINE'
                      ? 'bg-gradient-to-br from-sky-600 to-blue-800 text-white border-sky-400 shadow-lg shadow-sky-900/30 scale-[1.02]'
                      : 'bg-[#0A0908] text-[#FFF9F2] border-[#3B2417] hover:border-sky-500/60 hover:bg-[#21150F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Online UPI / Card</span>
                    <CreditCard className={`w-3.5 h-3.5 ${dashboardPaymentFilter === 'ONLINE' ? 'text-white' : 'text-sky-400'}`} />
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-lg sm:text-xl font-extrabold block">
                      ₹{dashboardBreakdown.onlineTotal}
                    </span>
                    <span className={`text-[10px] font-mono ${dashboardPaymentFilter === 'ONLINE' ? 'text-white/80' : 'text-[#F4E7D7]/60'}`}>
                      {dashboardBreakdown.onlineBillsCount} Online Bills
                    </span>
                  </div>
                </button>

                {/* Option 4: COMPLIMENTARY */}
                <button
                  onClick={() => setDashboardPaymentFilter('COMPLIMENTARY')}
                  className={`p-3 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between ${
                    dashboardPaymentFilter === 'COMPLIMENTARY'
                      ? 'bg-gradient-to-br from-purple-600 to-purple-900 text-white border-purple-400 shadow-lg shadow-purple-900/30 scale-[1.02]'
                      : 'bg-[#0A0908] text-[#FFF9F2] border-[#3B2417] hover:border-purple-500/60 hover:bg-[#21150F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Complimentary</span>
                    <Gift className={`w-3.5 h-3.5 ${dashboardPaymentFilter === 'COMPLIMENTARY' ? 'text-white' : 'text-purple-400'}`} />
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-lg sm:text-xl font-extrabold block">
                      ₹{dashboardBreakdown.compTotalWaived} <span className="text-xs font-normal opacity-80">waived</span>
                    </span>
                    <span className={`text-[10px] font-mono ${dashboardPaymentFilter === 'COMPLIMENTARY' ? 'text-white/80' : 'text-[#F4E7D7]/60'}`}>
                      {dashboardBreakdown.compBillsCount} Free Bills
                    </span>
                  </div>
                </button>

                {/* Option 5: DISCOUNT */}
                <button
                  onClick={() => setDashboardPaymentFilter('DISCOUNT')}
                  className={`p-3 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between ${
                    dashboardPaymentFilter === 'DISCOUNT'
                      ? 'bg-gradient-to-br from-amber-600 to-orange-800 text-white border-amber-400 shadow-lg shadow-amber-900/30 scale-[1.02]'
                      : 'bg-[#0A0908] text-[#FFF9F2] border-[#3B2417] hover:border-amber-500/60 hover:bg-[#21150F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Discounted</span>
                    <Percent className={`w-3.5 h-3.5 ${dashboardPaymentFilter === 'DISCOUNT' ? 'text-white' : 'text-amber-400'}`} />
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-lg sm:text-xl font-extrabold block">
                      -₹{dashboardBreakdown.totalDiscountGiven} <span className="text-xs font-normal opacity-80">off</span>
                    </span>
                    <span className={`text-[10px] font-mono ${dashboardPaymentFilter === 'DISCOUNT' ? 'text-white/80' : 'text-[#F4E7D7]/60'}`}>
                      {dashboardBreakdown.discountBillsCount} Discount Bills
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* ================= DYNAMIC SUMMARY KPI CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Dynamic Card 1: Revenue / Value */}
              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2 relative overflow-hidden group shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                    {dashboardPaymentFilter === 'ALL'
                      ? 'TOTAL REVENUE'
                      : dashboardPaymentFilter === 'CASH'
                      ? 'CASH SALES VOLUME'
                      : dashboardPaymentFilter === 'ONLINE'
                      ? 'ONLINE UPI REVENUE'
                      : dashboardPaymentFilter === 'COMPLIMENTARY'
                      ? 'COMPLIMENTARY VALUE WAIVED'
                      : 'TOTAL DISCOUNTS GRANTED'}
                  </span>
                  <DollarSign className="w-4 h-4 text-[#B97845]" />
                </div>
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFF9F2] block">
                  ₹{dashboardPaymentFilter === 'ALL'
                    ? dashboardBreakdown.totalRevenue
                    : dashboardPaymentFilter === 'CASH'
                    ? dashboardBreakdown.cashTotal
                    : dashboardPaymentFilter === 'ONLINE'
                    ? dashboardBreakdown.onlineTotal
                    : dashboardPaymentFilter === 'COMPLIMENTARY'
                    ? dashboardBreakdown.compTotalWaived
                    : dashboardBreakdown.totalDiscountGiven}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 block">
                  {dashboardPaymentFilter === 'ALL'
                    ? `↑ In ${dashboardTimeframe === 'TODAY' ? 'today' : dashboardTimeframe === 'WEEK' ? 'last 7 days' : dashboardTimeframe === 'MONTH' ? 'this month' : 'all-time'}`
                    : dashboardPaymentFilter === 'COMPLIMENTARY'
                    ? `Waived across ${dashboardBreakdown.compBillsCount} complimentary bills`
                    : dashboardPaymentFilter === 'DISCOUNT'
                    ? `Applied across ${dashboardBreakdown.discountBillsCount} discounted orders`
                    : `Represents ${dashboardBreakdown.totalRevenue > 0 ? Math.round(((dashboardPaymentFilter === 'CASH' ? dashboardBreakdown.cashTotal : dashboardBreakdown.onlineTotal) / dashboardBreakdown.totalRevenue) * 100) : 0}% of filtered revenue`}
                </span>
              </div>

              {/* Dynamic Card 2: Order / Invoice Count */}
              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2 relative overflow-hidden group shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                    {dashboardPaymentFilter === 'ALL' ? 'TOTAL INVOICES' : `${dashboardPaymentFilter} INVOICES`}
                  </span>
                  <FileText className="w-4 h-4 text-[#B97845]" />
                </div>
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFF9F2] block">
                  {dashboardPaymentFilter === 'ALL'
                    ? dashboardBreakdown.scopeBillsCount
                    : dashboardPaymentFilter === 'CASH'
                    ? dashboardBreakdown.cashBillsCount
                    : dashboardPaymentFilter === 'ONLINE'
                    ? dashboardBreakdown.onlineBillsCount
                    : dashboardPaymentFilter === 'COMPLIMENTARY'
                    ? dashboardBreakdown.compBillsCount
                    : dashboardBreakdown.discountBillsCount}
                </span>
                <span className="text-[11px] font-mono text-[#F4E7D7]/70 block">
                  {dashboardBreakdown.scopeBillsCount > 0 && dashboardPaymentFilter !== 'ALL'
                    ? `${Math.round(((dashboardFilteredBills.length) / dashboardBreakdown.scopeBillsCount) * 100)}% of all orders`
                    : 'Total verified orders recorded'}
                </span>
              </div>

              {/* Dynamic Card 3: Average Order Ticket */}
              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2 relative overflow-hidden group shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                    {dashboardPaymentFilter === 'DISCOUNT' ? 'AVG DISCOUNT / BILL' : 'AVERAGE ORDER VALUE'}
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#B97845]" />
                </div>
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFF9F2] block">
                  ₹{(() => {
                    const count = dashboardFilteredBills.length;
                    if (count === 0) return 0;
                    if (dashboardPaymentFilter === 'DISCOUNT') {
                      return Math.round(dashboardBreakdown.totalDiscountGiven / Math.max(1, dashboardBreakdown.discountBillsCount));
                    }
                    if (dashboardPaymentFilter === 'COMPLIMENTARY') {
                      return Math.round(dashboardBreakdown.compTotalWaived / Math.max(1, dashboardBreakdown.compBillsCount));
                    }
                    const total = dashboardFilteredBills.reduce((sum, b) => sum + (b.total || 0), 0);
                    return Math.round(total / count);
                  })()}
                </span>
                <span className="text-[11px] font-mono text-[#C9945C] block">
                  {dashboardPaymentFilter === 'DISCOUNT'
                    ? 'Average discount per promo bill'
                    : 'Average transaction spend per guest'}
                </span>
              </div>

              {/* Dynamic Card 4: Store Inventory & Menu Count */}
              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2 relative overflow-hidden group shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                    ACTIVE MENU ITEMS
                  </span>
                  <Coffee className="w-4 h-4 text-[#B97845]" />
                </div>
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFF9F2] block">
                  {products.length}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 block">
                  {products.filter((p) => p.availability).length} in-stock • {inventory.length} raw ingredients
                </span>
              </div>
            </div>

            {/* ================= PAYMENT METHOD REVENUE DISTRIBUTION PROGRESS BAR ================= */}
            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#B97845]" />
                  <h4 className="font-display text-base font-bold text-[#FFF9F2] uppercase">
                    FINANCIAL PAYMENT DISTRIBUTION RATIO
                  </h4>
                </div>
                <span className="text-xs font-mono text-[#F4E7D7]/60">
                  Total Tracked: ₹{dashboardBreakdown.totalRevenue} ({dashboardBreakdown.scopeBillsCount} Orders)
                </span>
              </div>

              {/* Progress split bar */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-[#0A0908] rounded-full overflow-hidden flex border border-[#3B2417]">
                  {/* Cash portion */}
                  <div
                    style={{
                      width: `${dashboardBreakdown.totalRevenue > 0 ? (dashboardBreakdown.cashTotal / dashboardBreakdown.totalRevenue) * 100 : 0}%`,
                    }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Cash: ₹${dashboardBreakdown.cashTotal}`}
                  />
                  {/* Online portion */}
                  <div
                    style={{
                      width: `${dashboardBreakdown.totalRevenue > 0 ? (dashboardBreakdown.onlineTotal / dashboardBreakdown.totalRevenue) * 100 : 0}%`,
                    }}
                    className="bg-sky-500 h-full transition-all duration-500"
                    title={`Online: ₹${dashboardBreakdown.onlineTotal}`}
                  />
                  {/* Complimentary portion */}
                  <div
                    style={{
                      width: `${dashboardBreakdown.totalRevenue > 0 ? (dashboardBreakdown.compTotalWaived / dashboardBreakdown.totalRevenue) * 100 : 0}%`,
                    }}
                    className="bg-purple-500 h-full transition-all duration-500"
                    title={`Complimentary: ₹${dashboardBreakdown.compTotalWaived}`}
                  />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-1">
                  <button
                    onClick={() => setDashboardPaymentFilter('CASH')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[#F4E7D7]/80">Cash:</span>
                    <strong className="text-emerald-400">
                      ₹{dashboardBreakdown.cashTotal} ({dashboardBreakdown.totalRevenue > 0 ? Math.round((dashboardBreakdown.cashTotal / dashboardBreakdown.totalRevenue) * 100) : 0}%)
                    </strong>
                  </button>

                  <button
                    onClick={() => setDashboardPaymentFilter('ONLINE')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="w-3 h-3 rounded-full bg-sky-500" />
                    <span className="text-[#F4E7D7]/80">Online UPI:</span>
                    <strong className="text-sky-400">
                      ₹{dashboardBreakdown.onlineTotal} ({dashboardBreakdown.totalRevenue > 0 ? Math.round((dashboardBreakdown.onlineTotal / dashboardBreakdown.totalRevenue) * 100) : 0}%)
                    </strong>
                  </button>

                  <button
                    onClick={() => setDashboardPaymentFilter('COMPLIMENTARY')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-[#F4E7D7]/80">Complimentary:</span>
                    <strong className="text-purple-400">
                      ₹{dashboardBreakdown.compTotalWaived} ({dashboardBreakdown.compBillsCount} bills)
                    </strong>
                  </button>

                  <button
                    onClick={() => setDashboardPaymentFilter('DISCOUNT')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[#F4E7D7]/80">Discounts Applied:</span>
                    <strong className="text-amber-400">
                      -₹{dashboardBreakdown.totalDiscountGiven} ({dashboardBreakdown.discountBillsCount} bills)
                    </strong>
                  </button>
                </div>
              </div>
            </div>

            {/* ================= MOST SOLD PRODUCT & SALES CHARTS ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Star #1 Most Sold Product Showcase */}
              <div className="lg:col-span-1 bg-gradient-to-b from-[#21150F] to-[#160E0A] border-2 border-[#B97845]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#B97845]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#B97845] text-[#0A0908] text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Award className="w-3.5 h-3.5" />
                      MOST SOLD PRODUCT
                    </span>
                  </div>

                  {analytics?.topBrew && analytics.topBrew.count > 0 ? (
                    <div className="space-y-4 pt-2">
                      <div className="w-full h-44 rounded-2xl overflow-hidden border border-[#3B2417] shadow-inner relative group bg-[#0A0908]">
                        <img
                          src={analytics.topBrew.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                          alt={analytics.topBrew.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                          <span className="text-xs font-mono font-bold text-amber-300">#1 Top Selling Master Brew</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                          {analytics.topBrew.name}
                        </h4>
                        <p className="text-xs text-[#F4E7D7]/70 mt-1 font-body">
                          Customer favourite with the highest order volume and revenue generation.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#3B2417]">
                        <div className="bg-[#0A0908] p-3 rounded-xl border border-[#3B2417]">
                          <span className="text-[10px] font-mono text-[#B97845] uppercase block font-bold">Total Sold</span>
                          <span className="font-display text-2xl font-bold text-[#FFF9F2]">{analytics.topBrew.count} <span className="text-xs font-mono font-normal text-[#F4E7D7]/60">units</span></span>
                        </div>
                        <div className="bg-[#0A0908] p-3 rounded-xl border border-[#3B2417]">
                          <span className="text-[10px] font-mono text-[#B97845] uppercase block font-bold">Revenue</span>
                          <span className="font-display text-2xl font-bold text-emerald-400">₹{analytics.topBrew.revenue}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs font-mono text-[#F4E7D7]/50 border border-dashed border-[#3B2417] rounded-2xl">
                      <Coffee className="w-8 h-8 text-[#B97845]/40 mx-auto mb-2" />
                      No sales recorded yet. Complete orders via POS terminal to start tracking the top sold product!
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Sales Graph (Recharts) */}
              <div className="lg:col-span-2 bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#B97845]" />
                      <h4 className="font-display text-xl font-bold text-[#FFF9F2] uppercase">
                        GRAPH OF 7-DAY SALES
                      </h4>
                    </div>
                    <p className="text-xs text-[#F4E7D7]/70 font-body mt-0.5">
                      Daily revenue trajectory for the last 7 business days
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">7-Day Total</span>
                    <span className="font-display text-xl font-bold text-[#FFF9F2]">
                      ₹{analytics?.weeklySales ? analytics.weeklySales.reduce((sum, item) => sum + (item.sales || 0), 0) : 0}
                    </span>
                  </div>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics?.weeklySales || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B97845" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#B97845" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3B2417" opacity={0.6} />
                      <XAxis
                        dataKey="day"
                        stroke="#F4E7D7"
                        opacity={0.6}
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#F4E7D7"
                        opacity={0.6}
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#160E0A',
                          border: '1px solid #B97845',
                          borderRadius: '12px',
                          color: '#FFF9F2',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                        formatter={(value: any) => [`₹${value}`, 'Sales Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#B97845"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#salesGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Hourly Sales Graph & Top Products Velocity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Sales Trend */}
              <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B97845]" />
                    <h4 className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                      HOURLY SALES PEAKS
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#C9945C] bg-[#21150F] px-2.5 py-1 rounded-full border border-[#3B2417]">
                    Rush Hour Analysis
                  </span>
                </div>
                <p className="text-xs text-[#F4E7D7]/70 font-body">
                  Revenue volume grouped by hour of the day to identify peak service demand.
                </p>

                <div className="w-full h-56 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics?.recentHourlySales || []}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3B2417" opacity={0.5} />
                      <XAxis
                        dataKey="hour"
                        stroke="#F4E7D7"
                        opacity={0.6}
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#F4E7D7"
                        opacity={0.6}
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#160E0A',
                          border: '1px solid #B97845',
                          borderRadius: '12px',
                          color: '#FFF9F2',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                        formatter={(value: any) => [`₹${value}`, 'Sales']}
                      />
                      <Bar dataKey="sales" fill="#C9945C" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Selling Products List */}
              <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#B97845]" />
                    <h4 className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                      TOP SELLING MENU ITEMS
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#F4E7D7]/60">Ranked by volume</span>
                </div>
                <p className="text-xs text-[#F4E7D7]/70 font-body">
                  Highest customer ordering velocity across all beverage & food categories.
                </p>

                {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {analytics.topProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0A0908] border border-[#3B2417] hover:border-[#B97845]/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                            idx === 0
                              ? 'bg-[#B97845] text-[#0A0908]'
                              : idx === 1
                              ? 'bg-[#3B2417] text-[#FFF9F2]'
                              : 'bg-[#21150F] text-[#F4E7D7]/60'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-display font-bold text-sm text-[#FFF9F2] block uppercase">
                              {p.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#C9945C]">
                              {p.count} units ordered
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-xs text-[#F4E7D7]/60 block">Revenue</span>
                          <span className="font-bold text-sm text-emerald-400">₹{p.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs font-mono text-[#F4E7D7]/50">
                    No sales recorded yet. Top selling items will appear here as bills are created.
                  </div>
                )}
              </div>
            </div>

            {/* ================= FULL FINANCIAL & SALES REPORT TABLE IN DASHBOARD ================= */}
            <div className="bg-[#160E0A] border-2 border-[#3B2417] rounded-3xl overflow-hidden shadow-2xl space-y-0">
              {/* Report Table Header */}
              <div className="p-5 sm:p-6 bg-[#1A100B] border-b border-[#3B2417] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <FileSpreadsheet className="w-5 h-5 text-[#B97845]" />
                    <h4 className="font-display text-xl font-bold text-[#FFF9F2] uppercase tracking-wide">
                      FINANCIAL & SALES REPORT
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase border ${
                      dashboardPaymentFilter === 'CASH'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : dashboardPaymentFilter === 'ONLINE'
                        ? 'bg-sky-950 text-sky-300 border-sky-600'
                        : dashboardPaymentFilter === 'COMPLIMENTARY'
                        ? 'bg-purple-950 text-purple-300 border-purple-600'
                        : dashboardPaymentFilter === 'DISCOUNT'
                        ? 'bg-amber-950 text-amber-300 border-amber-600'
                        : 'bg-[#21150F] text-[#C9945C] border-[#B97845]'
                    }`}>
                      FILTER: {dashboardPaymentFilter === 'ALL' ? 'ALL TRANSACTIONS' : dashboardPaymentFilter}
                    </span>
                  </div>
                  <p className="text-xs text-[#F4E7D7]/70 font-body mt-1">
                    Displaying {dashboardFilteredBills.length} records matching payment mode & date criteria.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search within report */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-[#B97845] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={dashboardReportSearch}
                      onChange={(e) => setDashboardReportSearch(e.target.value)}
                      placeholder="Search report..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-xs text-[#FFF9F2] placeholder-[#F4E7D7]/40 focus:outline-none focus:border-[#B97845]"
                    />
                  </div>

                  <button
                    onClick={() => handleExportDashboardReportCSV(
                      dashboardFilteredBills,
                      dashboardPaymentFilter === 'ALL'
                        ? 'All_Sales'
                        : dashboardPaymentFilter === 'CASH'
                        ? 'Cash_Sales'
                        : dashboardPaymentFilter === 'ONLINE'
                        ? 'Online_Sales'
                        : dashboardPaymentFilter === 'COMPLIMENTARY'
                        ? 'Complimentary_Orders'
                        : 'Discounted_Orders'
                    )}
                    className="px-3.5 py-1.5 rounded-xl bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-[#0A0908] border-b border-[#3B2417] text-[10px] font-mono uppercase text-[#B97845] tracking-wider sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-3.5 sm:p-4">Bill No</th>
                      <th className="p-3.5 sm:p-4">Date & Time (IST)</th>
                      <th className="p-3.5 sm:p-4">Customer & Table</th>
                      <th className="p-3.5 sm:p-4">Billed By</th>
                      <th className="p-3.5 sm:p-4">Items Ordered</th>
                      <th className="p-3.5 sm:p-4">Payment</th>
                      <th className="p-3.5 sm:p-4 text-right">Subtotal</th>
                      <th className="p-3.5 sm:p-4 text-right">Discount</th>
                      <th className="p-3.5 sm:p-4 text-right">Total</th>
                      <th className="p-3.5 sm:p-4 text-center">Status</th>
                      <th className="p-3.5 sm:p-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B2417]/50">
                    {dashboardFilteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-12 text-center text-xs font-mono text-[#F4E7D7]/50">
                          <Receipt className="w-8 h-8 text-[#B97845]/40 mx-auto mb-2" />
                          No sales records found matching the {dashboardPaymentFilter} filter in this timeframe.
                        </td>
                      </tr>
                    ) : (
                      dashboardFilteredBills.map((b) => (
                        <tr key={b.id} className="hover:bg-[#21150F]/40 transition-colors">
                          <td className="p-3.5 sm:p-4 font-mono font-bold text-[#FFF9F2] whitespace-nowrap">
                            {b.billNumber}
                          </td>
                          <td className="p-3.5 sm:p-4 font-mono text-[#F4E7D7]/80 whitespace-nowrap">
                            <span className="font-bold text-[#FFF9F2] block">{b.date}</span>
                            <span className="text-[10px] text-[#C9945C]">{b.time}</span>
                          </td>
                          <td className="p-3.5 sm:p-4 whitespace-nowrap">
                            <span className="font-bold text-[#FFF9F2] block">{b.customerName || 'Walk-in Guest'}</span>
                            <span className="text-[10px] font-mono text-[#F4E7D7]/60">
                              {b.tableNo || 'Counter'} {b.customerPhone ? `• ${b.customerPhone}` : ''}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 font-mono text-xs whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-[#21150F] text-[#C9945C] border border-[#3B2417] text-[10px] font-semibold">
                              {b.createdBy || 'Staff'}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 max-w-xs">
                            <div className="text-[11px] text-[#F4E7D7]/80 truncate">
                              {b.items?.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                            </div>
                          </td>
                          <td className="p-3.5 sm:p-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              b.paymentMethod === 'CASH'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : b.paymentMethod === 'ONLINE' || b.paymentMethod === 'PAY_AT_COUNTER'
                                ? 'bg-sky-950 text-sky-300 border-sky-700'
                                : b.paymentMethod === 'COMPLIMENTARY'
                                ? 'bg-purple-950 text-purple-300 border-purple-700'
                                : 'bg-[#21150F] text-[#C9945C] border-[#3B2417]'
                            }`}>
                              {b.paymentMethod === 'PAY_AT_COUNTER' ? 'ONLINE/COUNTER' : b.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 font-mono text-right text-[#F4E7D7]/70 whitespace-nowrap">
                            ₹{b.subtotal || b.total}
                          </td>
                          <td className="p-3.5 sm:p-4 font-mono text-right text-rose-400 whitespace-nowrap">
                            {b.discount && b.discount > 0 ? `-₹${b.discount}` : '—'}
                          </td>
                          <td className="p-3.5 sm:p-4 font-mono font-bold text-right text-emerald-400 whitespace-nowrap">
                            ₹{b.total}
                          </td>
                          <td className="p-3.5 sm:p-4 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                              b.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : b.status === 'ACCEPTED'
                                ? 'bg-sky-950 text-sky-400 border border-sky-800'
                                : b.status === 'CANCELLED'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => {
                                setActiveBill(b);
                                setIsBillModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#21150F] hover:bg-[#B97845] hover:text-[#0A0908] text-[#C9945C] border border-[#3B2417] transition-colors"
                              title="View and Print Thermal Tax Invoice"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Summary Footer */}
              <div className="p-4 sm:p-5 bg-[#0A0908] border-t border-[#3B2417] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-4 text-[#F4E7D7]/70">
                  <span>Showing <strong>{dashboardFilteredBills.length}</strong> matching records</span>
                  <span>•</span>
                  <span>Timeframe: <strong>{dashboardTimeframe}</strong></span>
                </div>

                <div className="flex items-center gap-6 divide-x divide-[#3B2417]">
                  <div>
                    <span className="text-[10px] text-[#F4E7D7]/60 uppercase block">Total Discounts Given</span>
                    <span className="font-bold text-rose-400">
                      -₹{dashboardFilteredBills.reduce((sum, b) => sum + (b.discount || 0), 0)}
                    </span>
                  </div>
                  <div className="pl-6">
                    <span className="text-[10px] text-emerald-400 uppercase block font-bold">Filtered Net Total</span>
                    <span className="font-display font-extrabold text-base text-emerald-400">
                      ₹{dashboardFilteredBills.reduce((sum, b) => sum + (b.total || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB: AUDIT & SALES CSV EXPORT ================= */}
        {isAdmin && activeTab === 'audit' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                  SALES AUDIT & EXPORT LOGS
                </h3>
                <p className="text-xs text-[#F4E7D7]/70 font-body">
                  Financial auditing trail, detailed invoice breakdown, and instant CSV spreadsheet download.
                </p>
              </div>

              <button
                onClick={handleExportAuditCSV}
                className="px-5 py-2.5 rounded-2xl bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl shadow-[#B97845]/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Sales File (CSV)</span>
              </button>
            </div>

            {/* Filter & Summary Banner */}
            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-[#B97845] font-bold">
                  Filter Audit Range:
                </span>
                <div className="flex items-center gap-1.5 bg-[#0A0908] p-1 rounded-xl border border-[#3B2417]">
                  {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAuditDateFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        auditDateFilter === filter
                          ? 'bg-[#B97845] text-[#0A0908]'
                          : 'text-[#F4E7D7]/70 hover:text-[#FFF9F2]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[#F4E7D7]/60 block text-[10px] uppercase">Matching Invoices</span>
                  <span className="font-bold text-[#FFF9F2] text-sm">
                    {(() => {
                      const now = new Date();
                      const todayStr = now.toISOString().split('T')[0];
                      if (auditDateFilter === 'TODAY') return bills.filter(b => b.date === todayStr).length;
                      if (auditDateFilter === 'WEEK') return bills.filter(b => new Date(b.createdAt).getTime() >= now.getTime() - 7*24*60*60*1000).length;
                      if (auditDateFilter === 'MONTH') return bills.filter(b => new Date(b.createdAt).getTime() >= now.getTime() - 30*24*60*60*1000).length;
                      return bills.length;
                    })()}
                  </span>
                </div>
                <div>
                  <span className="text-[#F4E7D7]/60 block text-[10px] uppercase">Filtered Revenue</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{(() => {
                      const now = new Date();
                      const todayStr = now.toISOString().split('T')[0];
                      let list = [...bills];
                      if (auditDateFilter === 'TODAY') list = list.filter(b => b.date === todayStr);
                      if (auditDateFilter === 'WEEK') list = list.filter(b => new Date(b.createdAt).getTime() >= now.getTime() - 7*24*60*60*1000);
                      if (auditDateFilter === 'MONTH') list = list.filter(b => new Date(b.createdAt).getTime() >= now.getTime() - 30*24*60*60*1000);
                      return list.reduce((sum, b) => sum + (b.total || 0), 0);
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Records Table */}
            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-[#3B2417] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B97845]" />
                  <h4 className="font-display text-base font-bold text-[#FFF9F2] uppercase">
                    TRANSACTION AUDIT LOGS
                  </h4>
                </div>
                <span className="text-xs font-mono text-[#C9945C]">
                  {bills.length} Total Verified Invoices
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-[#0A0908] border-b border-[#3B2417] text-[10px] font-mono uppercase text-[#B97845] tracking-wider">
                    <tr>
                      <th className="p-4">Bill No</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items Breakdown</th>
                      <th className="p-4">Method</th>
                      <th className="p-4 text-right">Subtotal</th>
                      <th className="p-4 text-right">Discount</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B2417]/50">
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-xs font-mono text-[#F4E7D7]/50">
                          No audit transaction records found. Generate bills to track financial logs.
                        </td>
                      </tr>
                    ) : (
                      bills.map((b) => (
                        <tr key={b.id} className="hover:bg-[#21150F]/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#FFF9F2]">{b.billNumber}</td>
                          <td className="p-4 font-mono text-[#F4E7D7]/70 whitespace-nowrap">
                            {b.date} {b.time}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-[#FFF9F2] block">{b.customerName || 'Walk-in Guest'}</span>
                            <span className="text-[10px] font-mono text-[#F4E7D7]/50">{b.customerPhone || b.tableNo || 'Counter'}</span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="text-[11px] text-[#F4E7D7]/80 truncate">
                              {b.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#21150F] text-[#C9945C] border border-[#3B2417]">
                              {b.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-right text-[#F4E7D7]/70">₹{b.subtotal}</td>
                          <td className="p-4 font-mono text-right text-rose-400">
                            {b.discount ? `-₹${b.discount}` : '—'}
                          </td>
                          <td className="p-4 font-mono font-bold text-right text-emerald-400">
                            ₹{b.total}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setActiveBill(b);
                                setIsBillModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] font-mono text-[11px] border border-[#3B2417] transition-colors"
                            >
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SETTINGS (RESET PASSWORD & CLEAR BILLS) ================= */}
        {isAdmin && activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                SYSTEM SETTINGS & ADMIN CONTROLS
              </h3>
              <p className="text-xs text-[#F4E7D7]/70 font-body">
                Manage your administrative credentials, security parameters, and database lifecycle.
              </p>
            </div>

            {/* Reset Password Form Card */}
            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#3B2417]">
                <div className="w-10 h-10 rounded-2xl bg-[#21150F] border border-[#3B2417] flex items-center justify-center text-[#B97845]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                    RESET ADMIN PASSWORD
                  </h4>
                  <p className="text-xs text-[#F4E7D7]/70 font-body">
                    Update your login credentials. Changes take effect immediately.
                  </p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-mono text-[#F4E7D7]/80 block mb-1.5 uppercase">
                    Current Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password if set"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#0A0908] border border-[#3B2417] rounded-xl px-4 py-2.5 text-xs font-mono text-[#FFF9F2] focus:outline-none focus:border-[#B97845] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#F4E7D7]/80 block mb-1.5 uppercase">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="Enter new password (min 4 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0A0908] border border-[#3B2417] rounded-xl px-4 py-2.5 text-xs font-mono text-[#FFF9F2] focus:outline-none focus:border-[#B97845] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#F4E7D7]/80 block mb-1.5 uppercase">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0A0908] border border-[#3B2417] rounded-xl px-4 py-2.5 text-xs font-mono text-[#FFF9F2] focus:outline-none focus:border-[#B97845] transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="px-6 py-2.5 rounded-xl bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                  >
                    {isResettingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save New Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Clear Bills & Reset Sales Data Card (Admin Only) */}
            {isAdmin && (
              <div className="bg-[#160E0A] border border-rose-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#3B2417]">
                  <div className="w-10 h-10 rounded-2xl bg-rose-950/50 border border-rose-800 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                      CLEAR ALL BILLS & TRANSACTION HISTORY
                    </h4>
                    <p className="text-xs text-[#F4E7D7]/70 font-body">
                      Wipe out all invoices, order transaction histories, and reset POS revenue counters. (Admin Only)
                    </p>
                  </div>
                </div>

                <div className="bg-[#0A0908] border border-[#3B2417] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#F4E7D7]/70">Currently Recorded Bills:</span>
                    <span className="font-bold text-[#FFF9F2]">{bills.length} records</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#F4E7D7]/70">Total Historical Revenue:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{bills.reduce((sum, b) => sum + (b.total || 0), 0)}
                    </span>
                  </div>
                  <p className="text-xs font-body text-rose-300/80 pt-1 leading-relaxed">
                    Warning: Clearing bills is irreversible. If you need this data for accounting, please download the Sales CSV in the <strong>Audit</strong> tab prior to clearing.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsClearBillsModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Bills</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportAuditCSV}
                    className="px-4 py-2.5 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] font-mono text-xs border border-[#3B2417] transition-all flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup to CSV First</span>
                  </button>
                </div>
              </div>
            )}

            {/* Google Cloud SQL Database Telemetry Card */}
            <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#3B2417]">
                <div className="w-10 h-10 rounded-2xl bg-[#21150F] border border-[#3B2417] flex items-center justify-center text-[#C9945C]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                    GOOGLE CLOUD SQL DATABASE (POSTGRESQL)
                  </h4>
                  <p className="text-xs text-[#F4E7D7]/70 font-body">
                    Real-time operational persistence with Drizzle ORM in asia-southeast1.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0A0908] p-4 rounded-2xl border border-[#3B2417] space-y-1">
                  <span className="text-[10px] font-mono text-[#F4E7D7]/60 block uppercase">Engine</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 block flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Google Cloud SQL (PostgreSQL)
                  </span>
                </div>

                <div className="bg-[#0A0908] p-4 rounded-2xl border border-[#3B2417] space-y-1">
                  <span className="text-[10px] font-mono text-[#F4E7D7]/60 block uppercase">Region</span>
                  <span className="text-xs font-mono font-bold text-[#FFF9F2] block">
                    asia-southeast1 (Singapore)
                  </span>
                </div>

                <div className="bg-[#0A0908] p-4 rounded-2xl border border-[#3B2417] space-y-1">
                  <span className="text-[10px] font-mono text-[#F4E7D7]/60 block uppercase">ORM Layer</span>
                  <span className="text-xs font-mono font-bold text-[#C9945C] block">
                    Drizzle ORM + PG Pool
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 8: ANALYTICS DASHBOARD ================= */}
        {isAdmin && activeTab === 'analytics' && (
          <div className="space-y-8">
            
            <div>
              <h3 className="font-display text-2xl font-bold text-[#FFF9F2] uppercase">
                SALES & REVENUE ANALYTICS
              </h3>
              <p className="text-xs text-[#F4E7D7]/70 font-body">
                Live performance telemetry, order volume, and top item velocity.
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                  SALES TODAY
                </span>
                <span className="font-display text-4xl font-extrabold text-[#FFF9F2]">
                  ₹{analytics?.salesToday || 0}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 block">
                  ↑ Direct POS & Online Sales
                </span>
              </div>

              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                  BILLS TODAY
                </span>
                <span className="font-display text-4xl font-extrabold text-[#FFF9F2]">
                  {analytics?.totalBillsToday || 0}
                </span>
                <span className="text-[11px] font-mono text-[#F4E7D7]/60 block">
                  Invoices generated
                </span>
              </div>

              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                  TOTAL MENU PRODUCTS
                </span>
                <span className="font-display text-4xl font-extrabold text-[#FFF9F2]">
                  {analytics?.totalProducts || products.length}
                </span>
                <span className="text-[11px] font-mono text-[#C9945C] block">
                  {products.filter(p => p.availability).length} In Stock
                </span>
              </div>

              <div className="bg-[#160E0A] border border-[#3B2417] p-6 rounded-3xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                  LOW STOCK INGREDIENTS
                </span>
                <span className="font-display text-4xl font-extrabold text-[#FFF9F2]">
                  {analytics?.lowStockCount || 0}
                </span>
                <span className="text-[11px] font-mono text-rose-400 block">
                  Requires restock
                </span>
              </div>
            </div>

            {/* Top Brew Card */}
            {analytics?.topBrew && analytics.topBrew.count > 0 ? (
              <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#B97845] font-bold block">
                    ★ #1 TOP SELLING BREW
                  </span>
                  <h4 className="font-display text-3xl font-bold text-[#FFF9F2]">
                    {analytics.topBrew.name}
                  </h4>
                  <p className="text-xs font-mono text-[#C9945C]">
                    {analytics.topBrew.count} orders • ₹{analytics.topBrew.revenue} total sales
                  </p>
                </div>

                {analytics.topBrew.image && (
                  <img
                    src={analytics.topBrew.image}
                    alt={analytics.topBrew.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-2xl object-cover border border-[#3B2417]"
                  />
                )}
              </div>
            ) : (
              <div className="bg-[#160E0A] border border-dashed border-[#3B2417] rounded-3xl p-6 text-center text-xs font-mono text-[#F4E7D7]/50">
                <Coffee className="w-8 h-8 text-[#B97845]/40 mx-auto mb-2" />
                No best-selling brew recorded yet. Bestseller metrics will appear here once orders are completed.
              </div>
            )}

          </div>
        )}

      </main>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#3B2417]">
              <h3 className="font-display text-xl font-bold text-[#FFF9F2] uppercase">
                {editingProduct.id ? 'EDIT MENU PRODUCT' : 'CREATE NEW MENU PRODUCT'}
              </h3>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center hover:bg-[#3B2417] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Pistachio Matcha Latte"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#F4E7D7]/80 block font-bold">Category *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategoryMode(!isCustomCategoryMode);
                          if (!isCustomCategoryMode) {
                            setCustomCategoryInput('');
                          }
                        }}
                        className="text-[10px] text-[#B97845] hover:text-[#C9945C] underline font-mono cursor-pointer"
                      >
                        {isCustomCategoryMode ? '← Choose Existing' : '+ Add New Category'}
                      </button>
                    </div>

                    {!isCustomCategoryMode ? (
                      <select
                        value={editingProduct.category || (categories[0]?.name || 'Pancake')}
                        onChange={(e) => {
                          if (e.target.value === '__NEW__') {
                            setIsCustomCategoryMode(true);
                            setCustomCategoryInput('');
                          } else {
                            setEditingProduct({ ...editingProduct, category: e.target.value });
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] focus:border-[#B97845] focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        <option value="__NEW__">★ + Create New Category...</option>
                      </select>
                    ) : (
                      <div className="space-y-1 animate-fadeIn">
                        <input
                          type="text"
                          required
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          placeholder="Type new category (e.g. Artisanal Desserts)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#21150F] border border-amber-500/60 text-[#FFF9F2] focus:border-[#B97845] focus:outline-none"
                        />
                        <span className="text-[9px] text-amber-300/80 block font-mono">
                          ★ Auto-saves & instantly updates Homepage & POS menu tabs!
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[#F4E7D7]/80 block mb-1 font-bold">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] focus:border-[#B97845] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Artisanal description of flavors and ingredients..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[#F4E7D7]/80 block mb-1 font-bold">Product Image</label>
                
                {/* Image Preview & Upload Container */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  {editingProduct.image ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#3B2417] bg-[#0A0908] flex-shrink-0 group shadow-md">
                      <img
                        src={editingProduct.image}
                        alt="Product Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400"
                        title="Remove Image"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border border-dashed border-[#3B2417] bg-[#0A0908] flex flex-col items-center justify-center text-[#F4E7D7]/40 flex-shrink-0">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">No image</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    {/* File Upload Button with Auto-Compression */}
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#F4E7D7] border border-[#3B2417] cursor-pointer transition-colors text-xs font-mono">
                      <Upload className="w-4 h-4 text-[#B97845]" />
                      <span>Upload from Device (Auto-Optimized)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file);
                              setEditingProduct((prev) => (prev ? { ...prev, image: compressed } : null));
                              showToast('Image uploaded and optimized for menu display!');
                            } catch (err) {
                              console.error('Image compression failed:', err);
                              showToast('Failed to process image. Try another file.', true);
                            }
                          }
                        }}
                      />
                    </label>

                    {/* Direct URL Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#F4E7D7]/40 uppercase tracking-wider">or URL:</span>
                      <input
                        type="text"
                        value={editingProduct.image?.startsWith('data:') ? '' : (editingProduct.image || '')}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        placeholder="Paste image link https://..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] text-[11px] focus:outline-none focus:border-[#B97845]"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick High-Resolution Aesthetic Image Presets */}
                <div className="pt-2 border-t border-[#3B2417]/50 space-y-1.5">
                  <span className="text-[10px] font-mono text-[#F4E7D7]/60 block">Quick HD Image Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Espresso', url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80' },
                      { name: 'Cappuccino', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80' },
                      { name: 'Caramel Frappe', url: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=600&auto=format&fit=crop&q=80' },
                      { name: 'Cold Brew', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80' },
                      { name: 'Matcha Latte', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80' },
                      { name: 'Pancakes', url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop&q=80' },
                      { name: 'Croissant', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80' },
                      { name: 'Avocado Toast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setEditingProduct((prev) => (prev ? { ...prev, image: preset.url } : null));
                          showToast(`Selected ${preset.name} photo!`);
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono border transition-all ${
                          editingProduct.image === preset.url
                            ? 'bg-[#B97845] border-[#B97845] text-[#0A0908] font-bold'
                            : 'bg-[#21150F] border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.availability ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.checked })}
                    className="rounded text-[#B97845]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="rounded text-[#B97845]"
                  />
                  <span>Bestseller Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isSpecial ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isSpecial: e.target.checked })}
                    className="rounded text-[#B97845]"
                  />
                  <span>Chef's Special</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              >
                {editingProduct.id ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Add/Edit Modal */}
      {isInventoryModalOpen && editingInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#3B2417]">
              <h3 className="font-display text-xl font-bold text-[#FFF9F2] uppercase">
                {editingInventory.id ? 'EDIT RAW INGREDIENT' : 'ADD RAW INGREDIENT'}
              </h3>
              <button
                onClick={() => {
                  setIsInventoryModalOpen(false);
                  setEditingInventory(null);
                }}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center hover:bg-[#3B2417] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Ingredient / Raw Item Name *</label>
                <input
                  type="text"
                  required
                  value={editingInventory.name || ''}
                  onChange={(e) => setEditingInventory({ ...editingInventory, name: e.target.value })}
                  placeholder="e.g. Arabica Roast Beans"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#F4E7D7]/80 block">Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsInventoryCustomCatMode(!isInventoryCustomCatMode)}
                      className="text-[10px] text-[#B97845] hover:underline"
                    >
                      {isInventoryCustomCatMode ? 'Choose' : '+ New'}
                    </button>
                  </div>

                  {isInventoryCustomCatMode ? (
                    <input
                      type="text"
                      required
                      value={editingInventory.category || ''}
                      onChange={(e) => setEditingInventory({ ...editingInventory, category: e.target.value })}
                      placeholder="e.g. Pancake Mix"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#B97845] text-[#FFF9F2]"
                    />
                  ) : (
                    <select
                      value={editingInventory.category || allInventoryCategories[0] || 'Coffee Beans'}
                      onChange={(e) => setEditingInventory({ ...editingInventory, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                    >
                      {allInventoryCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[#F4E7D7]/80 block mb-1">Unit of Measure</label>
                  <select
                    value={editingInventory.unit || 'g'}
                    onChange={(e) => setEditingInventory({ ...editingInventory, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="L">Liters (L)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#F4E7D7]/80 block mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingInventory.quantity ?? 0}
                    onChange={(e) => setEditingInventory({ ...editingInventory, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                  />
                </div>

                <div>
                  <label className="text-[#F4E7D7]/80 block mb-1">Min Threshold Alert *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingInventory.minStock ?? 0}
                    onChange={(e) => setEditingInventory({ ...editingInventory, minStock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Supplier / Origin Note</label>
                <input
                  type="text"
                  value={editingInventory.supplier || ''}
                  onChange={(e) => setEditingInventory({ ...editingInventory, supplier: e.target.value })}
                  placeholder="e.g. Coorg Artisan Estate or Amul Fresh Dairy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              >
                {editingInventory.id ? 'UPDATE STOCK ITEM' : 'ADD TO INVENTORY'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Add Inventory Category Modal */}
      {isAddInventoryCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-[#3B2417]">
              <div className="flex items-center gap-2 text-[#FFF9F2]">
                <Package className="w-5 h-5 text-[#B97845]" />
                <h3 className="font-display text-xl font-bold uppercase">
                  ADD INVENTORY CATEGORY
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddInventoryCatModalOpen(false);
                  setNewInventoryCatName('');
                }}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center hover:bg-[#3B2417] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newInventoryCatName.trim()) return;
                setInventoryCategoryFilter(newInventoryCatName.trim());
                showToast(`Inventory category "${newInventoryCatName.trim()}" created!`);
                setIsAddInventoryCatModalOpen(false);
                setNewInventoryCatName('');
              }}
              className="space-y-4 text-xs font-mono"
            >
              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">New Category Name *</label>
                <input
                  type="text"
                  required
                  value={newInventoryCatName}
                  onChange={(e) => setNewInventoryCatName(e.target.value)}
                  placeholder="e.g. Pancake Mix & Toppings, Chocolate Syrups"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] focus:border-[#B97845]"
                />
              </div>

              <p className="text-[11px] text-[#F4E7D7]/60 font-body">
                This category will be immediately available when adding ingredients and filtering inventory stocks.
              </p>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              >
                CREATE CATEGORY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dish Recipe & Formula Builder Modal */}
      {isRecipeModalOpen && editingRecipeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#3B2417]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#B97845]/20 border border-[#B97845]/50 flex items-center justify-center text-[#B97845]">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#FFF9F2] uppercase">
                    RECIPE FORMULA BUILDER
                  </h3>
                  <p className="text-[11px] text-[#F4E7D7]/70 font-mono">
                    Dish: <strong className="text-[#FFF9F2]">{editingRecipeProduct.name}</strong> • Menu Price: ₹{editingRecipeProduct.price}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsRecipeModalOpen(false);
                  setEditingRecipeProduct(null);
                }}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center hover:bg-[#3B2417] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs font-mono">
              {/* Product Selector Switcher */}
              <div>
                <label className="text-[#F4E7D7]/80 block mb-1 font-bold uppercase">
                  Select Target Dish / Beverage:
                </label>
                <select
                  value={editingRecipeProduct.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) {
                      setEditingRecipeProduct(found);
                      setRecipeIngredients(found.ingredients || []);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) — ₹{p.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipe Ingredients Rows */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#F4E7D7]/80 font-bold uppercase flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#B97845]" />
                    <span>Required Ingredients per Portion:</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const firstInv = inventory[0];
                      setRecipeIngredients([
                        ...recipeIngredients,
                        {
                          ingredientId: firstInv?.id || 'inv-item',
                          name: firstInv?.name || 'Raw Ingredient',
                          amount: 20,
                          unit: firstInv?.unit || 'g',
                        },
                      ]);
                    }}
                    className="px-3 py-1 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#C9945C] border border-[#3B2417] text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Ingredient</span>
                  </button>
                </div>

                {recipeIngredients.length === 0 ? (
                  <div className="text-center py-8 bg-[#0A0908] rounded-2xl border border-dashed border-[#3B2417] text-[#F4E7D7]/50 space-y-2">
                    <Utensils className="w-8 h-8 text-[#B97845] mx-auto opacity-50" />
                    <p>No ingredients linked to this recipe yet.</p>
                    <p className="text-[10px]">Click "+ Add Ingredient" above to select items from raw inventory.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {recipeIngredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0A0908] border border-[#3B2417] p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3"
                      >
                        <div className="flex-1 w-full sm:w-auto">
                          <label className="text-[9px] text-[#F4E7D7]/60 block uppercase mb-1">
                            Raw Ingredient Item
                          </label>
                          <select
                            value={ing.ingredientId}
                            onChange={(e) => {
                              const invItem = inventory.find((i) => i.id === e.target.value);
                              const updated = [...recipeIngredients];
                              updated[idx] = {
                                ...updated[idx],
                                ingredientId: e.target.value,
                                name: invItem?.name || updated[idx].name,
                                unit: invItem?.unit || updated[idx].unit,
                              };
                              setRecipeIngredients(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#160E0A] border border-[#3B2417] text-[#FFF9F2] text-xs"
                          >
                            {inventory.map((invItem) => (
                              <option key={invItem.id} value={invItem.id}>
                                {invItem.name} ({invItem.category} • In stock: {invItem.quantity} {invItem.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-28">
                          <label className="text-[9px] text-[#F4E7D7]/60 block uppercase mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            required
                            min={0.1}
                            step="any"
                            value={ing.amount}
                            onChange={(e) => {
                              const updated = [...recipeIngredients];
                              updated[idx].amount = Number(e.target.value);
                              setRecipeIngredients(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#160E0A] border border-[#3B2417] text-[#FFF9F2] text-xs"
                          />
                        </div>

                        <div className="w-full sm:w-24">
                          <label className="text-[9px] text-[#F4E7D7]/60 block uppercase mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            value={ing.unit}
                            onChange={(e) => {
                              const updated = [...recipeIngredients];
                              updated[idx].unit = e.target.value;
                              setRecipeIngredients(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#160E0A] border border-[#3B2417] text-[#FFF9F2] text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx));
                          }}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 self-end sm:self-center transition-colors"
                          title="Remove Ingredient from Recipe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recipe Formula Info Banner */}
              <div className="bg-[#0A0908] border border-[#3B2417] p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-[#F4E7D7]/70">POS Stock Automation:</span>
                <span className="text-emerald-400 font-bold">
                  ✓ Automatic raw ingredient deduction active on sale
                </span>
              </div>

              <button
                type="submit"
                disabled={isSavingRecipe}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#B97845] via-[#C9945C] to-[#B97845] text-[#0A0908] font-bold text-xs uppercase tracking-wider hover:scale-[1.02] transition-all shadow-xl shadow-[#B97845]/20 flex items-center justify-center gap-2"
              >
                {isSavingRecipe ? (
                  <span>SAVING RECIPE FORMULA...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>SAVE & LINK RECIPE FORMULA</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {isEmployeeModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-[#3B2417]">
              <h3 className="font-display text-xl font-bold text-[#FFF9F2] uppercase">
                {editingEmployee.id ? 'EDIT STAFF ACCOUNT' : 'ADD STAFF ACCOUNT'}
              </h3>
              <button
                onClick={() => {
                  setIsEmployeeModalOpen(false);
                  setEditingEmployee(null);
                  setEmployeePassword('');
                }}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center hover:bg-[#3B2417] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.name || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  placeholder="e.g. Sameer Kulkarni"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              {!editingEmployee.id && (
                <div>
                  <label className="text-[#F4E7D7]/80 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.username || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, username: e.target.value })}
                    placeholder="sameer_k"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                  />
                </div>
              )}

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">
                  {editingEmployee.id ? 'Change Password (leave empty to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingEmployee.id}
                  value={employeePassword}
                  onChange={(e) => setEmployeePassword(e.target.value)}
                  placeholder={editingEmployee.id ? '•••••••• (leave blank to keep unchanged)' : '••••••••'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Role *</label>
                <select
                  value={editingEmployee.role || 'EMPLOYEE'}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                >
                  <option value="EMPLOYEE">Staff / Barista (POS & Orders)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={editingEmployee.phone || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              >
                {editingEmployee.id ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Offer Add/Edit Modal */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#3B2417]">
              <h3 className="font-display text-xl font-bold text-[#FFF9F2] uppercase">
                {editingOffer.id ? 'EDIT PROMOTION OFFER' : 'CREATE PROMOTION OFFER'}
              </h3>
              <button
                onClick={() => {
                  setIsOfferModalOpen(false);
                  setEditingOffer(null);
                }}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center hover:bg-[#3B2417] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  placeholder="e.g. Monsoon Twilight 15% OFF"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Subtitle / Terms *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.subtitle || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, subtitle: e.target.value })}
                  placeholder="Get flat 15% discount on all hot chocolates..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#F4E7D7]/80 block mb-1">Discount % *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={editingOffer.discountPercent || 10}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discountPercent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                  />
                </div>

                <div>
                  <label className="text-[#F4E7D7]/80 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={editingOffer.badgeText || "TODAY'S SPECIAL"}
                    onChange={(e) => setEditingOffer({ ...editingOffer, badgeText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={editingOffer.bannerImage || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              >
                {editingOffer.id ? 'UPDATE OFFER' : 'PUBLISH OFFER'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP RELIABLE DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-rose-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                  Confirm Deletion
                </h3>
                <span className="text-[10px] font-mono text-rose-400">Irreversible Action</span>
              </div>
            </div>

            <p className="text-xs font-body text-[#F4E7D7]/90 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#FFF9F2] font-semibold">"{deleteTarget.name}"</strong>?
              {deleteTarget.type === 'product' && ' It will be removed from customer view and POS menus.'}
              {deleteTarget.type === 'inventory' && ' Raw ingredient tracking records for this item will be deleted.'}
              {deleteTarget.type === 'staff' && ' This staff member will no longer be able to log in.'}
              {deleteTarget.type === 'bill' && ' This transaction and invoice receipt record will be removed.'}
              {deleteTarget.type === 'offer' && ' This active promotional banner will be removed from customer displays.'}
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-full bg-[#21150F] hover:bg-[#3B2417] text-[#F4E7D7] transition-colors border border-[#3B2417]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Printable Modal */}
      <BillModal
        bill={activeBill}
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
      />

      {/* Clear All Bills Confirmation Modal */}
      {isClearBillsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-rose-600/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-[#3B2417]">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#FFF9F2] uppercase">
                  CLEAR ALL BILLS & INVOICES
                </h3>
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Danger Zone • Irreversible</span>
              </div>
            </div>

            <p className="text-xs font-body text-[#F4E7D7]/90 leading-relaxed">
              This will permanently delete all <strong>{bills.length} order receipts and transaction records</strong> from the database and reset sales stats to zero.
            </p>

            <div className="bg-[#0A0908] p-3 rounded-xl border border-[#3B2417] space-y-1.5 font-mono text-xs">
              <span className="text-[#F4E7D7]/70 block text-[11px]">
                To confirm, type <strong className="text-rose-400 select-all">CLEAR_ALL_BILLS_PERMANENTLY</strong> below:
              </span>
              <input
                type="text"
                value={clearBillsConfirmInput}
                onChange={(e) => setClearBillsConfirmInput(e.target.value)}
                placeholder="CLEAR_ALL_BILLS_PERMANENTLY"
                className="w-full bg-[#160E0A] border border-[#3B2417] focus:border-rose-500 rounded-lg px-3 py-2 text-xs font-mono text-[#FFF9F2] outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                disabled={isClearingBills}
                onClick={() => {
                  setIsClearBillsModalOpen(false);
                  setClearBillsConfirmInput('');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#F4E7D7] transition-colors border border-[#3B2417]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearingBills || clearBillsConfirmInput !== 'CLEAR_ALL_BILLS_PERMANENTLY'}
                onClick={handleClearAllBills}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg"
              >
                {isClearingBills ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Wipe Bills</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE ORDER ACTION & PAYMENT METHOD MODAL */}
      {orderActionModal.isOpen && orderActionModal.bill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#3B2417] pb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    orderActionModal.action === 'ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : orderActionModal.action === 'PAID'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {orderActionModal.action === 'ACCEPTED' && <CheckCircle2 className="w-5 h-5" />}
                  {orderActionModal.action === 'PAID' && <Check className="w-5 h-5" />}
                  {orderActionModal.action === 'CANCELLED' && <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#FFF9F2] uppercase">
                    {orderActionModal.action === 'ACCEPTED' && 'ACCEPT & CONFIRM ORDER'}
                    {orderActionModal.action === 'PAID' && 'SETTLE & MARK PAID'}
                    {orderActionModal.action === 'CANCELLED' && 'REJECT / CANCEL ORDER'}
                  </h3>
                  <span className="text-[11px] font-mono text-[#C9945C]">
                    Order #{orderActionModal.bill.billNumber} • ₹{orderActionModal.bill.total}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setOrderActionModal({ isOpen: false, bill: null, action: null, paymentMethod: 'CASH' })
                }
                className="w-8 h-8 rounded-full bg-[#21150F] hover:bg-[#3B2417] text-[#FFF9F2] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Brief Summary */}
            <div className="bg-[#0A0908] p-3.5 rounded-2xl border border-[#3B2417] space-y-1 text-xs">
              <div className="flex justify-between text-[#F4E7D7]/80">
                <span className="font-mono">Guest / Table:</span>
                <span className="font-bold text-[#FFF9F2]">
                  {orderActionModal.bill.customerName || 'Walk-in'} ({orderActionModal.bill.tableNo || 'Counter'})
                </span>
              </div>
              <div className="flex justify-between text-[#F4E7D7]/80">
                <span className="font-mono">Current Payment:</span>
                <span className="font-mono font-bold text-[#C9945C]">
                  {orderActionModal.bill.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-[#F4E7D7]/80">
                <span className="font-mono">Items:</span>
                <span className="font-mono text-[#FFF9F2] truncate max-w-[200px]">
                  {orderActionModal.bill.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                </span>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR (FOR ACCEPT & PAID ACTIONS) */}
            {orderActionModal.action !== 'CANCELLED' ? (
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase text-[#F4E7D7]/80 font-bold block">
                  Select Payment Method for Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CASH', label: '💵 CASH', desc: 'Received in Cash' },
                    { id: 'ONLINE', label: '📱 UPI / ONLINE', desc: 'GPay, PhonePe, Card' },
                    { id: 'PAY_AT_COUNTER', label: '⏳ PAY AT COUNTER', desc: 'Pay on food pickup' },
                    { id: 'COMPLIMENTARY', label: '🎁 COMPLIMENTARY', desc: 'Free / On House' },
                  ].map((pm) => {
                    const isSelected = orderActionModal.paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() =>
                          setOrderActionModal((prev) => ({
                            ...prev,
                            paymentMethod: pm.id as PaymentMethod,
                          }))
                        }
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-[#FFF9F2] shadow-md'
                            : 'bg-[#0A0908] border-[#3B2417] text-[#F4E7D7]/70 hover:border-[#B97845]'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold block">{pm.label}</span>
                        <span className="text-[10px] font-mono text-[#F4E7D7]/50 block">{pm.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono space-y-1">
                <span className="font-bold block">⚠️ Confirm Order Cancellation</span>
                <p className="text-[11px] text-rose-300/80">
                  This will mark Order #{orderActionModal.bill.billNumber} as REJECTED. The kitchen will be alerted not to prepare these items.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() =>
                  setOrderActionModal({ isOpen: false, bill: null, action: null, paymentMethod: 'CASH' })
                }
                className="px-4 py-2.5 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#F4E7D7] transition-colors border border-[#3B2417]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => {
                  if (orderActionModal.bill && orderActionModal.action) {
                    handleOrderStatusUpdate(
                      orderActionModal.bill.id,
                      orderActionModal.action,
                      orderActionModal.paymentMethod
                    );
                  }
                }}
                className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-black transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 ${
                  orderActionModal.action === 'ACCEPTED'
                    ? 'bg-emerald-500 hover:bg-emerald-400'
                    : orderActionModal.action === 'PAID'
                    ? 'bg-sky-400 hover:bg-sky-300'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : orderActionModal.action === 'ACCEPTED' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Accept</span>
                  </>
                ) : orderActionModal.action === 'PAID' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Paid</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Reject</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STANDALONE CATEGORY CREATION MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#160E0A] border border-[#3B2417] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-[#3B2417]">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#B97845]" />
                <h3 className="font-display text-xl font-bold text-[#FFF9F2] uppercase">
                  CREATE NEW CATEGORY
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center hover:bg-[#3B2417] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#F4E7D7]/70 font-body">
              New categories will be synced into Google Cloud SQL and immediately appear across the <strong>Homepage digital menu</strong>, <strong>POS terminal</strong>, and <strong>Admin product management</strong>.
            </p>

            <form onSubmit={handleCreateStandaloneCategory} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#F4E7D7]/80 block mb-1 font-bold">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Signature Mocktails, Artisanal Desserts"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] focus:border-[#B97845] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#F4E7D7]/80 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Short tagline or notes for this category..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0908] border border-[#3B2417] text-[#FFF9F2] focus:border-[#B97845] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#21150F] hover:bg-[#3B2417] text-[#F4E7D7] transition-colors border border-[#3B2417]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingCategory || !newCategoryName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#B97845] hover:bg-[#C9945C] text-[#0A0908] font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSavingCategory ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create & Sync Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
