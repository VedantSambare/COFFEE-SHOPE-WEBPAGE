export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface IngredientRecipe {
  ingredientId: string;
  name: string;
  amount: number;
  unit: string;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  availability: boolean;
  inventoryQuantity: number;
  minStock: number;
  isFeatured?: boolean;
  isSpecial?: boolean;
  isBestSeller?: boolean;
  ingredients?: IngredientRecipe[];
  addOns?: AddOnOption[];
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  displayOrder: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  supplier?: string;
  lastRestocked: string;
}

export interface BillItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedAddOns: { name: string; price: number }[];
  subtotal: number;
}

export type PaymentMethod = 'CASH' | 'ONLINE' | 'COMPLIMENTARY' | 'PAY_AT_COUNTER';
export type BillStatus = 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED';

export interface LoyaltyAccount {
  points: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  history: LoyaltyTransaction[];
}

export interface LoyaltyTransaction {
  id: string;
  date: string;
  time: string;
  type: 'EARNED' | 'REDEEMED';
  points: number;
  billNumber?: string;
  description: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  date: string;
  time: string;
  customerName?: string;
  customerPhone?: string;
  tableNo?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: BillStatus;
  createdBy: string;
  createdById?: string;
  createdByRole?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discountPercent: number;
  badgeText: string;
  startDate: string;
  endDate: string;
  applicableCategories?: string[];
  bannerImage?: string;
  isActive: boolean;
}

export interface ShopStatus {
  isOpen: boolean;
  statusMessage: string;
  openingHours: string;
  phone: string;
  address: string;
  googleReviewUrl: string;
  googleMapsUrl: string;
}

export interface NotificationRequest {
  id: string;
  email: string;
  productId: string;
  productName: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedAddOns: AddOnOption[];
}

export interface AnalyticsData {
  salesToday: number;
  totalBillsToday: number;
  totalProducts: number;
  lowStockCount: number;
  topBrew: {
    name: string;
    count: number;
    revenue: number;
    image: string;
  };
  topProducts?: {
    name: string;
    count: number;
    revenue: number;
  }[];
  categoryStats: {
    category: string;
    revenue: number;
    sold: number;
    count: number;
  }[];
  recentHourlySales: {
    hour: string;
    sales: number;
  }[];
  weeklySales: {
    day: string;
    sales: number;
  }[];
}
