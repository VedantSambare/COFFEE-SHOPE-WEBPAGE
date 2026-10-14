import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Product,
  Category,
  InventoryItem,
  Bill,
  Offer,
  ShopStatus,
  NotificationRequest,
  User,
  AnalyticsData,
  PaymentMethod,
} from '../src/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_OFFERS,
  INITIAL_SHOP_STATUS,
} from './seedData';

interface StoredUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  categories: Category[];
  products: Product[];
  inventory: InventoryItem[];
  bills: Bill[];
  offers: Offer[];
  shopStatus: ShopStatus;
  notifications: NotificationRequest[];
  lastUpdated: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'coffee_aroma_db.json');

class DatabaseEngine {
  private data!: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.isInitialized = true;
        return;
      } catch (e) {
        console.error('Error reading existing database, regenerating seeds:', e);
      }
    }

    // Seed new database
    const adminPass = process.env.ADMIN_DEFAULT_PASS || 'rutik@4465';
    const adminUser = process.env.ADMIN_DEFAULT_USER || 'rutik_mane';
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync(adminPass, salt);
    const employeeHash = bcrypt.hashSync('staff@123', salt);

    const initialUsers: StoredUser[] = [
      {
        id: 'usr-admin-01',
        username: adminUser,
        name: 'Rutik Mane',
        role: 'ADMIN',
        phone: '+91 7709054465',
        status: 'ACTIVE',
        passwordHash: adminHash,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-emp-01',
        username: 'priya_staff',
        name: 'Priya Sharma',
        role: 'EMPLOYEE',
        phone: '+91 9823412345',
        status: 'ACTIVE',
        passwordHash: employeeHash,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-emp-02',
        username: 'rohit_barista',
        name: 'Rohit Deshmukh (Lead Barista)',
        role: 'EMPLOYEE',
        phone: '+91 9765432190',
        status: 'ACTIVE',
        passwordHash: employeeHash,
        createdAt: new Date().toISOString(),
      }
    ];

    // Seed realistic bills for today and past week
    const now = new Date();
    const sampleBills: Bill[] = [];
    const methods: PaymentMethod[] = ['ONLINE', 'CASH', 'PAY_AT_COUNTER', 'ONLINE', 'CASH'];

    // Generate ~42 bills for today and recent days
    for (let i = 1; i <= 42; i++) {
      const isToday = i > 12;
      const billDate = new Date(now.getTime() - (isToday ? (42 - i) * 15 * 60000 : (42 - i) * 4 * 3600000));
      const method = methods[i % methods.length];
      
      const billItems = [
        {
          productId: 'prod-cappuccino',
          productName: 'Cappuccino',
          price: 99,
          quantity: (i % 3) + 1,
          selectedAddOns: i % 2 === 0 ? [{ name: 'Extra Shot', price: 30 }] : [],
          subtotal: 99 * ((i % 3) + 1) + (i % 2 === 0 ? 30 : 0),
        }
      ];

      if (i % 2 === 0) {
        billItems.push({
          productId: 'prod-nutella-pancake',
          productName: 'Nutella Hazelnut Pancake',
          price: 149,
          quantity: 1,
          selectedAddOns: [{ name: 'Whipped Cream', price: 20 }],
          subtotal: 169,
        });
      } else if (i % 3 === 0) {
        billItems.push({
          productId: 'prod-tiramisu-cheesecake-latte',
          productName: 'Tiramisu Cheesecake Latte',
          price: 169,
          quantity: 1,
          selectedAddOns: [],
          subtotal: 169,
        });
      }

      const subtotal = billItems.reduce((acc, it) => acc + it.subtotal, 0);
      const discount = i % 4 === 0 ? 20 : 0;
      const total = subtotal - discount;

      sampleBills.push({
        id: `bill-${1000 + i}`,
        billNumber: `CA-${1000 + i}`,
        date: billDate.toISOString().split('T')[0],
        time: billDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        customerName: `Guest ${i}`,
        customerPhone: `+91 98230000${(i < 10 ? '0' : '') + i}`,
        tableNo: `T-${(i % 8) + 1}`,
        items: billItems,
        subtotal,
        discount,
        total,
        paymentMethod: method,
        status: 'PAID',
        createdBy: i % 2 === 0 ? 'Rutik Mane' : 'Priya Sharma',
        createdAt: billDate.toISOString(),
      });
    }

    this.data = {
      users: initialUsers,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      inventory: INITIAL_INVENTORY,
      bills: sampleBills,
      offers: INITIAL_OFFERS,
      shopStatus: INITIAL_SHOP_STATUS,
      notifications: [
        {
          id: 'notif-1',
          email: 'customer.aroma@gmail.com',
          productId: 'prod-cold-brew',
          productName: 'Signature Cold Brew',
          date: new Date(Date.now() - 3600000).toISOString(),
        }
      ],
      lastUpdated: new Date().toISOString(),
    };

    this.save();
    this.isInitialized = true;
  }

  private save() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to database JSON file:', e);
    }
  }

  // --- Users & Auth ---
  getUserByUsername(username: string): StoredUser | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getPublicUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  createUser(userData: Omit<StoredUser, 'id' | 'createdAt'>): User {
    const newUser: StoredUser = {
      ...userData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    const { passwordHash, ...pub } = newUser;
    return pub;
  }

  updateUser(id: string, updates: Partial<StoredUser>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    const { passwordHash, ...pub } = this.data.users[index];
    return pub;
  }

  deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.save();
    return this.data.products[index];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  createCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.categories[index] = { ...this.data.categories[index], ...updates };
    this.save();
    return this.data.categories[index];
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Inventory ---
  getInventory(): InventoryItem[] {
    return this.data.inventory;
  }

  createInventoryItem(item: Omit<InventoryItem, 'id' | 'lastRestocked'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lastRestocked: new Date().toISOString(),
    };
    this.data.inventory.push(newItem);
    this.save();
    return newItem;
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const index = this.data.inventory.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.data.inventory[index] = {
      ...this.data.inventory[index],
      ...updates,
      lastRestocked: updates.quantity ? new Date().toISOString() : this.data.inventory[index].lastRestocked,
    };
    this.save();
    return this.data.inventory[index];
  }

  deleteInventoryItem(id: string): boolean {
    const initialLen = this.data.inventory.length;
    this.data.inventory = this.data.inventory.filter(i => i.id !== id);
    if (this.data.inventory.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Deduct inventory recipe requirements
  deductInventoryForBill(items: { productId: string; quantity: number }[]) {
    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (!product || !product.ingredients) continue;

      for (const recipe of product.ingredients) {
        const invItem = this.data.inventory.find(i => i.id === recipe.ingredientId || i.name.toLowerCase().includes(recipe.name.toLowerCase()));
        if (invItem) {
          const totalDeduct = recipe.amount * item.quantity;
          invItem.quantity = Math.max(0, invItem.quantity - totalDeduct);
        }
      }

      // Also reduce product inventoryQuantity
      if (product.inventoryQuantity > 0) {
        product.inventoryQuantity = Math.max(0, product.inventoryQuantity - item.quantity);
        if (product.inventoryQuantity === 0) {
          product.availability = false;
        }
      }
    }
    this.save();
  }

  // --- Bills ---
  getBills(): Bill[] {
    return this.data.bills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBillById(id: string): Bill | undefined {
    return this.data.bills.find(b => b.id === id || b.billNumber === id);
  }

  createBill(billData: Omit<Bill, 'id' | 'billNumber' | 'date' | 'time' | 'createdAt'>): Bill {
    const now = new Date();
    const count = this.data.bills.length + 1001;
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber: `CA-${count}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      createdAt: now.toISOString(),
    };

    this.data.bills.unshift(newBill);

    // Auto deduct inventory
    this.deductInventoryForBill(billData.items.map(i => ({ productId: i.productId, quantity: i.quantity })));

    this.save();
    return newBill;
  }

  deleteBill(id: string): boolean {
    const initialLen = this.data.bills.length;
    this.data.bills = this.data.bills.filter(b => b.id !== id && b.billNumber !== id);
    if (this.data.bills.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  clearAllBills(): boolean {
    this.data.bills = [];
    this.save();
    return true;
  }

  // --- Offers ---
  getOffers(): Offer[] {
    return this.data.offers;
  }

  createOffer(offerData: Omit<Offer, 'id'>): Offer {
    const newOffer: Offer = {
      ...offerData,
      id: `off-${Date.now()}`,
    };
    this.data.offers.unshift(newOffer);
    this.save();
    return newOffer;
  }

  updateOffer(id: string, updates: Partial<Offer>): Offer | null {
    const index = this.data.offers.findIndex(o => o.id === id);
    if (index === -1) return null;
    this.data.offers[index] = { ...this.data.offers[index], ...updates };
    this.save();
    return this.data.offers[index];
  }

  deleteOffer(id: string): boolean {
    const initialLen = this.data.offers.length;
    this.data.offers = this.data.offers.filter(o => o.id !== id);
    if (this.data.offers.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Shop Status ---
  getShopStatus(): ShopStatus {
    return this.data.shopStatus;
  }

  updateShopStatus(updates: Partial<ShopStatus>): ShopStatus {
    this.data.shopStatus = { ...this.data.shopStatus, ...updates };
    this.save();
    return this.data.shopStatus;
  }

  // --- Notifications ---
  getNotifications(): NotificationRequest[] {
    return this.data.notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addNotification(email: string, productId: string, productName: string): NotificationRequest {
    const newNotif: NotificationRequest = {
      id: `notif-${Date.now()}`,
      email,
      productId,
      productName,
      date: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  // --- Analytics ---
  getAnalytics(): AnalyticsData {
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const todayBills = this.data.bills.filter(b => {
      if (b.date === todayStr) return true;
      if (b.createdAt) {
        try {
          const billIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(b.createdAt));
          return billIST === todayStr;
        } catch {
          return false;
        }
      }
      return false;
    });

    const validTodayBills = todayBills.filter(b => b.status !== 'CANCELLED');
    const salesToday = validTodayBills.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
    const totalBillsToday = validTodayBills.length;
    const totalProducts = this.data.products.length;
    const lowStockCount = this.data.inventory.filter(i => (Number(i.quantity) || 0) <= (Number(i.minStock) || 0)).length;

    // Calculate product sales breakdown from active bills
    const productSoldMap = new Map<string, { count: number; revenue: number; name: string; image: string }>();
    for (const bill of this.data.bills.filter(b => b.status !== 'CANCELLED')) {
      for (const item of (bill.items || [])) {
        const prod = this.getProductById(item.productId);
        const existing = productSoldMap.get(item.productId) || {
          count: 0,
          revenue: 0,
          name: item.productName || prod?.name || 'Product',
          image: prod?.image || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
        };
        existing.count += (Number(item.quantity) || 0);
        existing.revenue += (Number(item.subtotal) || 0);
        productSoldMap.set(item.productId, existing);
      }
    }

    let topBrew = {
      name: 'Awaiting Orders Today',
      count: 0,
      revenue: 0,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    };

    if (productSoldMap.size > 0) {
      const sorted = Array.from(productSoldMap.values()).sort((a, b) => b.count - a.count);
      if (sorted[0] && sorted[0].count > 0) {
        topBrew = sorted[0];
      }
    }

    // Category stats
    const catMap = new Map<string, { revenue: number; sold: number; count: number }>();
    for (const cat of this.data.categories) {
      const prodInCat = this.data.products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase());
      catMap.set(cat.name, { revenue: 0, sold: 0, count: prodInCat.length });
    }

    for (const bill of this.data.bills.filter(b => b.status !== 'CANCELLED')) {
      for (const item of (bill.items || [])) {
        const prod = this.getProductById(item.productId);
        const catName = prod?.category || 'Speciality Coffees';
        const existing = catMap.get(catName) || { revenue: 0, sold: 0, count: 1 };
        existing.revenue += (Number(item.subtotal) || 0);
        existing.sold += (Number(item.quantity) || 0);
        catMap.set(catName, existing);
      }
    }

    const categoryStats = Array.from(catMap.entries()).map(([category, stat]) => ({
      category,
      revenue: stat.revenue || 0,
      sold: stat.sold || 0,
      count: stat.count || 0,
    }));

    // Hourly sales for today (8 AM to 11 PM) dynamically calculated from today's orders
    const hourBuckets: Record<string, number> = {
      '08:00': 0,
      '10:00': 0,
      '12:00': 0,
      '14:00': 0,
      '16:00': 0,
      '18:00': 0,
      '20:00': 0,
      '22:00': 0,
    };

    for (const bill of validTodayBills) {
      if (bill.createdAt) {
        try {
          const d = new Date(bill.createdAt);
          const hour = d.getHours();
          if (hour < 9) hourBuckets['08:00'] += (Number(bill.total) || 0);
          else if (hour < 11) hourBuckets['10:00'] += (Number(bill.total) || 0);
          else if (hour < 13) hourBuckets['12:00'] += (Number(bill.total) || 0);
          else if (hour < 15) hourBuckets['14:00'] += (Number(bill.total) || 0);
          else if (hour < 17) hourBuckets['16:00'] += (Number(bill.total) || 0);
          else if (hour < 19) hourBuckets['18:00'] += (Number(bill.total) || 0);
          else if (hour < 21) hourBuckets['20:00'] += (Number(bill.total) || 0);
          else hourBuckets['22:00'] += (Number(bill.total) || 0);
        } catch {}
      }
    }

    const recentHourlySales = Object.entries(hourBuckets).map(([hour, sales]) => ({
      hour,
      sales: Math.round(sales),
    }));

    // Weekly sales dynamically calculated from past 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daySalesMap: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const bill of this.data.bills.filter(b => b.status !== 'CANCELLED')) {
      try {
        const billDate = new Date(bill.createdAt || bill.date);
        if (billDate >= sevenDaysAgo) {
          const dayName = dayNames[billDate.getDay()];
          if (daySalesMap[dayName] !== undefined) {
            daySalesMap[dayName] += (Number(bill.total) || 0);
          }
        }
      } catch {}
    }

    const weeklySales = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      sales: Math.round(daySalesMap[day] || 0),
    }));

    return {
      salesToday: Math.round(salesToday),
      totalBillsToday,
      totalProducts,
      lowStockCount,
      topBrew,
      categoryStats,
      recentHourlySales,
      weeklySales,
    };
  }
}

export const db = new DatabaseEngine();
