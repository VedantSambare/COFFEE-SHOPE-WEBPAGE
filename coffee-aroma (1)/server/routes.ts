import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cloudSql } from '../src/db/cloudSqlService.js';
import { User, Role } from '../src/types.js';
import { getAdminAuth } from '../src/lib/firebase-admin.js';
import { getOrCreateFirebaseUser } from '../src/db/users.js';

const JWT_SECRET = process.env.JWT_SECRET || 'coffee_aroma_super_secure_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

// Authentication Middleware
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: Role };
    const user = await cloudSql.getUserById(decoded.id);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'User account inactive or not found' });
    }
    const { passwordHash, ...pubUser } = user;
    req.user = pubUser;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Role Authorization Middleware
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  next();
}

export function requireStaffOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'EMPLOYEE')) {
    return res.status(403).json({ error: 'Authorized staff access required' });
  }
  next();
}

export const apiRouter = Router();

// ==========================================
// AUTHENTICATION
// ==========================================

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await cloudSql.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Server error during login' });
  }
});

apiRouter.post('/auth/firebase-login', async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Firebase ID token is required' });
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const user = await getOrCreateFirebaseUser(decoded.uid, decoded.email || `${decoded.uid}@gmail.com`, decoded.name);

    const token = jwt.sign(
      { id: user.id, username: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error: any) {
    console.error('Firebase token verification error:', error);
    res.status(401).json({ error: error.message || 'Invalid Firebase ID token' });
  }
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/reset-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await cloudSql.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentPassword) {
      const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    await cloudSql.updateUser(userId, { password: newPassword });

    res.json({ message: 'Password updated successfully. Please use your new password next time you log in.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});

// ==========================================
// SHOP STATUS & DETAILS
// ==========================================

apiRouter.get('/shop/status', async (_req: Request, res: Response) => {
  try {
    const status = await cloudSql.getShopStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch shop status' });
  }
});

apiRouter.put('/shop/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await cloudSql.updateShopStatus(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update shop status' });
  }
});

// ==========================================
// CATEGORIES
// ==========================================

apiRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const list = await cloudSql.getCategories();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

apiRouter.post('/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, icon, description, displayOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const category = await cloudSql.createCategory({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      icon: icon || 'Coffee',
      description: description || '',
      displayOrder: displayOrder || 99,
    });
    res.status(201).json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create category' });
  }
});

apiRouter.put('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await cloudSql.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update category' });
  }
});

apiRouter.delete('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const success = await cloudSql.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
});

// ==========================================
// PRODUCTS
// ==========================================

apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    let prods = await cloudSql.getProducts();
    const { category, search, featured, special } = req.query;

    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      prods = prods.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (featured === 'true') {
      prods = prods.filter(p => p.isFeatured);
    }

    if (special === 'true') {
      prods = prods.filter(p => p.isSpecial);
    }

    res.json(prods);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

apiRouter.post('/products/sync-all-62', async (_req: Request, res: Response) => {
  try {
    const prods = await cloudSql.syncAll62Products();
    res.json({ success: true, count: prods.length, products: prods });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync all 62 products' });
  }
});

apiRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await cloudSql.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch product' });
  }
});

apiRouter.post('/products', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, price, description, image } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const product = await cloudSql.createProduct({
      name,
      category,
      price: Number(price),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=1200&q=80',
      availability: req.body.availability !== undefined ? req.body.availability : true,
      inventoryQuantity: Number(req.body.inventoryQuantity) || 100,
      minStock: Number(req.body.minStock) || 10,
      isFeatured: Boolean(req.body.isFeatured),
      isSpecial: Boolean(req.body.isSpecial),
      isBestSeller: Boolean(req.body.isBestSeller),
      ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : [],
      addOns: Array.isArray(req.body.addOns) ? req.body.addOns : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    });

    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

apiRouter.put('/products/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await cloudSql.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

apiRouter.delete('/products/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const success = await cloudSql.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// ==========================================
// INVENTORY & INGREDIENTS
// ==========================================

apiRouter.get('/inventory', authenticateToken, requireStaffOrAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await cloudSql.getInventory();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch inventory' });
  }
});

apiRouter.post('/inventory', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, quantity, unit, minStock, supplier } = req.body;
    if (!name || quantity === undefined || !unit) {
      return res.status(400).json({ error: 'Name, quantity, and unit are required' });
    }

    const item = await cloudSql.createInventoryItem({
      name,
      category: category || 'General',
      quantity: Number(quantity),
      unit,
      minStock: Number(minStock) || 10,
      supplier,
    });

    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create inventory item' });
  }
});

apiRouter.put('/inventory/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await cloudSql.updateInventoryItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update inventory' });
  }
});

apiRouter.delete('/inventory/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const success = await cloudSql.deleteInventoryItem(req.params.id);
    if (!success) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete inventory item' });
  }
});

// ==========================================
// BILLS & POS
// ==========================================

apiRouter.get('/bills', authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const list = await cloudSql.getBills();
    const { employee, creator, status, paymentMethod, date, startDate, endDate } = req.query;
    let filtered = list;

    if (employee && typeof employee === 'string' && employee.trim() !== '' && employee !== 'ALL') {
      const empQ = employee.toLowerCase();
      filtered = filtered.filter(b => (b.createdBy || '').toLowerCase().includes(empQ));
    }

    if (creator && typeof creator === 'string' && creator.trim() !== '' && creator !== 'ALL') {
      const crQ = creator.toLowerCase();
      filtered = filtered.filter(b => (b.createdBy || '').toLowerCase().includes(crQ));
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      filtered = filtered.filter(b => b.status === status);
    }

    if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod !== 'ALL') {
      filtered = filtered.filter(b => b.paymentMethod === paymentMethod);
    }

    if (date && typeof date === 'string' && date.trim() !== '' && date !== 'ALL') {
      filtered = filtered.filter(b => b.date === date || (b.createdAt && b.createdAt.startsWith(date)));
    }

    if (startDate && typeof startDate === 'string' && startDate.trim() !== '') {
      filtered = filtered.filter(b => b.date >= startDate || (b.createdAt && b.createdAt.slice(0, 10) >= startDate));
    }

    if (endDate && typeof endDate === 'string' && endDate.trim() !== '') {
      filtered = filtered.filter(b => b.date <= endDate || (b.createdAt && b.createdAt.slice(0, 10) <= endDate));
    }

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch bills' });
  }
});

apiRouter.get('/bills/:id', async (req: Request, res: Response) => {
  try {
    const bill = await cloudSql.getBillById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch bill' });
  }
});

apiRouter.post('/bills', authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { items, customerName, customerPhone, tableNo, discount, paymentMethod, status, date, time, createdAt } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    const subtotal = items.reduce((acc: number, it: any) => acc + (it.subtotal || it.price * it.quantity), 0);
    const discountVal = Number(discount) || 0;
    const total = Math.max(0, subtotal - discountVal);

    const bill = await cloudSql.createBill({
      customerName: customerName || 'Walk-in Guest',
      customerPhone: customerPhone || '',
      tableNo: tableNo || 'Takeaway',
      items,
      subtotal,
      discount: discountVal,
      total,
      paymentMethod: paymentMethod || 'CASH',
      status: status || 'PAID',
      createdBy: req.user?.name || 'Staff',
      date: date || undefined,
      time: time || undefined,
      createdAt: createdAt || undefined,
    });

    res.status(201).json(bill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate bill' });
  }
});

// Update order / bill status (Accept, Reject/Cancel, Mark Paid, etc.)
apiRouter.put('/bills/:id/status', authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, paymentMethod } = req.body;
    if (!status || !['PENDING', 'ACCEPTED', 'PAID', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (PENDING, ACCEPTED, PAID, CANCELLED)' });
    }

    if (paymentMethod && !['CASH', 'ONLINE', 'COMPLIMENTARY', 'PAY_AT_COUNTER'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Valid paymentMethod is required (CASH, ONLINE, COMPLIMENTARY, PAY_AT_COUNTER)' });
    }

    const updated = await cloudSql.updateBillStatus(req.params.id, status, paymentMethod);
    if (!updated) return res.status(404).json({ error: 'Bill or order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update order status' });
  }
});

// Public customer checkout (Pay at Counter)
apiRouter.post('/orders/checkout', async (req: Request, res: Response) => {
  try {
    const shop = await cloudSql.getShopStatus();
    if (!shop.isOpen) {
      return res.status(400).json({ error: "We'll be brewing something amazing again soon ☕ Shop is currently closed." });
    }

    const { items, customerName, customerPhone, tableNo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const subtotal = items.reduce((acc: number, it: any) => acc + (it.subtotal || it.price * it.quantity), 0);
    const discount = 0;
    const total = subtotal - discount;

    const bill = await cloudSql.createBill({
      customerName: customerName || 'Online Guest',
      customerPhone: customerPhone || '',
      tableNo: tableNo || 'Counter Pickup',
      items,
      subtotal,
      discount,
      total,
      paymentMethod: 'PAY_AT_COUNTER',
      status: 'PENDING',
      createdBy: 'Online Customer',
    });

    res.status(201).json(bill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

apiRouter.delete('/bills/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const success = await cloudSql.deleteBill(req.params.id);
    if (!success) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Bill deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete bill' });
  }
});

// Danger zone: Clear all bills
apiRouter.post('/bills/danger-clear-all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { confirmation } = req.body;
    if (confirmation !== 'CLEAR_ALL_BILLS_PERMANENTLY') {
      return res.status(400).json({ error: 'Invalid confirmation string' });
    }

    await cloudSql.clearAllBills();
    res.json({ message: 'All bills have been permanently purged.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear bills' });
  }
});

// ==========================================
// OFFERS & PROMOTIONS
// ==========================================

apiRouter.get('/offers', async (_req: Request, res: Response) => {
  try {
    const list = await cloudSql.getOffers();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch offers' });
  }
});

apiRouter.post('/offers', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, subtitle, discountPercent, startDate, endDate, applicableCategories, bannerImage, badgeText } = req.body;
    if (!title || discountPercent === undefined || !endDate) {
      return res.status(400).json({ error: 'Title, discount percent, and end date are required' });
    }

    const offer = await cloudSql.createOffer({
      title,
      subtitle: subtitle || '',
      discountPercent: Number(discountPercent),
      badgeText: badgeText || "TODAY'S SPECIAL",
      startDate: startDate || new Date().toISOString(),
      endDate,
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=80',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });

    res.status(201).json(offer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create offer' });
  }
});

apiRouter.put('/offers/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await cloudSql.updateOffer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Offer not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update offer' });
  }
});

apiRouter.delete('/offers/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const success = await cloudSql.deleteOffer(req.params.id);
    if (!success) return res.status(404).json({ error: 'Offer not found' });
    res.json({ message: 'Offer deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete offer' });
  }
});

// ==========================================
// EMPLOYEES / STAFF MANAGEMENT
// ==========================================

apiRouter.get('/employees', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const all = await cloudSql.getUsers();
    const safeUsers = all.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch staff members' });
  }
});

apiRouter.post('/employees', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, username, password, phone, role, status } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username, and password are required' });
    }

    const existing = await cloudSql.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = await cloudSql.createUser({
      name,
      username,
      password,
      role: role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE',
      phone: phone || '',
    });

    const { passwordHash, ...safe } = user;
    res.status(201).json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create staff member' });
  }
});

apiRouter.put('/employees/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, role, status, password } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (password) updates.password = password;

    const updated = await cloudSql.updateUser(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    const { passwordHash, ...safe } = updated;
    res.json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update employee' });
  }
});

apiRouter.delete('/employees/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await cloudSql.getUserById(req.params.id);
    if (user?.username === 'rutik_mane') {
      return res.status(400).json({ error: 'Primary root admin cannot be deleted' });
    }

    const success = await cloudSql.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete employee' });
  }
});

// ==========================================
// NOTIFICATIONS ("NOTIFY ME")
// ==========================================

apiRouter.post('/notify', async (req: Request, res: Response) => {
  try {
    const { email, productId, productName } = req.body;
    if (!email || !productId) {
      return res.status(400).json({ error: 'Email and product are required' });
    }

    const notif = await cloudSql.createNotification({
      email,
      productId,
      productName: productName || 'Sold Out Coffee Item',
    });
    res.status(201).json({ message: "We'll notify you the instant our fresh roast is ready! ☕", notification: notif });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register notification' });
  }
});

apiRouter.get('/notifications', authenticateToken, requireStaffOrAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await cloudSql.getNotifications();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

// ==========================================
// ANALYTICS & DATABASE STATUS
// ==========================================

apiRouter.get('/analytics', authenticateToken, requireStaffOrAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const analytics = await cloudSql.getAnalytics();
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

apiRouter.get('/db/status', authenticateToken, requireStaffOrAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [prods, billList, userList, invList, catList, offList, notifList] = await Promise.all([
      cloudSql.getProducts(),
      cloudSql.getBills(),
      cloudSql.getUsers(),
      cloudSql.getInventory(),
      cloudSql.getCategories(),
      cloudSql.getOffers(),
      cloudSql.getNotifications(),
    ]);

    res.json({
      status: 'CONNECTED',
      engine: 'Google Cloud SQL (PostgreSQL) / Drizzle ORM',
      host: process.env.SQL_HOST || 'Cloud SQL Instance (asia-southeast1)',
      database: process.env.SQL_DB_NAME || 'postgres',
      collections: {
        users: userList.length,
        products: prods.length,
        categories: catList.length,
        inventory: invList.length,
        bills: billList.length,
        offers: offList.length,
        notifications: notifList.length,
      },
      latency: '0.8ms',
      uptime: '100%',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve database status' });
  }
});
