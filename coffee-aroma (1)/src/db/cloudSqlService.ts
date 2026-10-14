import { db } from './index.js';
import {
  users,
  categories,
  products,
  inventory,
  bills,
  offers,
  shopStatus,
  notifications,
} from './schema.js';
import { eq, desc } from 'drizzle-orm';
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
} from '../types.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_OFFERS,
  INITIAL_SHOP_STATUS,
} from '../../server/seedData.js';

export interface StoredUser extends User {
  passwordHash: string;
}

export class CloudSQLService {
  private seeded = false;

  async ensureSeeded() {
    if (this.seeded) return;
    try {
      // Check and seed users
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length === 0) {
        console.log('🌱 Seeding initial user accounts into Cloud SQL...');
        const adminPass = process.env.ADMIN_DEFAULT_PASS || 'rutik@4465';
        const adminUser = process.env.ADMIN_DEFAULT_USER || 'rutik_mane';
        const salt = bcrypt.genSaltSync(10);
        const adminHash = bcrypt.hashSync(adminPass, salt);
        const employeeHash = bcrypt.hashSync('staff@123', salt);

        await db.insert(users).values([
          {
            id: 'usr-admin-01',
            username: adminUser,
            name: 'Rutik Mane',
            role: 'ADMIN',
            phone: '+91 7709054465',
            status: 'ACTIVE',
            passwordHash: adminHash,
          },
          {
            id: 'usr-emp-01',
            username: 'priya_staff',
            name: 'Priya Sharma',
            role: 'EMPLOYEE',
            phone: '+91 9823412345',
            status: 'ACTIVE',
            passwordHash: employeeHash,
          },
          {
            id: 'usr-emp-02',
            username: 'rohit_barista',
            name: 'Rohit Deshmukh (Lead Barista)',
            role: 'EMPLOYEE',
            phone: '+91 9765432190',
            status: 'ACTIVE',
            passwordHash: employeeHash,
          },
        ]).onConflictDoNothing();
      }

      // Sync/Update Categories
      for (const cat of INITIAL_CATEGORIES) {
        const existing = await db.select().from(categories).where(eq(categories.id, cat.id));
        if (existing.length === 0) {
          await db.insert(categories).values({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            description: cat.description,
            displayOrder: cat.displayOrder,
          });
        } else {
          await db.update(categories).set({
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            description: cat.description,
            displayOrder: cat.displayOrder,
          }).where(eq(categories.id, cat.id));
        }
      }

      // Remove obsolete categories that are not in INITIAL_CATEGORIES
      const allowedCategoryIds = new Set(INITIAL_CATEGORIES.map((c) => c.id));
      const allDbCategories = await db.select().from(categories);
      for (const c of allDbCategories) {
        if (!allowedCategoryIds.has(c.id)) {
          await db.delete(categories).where(eq(categories.id, c.id));
        }
      }

      // Sync/Update Official Menu Products
      for (const prod of INITIAL_PRODUCTS) {
        const existing = await db.select().from(products).where(eq(products.id, prod.id));
        if (existing.length === 0) {
          await db.insert(products).values({
            id: prod.id,
            name: prod.name,
            category: prod.category,
            price: prod.price,
            description: prod.description,
            image: prod.image,
            availability: prod.availability,
            inventoryQuantity: prod.inventoryQuantity ?? 150,
            minStock: prod.minStock ?? 15,
            isFeatured: prod.isFeatured ?? false,
            isSpecial: prod.isSpecial ?? false,
            isBestSeller: prod.isBestSeller ?? false,
            ingredients: prod.ingredients ?? [],
            addOns: prod.addOns ?? [],
            tags: prod.tags ?? [],
          });
        } else {
          await db.update(products).set({
            name: prod.name,
            category: prod.category,
            price: prod.price,
            description: prod.description,
            image: prod.image,
            isSpecial: prod.isSpecial ?? false,
            isBestSeller: prod.isBestSeller ?? false,
            isFeatured: prod.isFeatured ?? false,
            tags: prod.tags ?? [],
          }).where(eq(products.id, prod.id));
        }
      }

      // Remove obsolete products not in INITIAL_PRODUCTS
      const allowedProductIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
      const allDbProducts = await db.select().from(products);
      for (const p of allDbProducts) {
        if (!allowedProductIds.has(p.id)) {
          await db.delete(products).where(eq(products.id, p.id));
        }
      }

      // Seed Inventory
      for (const inv of INITIAL_INVENTORY) {
        await db.insert(inventory).values({
          id: inv.id,
          name: inv.name,
          category: inv.category,
          quantity: inv.quantity,
          unit: inv.unit,
          minStock: inv.minStock,
          supplier: inv.supplier,
        }).onConflictDoNothing();
      }

      // Seed Offers
      for (const off of INITIAL_OFFERS) {
        await db.insert(offers).values({
          id: off.id,
          title: off.title,
          subtitle: off.subtitle,
          discountPercent: off.discountPercent,
          badgeText: off.badgeText,
          startDate: off.startDate,
          endDate: off.endDate,
          applicableCategories: off.applicableCategories,
          bannerImage: off.bannerImage,
          isActive: off.isActive,
        }).onConflictDoNothing();
      }

      // Seed Shop Status
      await db.insert(shopStatus).values({
        id: 'main_shop_status',
        isOpen: INITIAL_SHOP_STATUS.isOpen,
        statusMessage: INITIAL_SHOP_STATUS.statusMessage,
        openingHours: INITIAL_SHOP_STATUS.openingHours,
        phone: INITIAL_SHOP_STATUS.phone,
        address: INITIAL_SHOP_STATUS.address,
        googleReviewUrl: INITIAL_SHOP_STATUS.googleReviewUrl,
        googleMapsUrl: INITIAL_SHOP_STATUS.googleMapsUrl,
      }).onConflictDoNothing();

      console.log(`✅ Cloud SQL: All ${INITIAL_PRODUCTS.length} Official Products Verified & Synced!`);
      this.seeded = true;
    } catch (err) {
      console.error('⚠️ Could not complete Cloud SQL seeding:', err);
    }
  }

  async syncAll62Products(): Promise<Product[]> {
    for (const prod of INITIAL_PRODUCTS) {
      const existing = await db.select().from(products).where(eq(products.id, prod.id));
      if (existing.length === 0) {
        await db.insert(products).values({
          id: prod.id,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          description: prod.description,
          image: prod.image,
          availability: prod.availability,
          inventoryQuantity: prod.inventoryQuantity ?? 150,
          minStock: prod.minStock ?? 15,
          isFeatured: prod.isFeatured ?? false,
          isSpecial: prod.isSpecial ?? false,
          isBestSeller: prod.isBestSeller ?? false,
          ingredients: prod.ingredients ?? [],
          addOns: prod.addOns ?? [],
          tags: prod.tags ?? [],
        });
      } else {
        await db.update(products).set({
          name: prod.name,
          category: prod.category,
          price: prod.price,
          description: prod.description,
          image: prod.image,
          isSpecial: prod.isSpecial ?? false,
          isBestSeller: prod.isBestSeller ?? false,
          isFeatured: prod.isFeatured ?? false,
          tags: prod.tags ?? [],
        }).where(eq(products.id, prod.id));
      }
    }

    // Prune obsolete products
    const allowedProductIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
    const allDbProducts = await db.select().from(products);
    for (const p of allDbProducts) {
      if (!allowedProductIds.has(p.id)) {
        await db.delete(products).where(eq(products.id, p.id));
      }
    }

    return this.getProducts();
  }

  // --- Users ---
  async getUsers(): Promise<StoredUser[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(users);
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      name: r.name,
      role: r.role as 'ADMIN' | 'EMPLOYEE',
      phone: r.phone || undefined,
      status: r.status as 'ACTIVE' | 'INACTIVE',
      createdAt: r.createdAt.toISOString(),
      passwordHash: r.passwordHash,
    }));
  }

  async getUserById(id: string): Promise<StoredUser | undefined> {
    await this.ensureSeeded();
    const rows = await db.select().from(users).where(eq(users.id, id));
    if (rows.length === 0) return undefined;
    const r = rows[0];
    return {
      id: r.id,
      username: r.username,
      name: r.name,
      role: r.role as 'ADMIN' | 'EMPLOYEE',
      phone: r.phone || undefined,
      status: r.status as 'ACTIVE' | 'INACTIVE',
      createdAt: r.createdAt.toISOString(),
      passwordHash: r.passwordHash,
    };
  }

  async getUserByUsername(username: string): Promise<StoredUser | undefined> {
    await this.ensureSeeded();
    const rows = await db.select().from(users).where(eq(users.username, username));
    if (rows.length === 0) return undefined;
    const r = rows[0];
    return {
      id: r.id,
      username: r.username,
      name: r.name,
      role: r.role as 'ADMIN' | 'EMPLOYEE',
      phone: r.phone || undefined,
      status: r.status as 'ACTIVE' | 'INACTIVE',
      createdAt: r.createdAt.toISOString(),
      passwordHash: r.passwordHash,
    };
  }

  async createUser(userData: {
    username: string;
    password: string;
    name: string;
    role: 'ADMIN' | 'EMPLOYEE';
    phone?: string;
  }): Promise<StoredUser> {
    await this.ensureSeeded();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);
    const newId = `usr-${Date.now()}`;

    const inserted = await db
      .insert(users)
      .values({
        id: newId,
        username: userData.username,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        status: 'ACTIVE',
        passwordHash,
      })
      .returning();

    const r = inserted[0];
    return {
      id: r.id,
      username: r.username,
      name: r.name,
      role: r.role as 'ADMIN' | 'EMPLOYEE',
      phone: r.phone || undefined,
      status: r.status as 'ACTIVE' | 'INACTIVE',
      createdAt: r.createdAt.toISOString(),
      passwordHash: r.passwordHash,
    };
  }

  async updateUser(
    id: string,
    updates: Partial<{ name: string; role: 'ADMIN' | 'EMPLOYEE'; phone?: string; status: 'ACTIVE' | 'INACTIVE'; password?: string }>
  ): Promise<StoredUser | null> {
    await this.ensureSeeded();
    const updateValues: Record<string, any> = {};
    if (updates.name !== undefined) updateValues.name = updates.name;
    if (updates.role !== undefined) updateValues.role = updates.role;
    if (updates.phone !== undefined) updateValues.phone = updates.phone;
    if (updates.status !== undefined) updateValues.status = updates.status;
    if (updates.password) {
      const salt = bcrypt.genSaltSync(10);
      updateValues.passwordHash = bcrypt.hashSync(updates.password, salt);
    }

    const rows = await db.update(users).set(updateValues).where(eq(users.id, id)).returning();
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      username: r.username,
      name: r.name,
      role: r.role as 'ADMIN' | 'EMPLOYEE',
      phone: r.phone || undefined,
      status: r.status as 'ACTIVE' | 'INACTIVE',
      createdAt: r.createdAt.toISOString(),
      passwordHash: r.passwordHash,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const rows = await db.delete(users).where(eq(users.id, id)).returning();
    return rows.length > 0;
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(categories);
    return rows
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        description: c.description,
        displayOrder: c.displayOrder,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    await this.ensureSeeded();
    const newId = `cat-${Date.now()}`;
    const inserted = await db
      .insert(categories)
      .values({
        id: newId,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        displayOrder: cat.displayOrder,
      })
      .returning();
    const c = inserted[0];
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      displayOrder: c.displayOrder,
    };
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await this.ensureSeeded();
    const rows = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    if (rows.length === 0) return null;
    const c = rows[0];
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      displayOrder: c.displayOrder,
    };
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const rows = await db.delete(categories).where(eq(categories.id, id)).returning();
    return rows.length > 0;
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(products);
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      availability: p.availability,
      inventoryQuantity: p.inventoryQuantity,
      minStock: p.minStock,
      isFeatured: p.isFeatured ?? false,
      isSpecial: p.isSpecial ?? false,
      isBestSeller: p.isBestSeller ?? false,
      ingredients: p.ingredients,
      addOns: p.addOns,
      tags: p.tags ?? [],
    }));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    await this.ensureSeeded();
    const rows = await db.select().from(products).where(eq(products.id, id));
    if (rows.length === 0) return undefined;
    const p = rows[0];
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      availability: p.availability,
      inventoryQuantity: p.inventoryQuantity,
      minStock: p.minStock,
      isFeatured: p.isFeatured ?? false,
      isSpecial: p.isSpecial ?? false,
      isBestSeller: p.isBestSeller ?? false,
      ingredients: p.ingredients,
      addOns: p.addOns,
      tags: p.tags ?? [],
    };
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    await this.ensureSeeded();

    // Auto-create category in categories table if it doesn't exist
    if (product.category && product.category.trim()) {
      const catTrimmed = product.category.trim();
      const existingCats = await db.select().from(categories).where(eq(categories.name, catTrimmed));
      if (existingCats.length === 0) {
        const catId = `cat-${catTrimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
        await db.insert(categories).values({
          id: catId,
          name: catTrimmed,
          slug: catTrimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: 'Coffee',
          description: `Artisanal ${catTrimmed} selection`,
          displayOrder: 99,
        }).onConflictDoNothing();
      }
    }

    const newId = `prod-${Date.now()}`;
    const inserted = await db
      .insert(products)
      .values({
        id: newId,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        image: product.image,
        availability: product.availability,
        inventoryQuantity: product.inventoryQuantity ?? 100,
        minStock: product.minStock ?? 10,
        isFeatured: product.isFeatured ?? false,
        isSpecial: product.isSpecial ?? false,
        isBestSeller: product.isBestSeller ?? false,
        ingredients: product.ingredients ?? [],
        addOns: product.addOns ?? [],
        tags: product.tags ?? [],
      })
      .returning();

    const p = inserted[0];
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      availability: p.availability,
      inventoryQuantity: p.inventoryQuantity,
      minStock: p.minStock,
      isFeatured: p.isFeatured ?? false,
      isSpecial: p.isSpecial ?? false,
      isBestSeller: p.isBestSeller ?? false,
      ingredients: p.ingredients,
      addOns: p.addOns,
      tags: p.tags ?? [],
    };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await this.ensureSeeded();

    // Auto-create category in categories table if it doesn't exist
    if (updates.category && updates.category.trim()) {
      const catTrimmed = updates.category.trim();
      const existingCats = await db.select().from(categories).where(eq(categories.name, catTrimmed));
      if (existingCats.length === 0) {
        const catId = `cat-${catTrimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
        await db.insert(categories).values({
          id: catId,
          name: catTrimmed,
          slug: catTrimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: 'Coffee',
          description: `Artisanal ${catTrimmed} selection`,
          displayOrder: 99,
        }).onConflictDoNothing();
      }
    }

    const updateValues: Record<string, any> = {};
    if (updates.name !== undefined) updateValues.name = updates.name;
    if (updates.category !== undefined) updateValues.category = updates.category;
    if (updates.price !== undefined) updateValues.price = Number(updates.price);
    if (updates.description !== undefined) updateValues.description = updates.description;
    if (updates.image !== undefined) updateValues.image = updates.image;
    if (updates.availability !== undefined) updateValues.availability = Boolean(updates.availability);
    if (updates.inventoryQuantity !== undefined) updateValues.inventoryQuantity = Number(updates.inventoryQuantity);
    if (updates.minStock !== undefined) updateValues.minStock = Number(updates.minStock);
    if (updates.isFeatured !== undefined) updateValues.isFeatured = Boolean(updates.isFeatured);
    if (updates.isSpecial !== undefined) updateValues.isSpecial = Boolean(updates.isSpecial);
    if (updates.isBestSeller !== undefined) updateValues.isBestSeller = Boolean(updates.isBestSeller);
    if (updates.ingredients !== undefined) updateValues.ingredients = updates.ingredients;
    if (updates.addOns !== undefined) updateValues.addOns = updates.addOns;
    if (updates.tags !== undefined) updateValues.tags = updates.tags;

    const rows = await db.update(products).set(updateValues).where(eq(products.id, id)).returning();
    if (rows.length === 0) return null;
    const p = rows[0];
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      availability: p.availability,
      inventoryQuantity: p.inventoryQuantity,
      minStock: p.minStock,
      isFeatured: p.isFeatured ?? false,
      isSpecial: p.isSpecial ?? false,
      isBestSeller: p.isBestSeller ?? false,
      ingredients: p.ingredients,
      addOns: p.addOns,
      tags: p.tags ?? [],
    };
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const rows = await db.delete(products).where(eq(products.id, id)).returning();
    return rows.length > 0;
  }

  // --- Inventory ---
  async getInventory(): Promise<InventoryItem[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(inventory);
    return rows.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      minStock: i.minStock,
      supplier: i.supplier || undefined,
      lastRestocked: i.lastRestocked.toISOString(),
    }));
  }

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'lastRestocked'>): Promise<InventoryItem> {
    await this.ensureSeeded();
    const newId = `inv-${Date.now()}`;
    const inserted = await db
      .insert(inventory)
      .values({
        id: newId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.minStock,
        supplier: item.supplier,
      })
      .returning();

    const i = inserted[0];
    return {
      id: i.id,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      minStock: i.minStock,
      supplier: i.supplier || undefined,
      lastRestocked: i.lastRestocked.toISOString(),
    };
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    await this.ensureSeeded();
    const updateValues: Record<string, any> = {};
    if (updates.name !== undefined) updateValues.name = updates.name;
    if (updates.category !== undefined) updateValues.category = updates.category;
    if (updates.quantity !== undefined) {
      updateValues.quantity = updates.quantity;
      updateValues.lastRestocked = new Date();
    }
    if (updates.unit !== undefined) updateValues.unit = updates.unit;
    if (updates.minStock !== undefined) updateValues.minStock = updates.minStock;
    if (updates.supplier !== undefined) updateValues.supplier = updates.supplier;

    const rows = await db.update(inventory).set(updateValues).where(eq(inventory.id, id)).returning();
    if (rows.length === 0) return null;
    const i = rows[0];
    return {
      id: i.id,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      minStock: i.minStock,
      supplier: i.supplier || undefined,
      lastRestocked: i.lastRestocked.toISOString(),
    };
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const rows = await db.delete(inventory).where(eq(inventory.id, id)).returning();
    return rows.length > 0;
  }

  // Deduct inventory recipe requirements
  async deductInventoryForBill(items: { productId: string; quantity: number }[]) {
    await this.ensureSeeded();
    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (!product || !product.ingredients) continue;

      for (const recipe of product.ingredients) {
        const invRows = await db.select().from(inventory);
        const invItem = invRows.find(
          (i) => i.id === recipe.ingredientId || i.name.toLowerCase().includes(recipe.name.toLowerCase())
        );
        if (invItem) {
          const totalDeduct = recipe.amount * item.quantity;
          const newQty = Math.max(0, invItem.quantity - totalDeduct);
          await db.update(inventory).set({ quantity: newQty }).where(eq(inventory.id, invItem.id));
        }
      }

      if (product.inventoryQuantity > 0) {
        const newProdQty = Math.max(0, product.inventoryQuantity - item.quantity);
        await db
          .update(products)
          .set({
            inventoryQuantity: newProdQty,
            availability: newProdQty > 0,
          })
          .where(eq(products.id, product.id));
      }
    }
  }

  // --- Bills ---
  async getBills(): Promise<Bill[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(bills).orderBy(desc(bills.createdAt));
    return rows.map((b) => ({
      id: b.id,
      billNumber: b.billNumber,
      date: b.date,
      time: b.time,
      customerName: b.customerName || undefined,
      customerPhone: b.customerPhone || undefined,
      tableNo: b.tableNo || undefined,
      items: b.items,
      subtotal: b.subtotal,
      discount: b.discount,
      total: b.total,
      paymentMethod: b.paymentMethod as PaymentMethod,
      status: (b.status === 'REFUNDED' ? 'CANCELLED' : b.status) as 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED',
      createdBy: b.createdBy,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async getBillById(id: string): Promise<Bill | undefined> {
    await this.ensureSeeded();
    const rows = await db.select().from(bills).where(eq(bills.id, id));
    if (rows.length === 0) {
      const alt = await db.select().from(bills).where(eq(bills.billNumber, id));
      if (alt.length === 0) return undefined;
      const b = alt[0];
      return {
        id: b.id,
        billNumber: b.billNumber,
        date: b.date,
        time: b.time,
        customerName: b.customerName || undefined,
        customerPhone: b.customerPhone || undefined,
        tableNo: b.tableNo || undefined,
        items: b.items,
        subtotal: b.subtotal,
        discount: b.discount,
        total: b.total,
        paymentMethod: b.paymentMethod as PaymentMethod,
        status: (b.status === 'REFUNDED' ? 'CANCELLED' : b.status) as 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED',
        createdBy: b.createdBy,
        createdAt: b.createdAt.toISOString(),
      };
    }
    const b = rows[0];
    return {
      id: b.id,
      billNumber: b.billNumber,
      date: b.date,
      time: b.time,
      customerName: b.customerName || undefined,
      customerPhone: b.customerPhone || undefined,
      tableNo: b.tableNo || undefined,
      items: b.items,
      subtotal: b.subtotal,
      discount: b.discount,
      total: b.total,
      paymentMethod: b.paymentMethod as PaymentMethod,
      status: (b.status === 'REFUNDED' ? 'CANCELLED' : b.status) as 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED',
      createdBy: b.createdBy,
      createdAt: b.createdAt.toISOString(),
    };
  }

  async createBill(billData: Omit<Bill, 'id' | 'billNumber' | 'date' | 'time' | 'createdAt'> & { date?: string; time?: string; createdAt?: string }): Promise<Bill> {
    await this.ensureSeeded();
    const now = new Date();
    
    // Generate a unique random 4 to 6 digit bill number (e.g. CA-8492 or CA-5192)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `bill-${Date.now()}-${randomSuffix}`;
    const billNumber = `CA-${randomSuffix}`;

    // Indian Standard Time (IST - Asia/Kolkata) or custom specified date
    const dateStr = billData.date || new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now); // "YYYY-MM-DD" e.g., "2026-09-10"

    const timeStr = billData.time || now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }); // "10:35 PM"

    const billCreatedAt = billData.createdAt
      ? new Date(billData.createdAt)
      : billData.date
      ? new Date(`${billData.date}T12:00:00Z`)
      : now;

    const inserted = await db
      .insert(bills)
      .values({
        id: newId,
        billNumber,
        date: dateStr,
        time: timeStr,
        customerName: billData.customerName,
        customerPhone: billData.customerPhone,
        tableNo: billData.tableNo,
        items: billData.items,
        subtotal: billData.subtotal,
        discount: billData.discount,
        total: billData.total,
        paymentMethod: billData.paymentMethod,
        status: billData.status || 'PAID',
        createdBy: billData.createdBy || 'ADMIN',
        createdAt: billCreatedAt,
      })
      .returning();

    // Auto deduct inventory recipe ingredients
    await this.deductInventoryForBill(billData.items);

    const b = inserted[0];
    return {
      id: b.id,
      billNumber: b.billNumber,
      date: b.date,
      time: b.time,
      customerName: b.customerName || undefined,
      customerPhone: b.customerPhone || undefined,
      tableNo: b.tableNo || undefined,
      items: b.items,
      subtotal: b.subtotal,
      discount: b.discount,
      total: b.total,
      paymentMethod: b.paymentMethod as PaymentMethod,
      status: (b.status === 'REFUNDED' ? 'CANCELLED' : b.status) as 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED',
      createdBy: b.createdBy,
      createdAt: b.createdAt.toISOString(),
    };
  }

  async updateBillStatus(
    id: string,
    status: 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED',
    paymentMethod?: PaymentMethod
  ): Promise<Bill | null> {
    await this.ensureSeeded();
    const updateData: any = { status };
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    const rows = await db.update(bills).set(updateData).where(eq(bills.id, id)).returning();
    if (rows.length === 0) return null;
    const b = rows[0];
    return {
      id: b.id,
      billNumber: b.billNumber,
      date: b.date,
      time: b.time,
      customerName: b.customerName || undefined,
      customerPhone: b.customerPhone || undefined,
      tableNo: b.tableNo || undefined,
      items: b.items,
      subtotal: b.subtotal,
      discount: b.discount,
      total: b.total,
      paymentMethod: b.paymentMethod as PaymentMethod,
      status: (b.status === 'REFUNDED' ? 'CANCELLED' : b.status) as 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED',
      createdBy: b.createdBy,
      createdAt: b.createdAt.toISOString(),
    };
  }

  async deleteBill(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const rows = await db.delete(bills).where(eq(bills.id, id)).returning();
    return rows.length > 0;
  }

  async clearAllBills(): Promise<void> {
    await this.ensureSeeded();
    await db.delete(bills);
  }

  // --- Offers ---
  async getOffers(): Promise<Offer[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(offers);
    return rows.map((o) => ({
      id: o.id,
      title: o.title,
      subtitle: o.subtitle,
      discountPercent: o.discountPercent,
      badgeText: o.badgeText,
      startDate: o.startDate,
      endDate: o.endDate,
      applicableCategories: o.applicableCategories || [],
      bannerImage: o.bannerImage || undefined,
      isActive: o.isActive,
    }));
  }

  async createOffer(offerData: Omit<Offer, 'id'>): Promise<Offer> {
    await this.ensureSeeded();
    const newId = `offer-${Date.now()}`;
    const inserted = await db
      .insert(offers)
      .values({
        id: newId,
        title: offerData.title,
        subtitle: offerData.subtitle,
        discountPercent: offerData.discountPercent,
        badgeText: offerData.badgeText,
        startDate: offerData.startDate,
        endDate: offerData.endDate,
        applicableCategories: offerData.applicableCategories,
        bannerImage: offerData.bannerImage,
        isActive: offerData.isActive,
      })
      .returning();

    const o = inserted[0];
    return {
      id: o.id,
      title: o.title,
      subtitle: o.subtitle,
      discountPercent: o.discountPercent,
      badgeText: o.badgeText,
      startDate: o.startDate,
      endDate: o.endDate,
      applicableCategories: o.applicableCategories || [],
      bannerImage: o.bannerImage || undefined,
      isActive: o.isActive,
    };
  }

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | null> {
    await this.ensureSeeded();
    const rows = await db.update(offers).set(updates).where(eq(offers.id, id)).returning();
    if (rows.length === 0) return null;
    const o = rows[0];
    return {
      id: o.id,
      title: o.title,
      subtitle: o.subtitle,
      discountPercent: o.discountPercent,
      badgeText: o.badgeText,
      startDate: o.startDate,
      endDate: o.endDate,
      applicableCategories: o.applicableCategories || [],
      bannerImage: o.bannerImage || undefined,
      isActive: o.isActive,
    };
  }

  async deleteOffer(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const rows = await db.delete(offers).where(eq(offers.id, id)).returning();
    return rows.length > 0;
  }

  // --- Shop Status ---
  async getShopStatus(): Promise<ShopStatus> {
    await this.ensureSeeded();
    const rows = await db.select().from(shopStatus).where(eq(shopStatus.id, 'main_shop_status'));
    if (rows.length === 0) {
      return INITIAL_SHOP_STATUS;
    }
    const s = rows[0];
    return {
      isOpen: s.isOpen,
      statusMessage: s.statusMessage,
      openingHours: s.openingHours,
      phone: s.phone,
      address: s.address,
      googleReviewUrl: s.googleReviewUrl,
      googleMapsUrl: s.googleMapsUrl,
    };
  }

  async updateShopStatus(updates: Partial<ShopStatus>): Promise<ShopStatus> {
    await this.ensureSeeded();
    const rows = await db
      .update(shopStatus)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(shopStatus.id, 'main_shop_status'))
      .returning();

    if (rows.length === 0) {
      const inserted = await db
        .insert(shopStatus)
        .values({
          id: 'main_shop_status',
          isOpen: updates.isOpen ?? true,
          statusMessage: updates.statusMessage || 'Open Now',
          openingHours: updates.openingHours || '08:00 AM - 11:00 PM',
          phone: updates.phone || '+91 7709054465',
          address: updates.address || 'Coffee Aroma, College Road, Station Area',
          googleReviewUrl: updates.googleReviewUrl || '',
          googleMapsUrl: updates.googleMapsUrl || '',
        })
        .returning();
      const s = inserted[0];
      return {
        isOpen: s.isOpen,
        statusMessage: s.statusMessage,
        openingHours: s.openingHours,
        phone: s.phone,
        address: s.address,
        googleReviewUrl: s.googleReviewUrl,
        googleMapsUrl: s.googleMapsUrl,
      };
    }

    const s = rows[0];
    return {
      isOpen: s.isOpen,
      statusMessage: s.statusMessage,
      openingHours: s.openingHours,
      phone: s.phone,
      address: s.address,
      googleReviewUrl: s.googleReviewUrl,
      googleMapsUrl: s.googleMapsUrl,
    };
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationRequest[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(notifications);
    return rows.map((n) => ({
      id: n.id,
      email: n.email,
      productId: n.productId,
      productName: n.productName,
      date: n.date.toISOString(),
    }));
  }

  async createNotification(notif: Omit<NotificationRequest, 'id' | 'date'>): Promise<NotificationRequest> {
    await this.ensureSeeded();
    const newId = `notif-${Date.now()}`;
    const now = new Date();
    const inserted = await db
      .insert(notifications)
      .values({
        id: newId,
        email: notif.email,
        productId: notif.productId,
        productName: notif.productName,
        date: now,
      })
      .returning();

    const n = inserted[0];
    return {
      id: n.id,
      email: n.email,
      productId: n.productId,
      productName: n.productName,
      date: n.date.toISOString(),
    };
  }

  // --- Analytics ---
  async getAnalytics(): Promise<AnalyticsData> {
    await this.ensureSeeded();
    const allBills = await this.getBills();
    const allProducts = await this.getProducts();
    const allInventory = await this.getInventory();
    const allCategories = await this.getCategories();

    // Paid or completed bills
    const validBills = allBills.filter((b) => b.status === 'PAID');
    
    // Indian Standard Time (Asia/Kolkata) date for "Today"
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()); // "YYYY-MM-DD" e.g., "2026-09-29"

    const todayBills = validBills.filter((b) => b.date === todayStr);

    const salesToday = todayBills.reduce((acc, b) => acc + (b.total || 0), 0);
    const totalBillsToday = todayBills.length;
    const totalProducts = allProducts.length;
    const lowStockCount = allInventory.filter((i) => i.quantity <= i.minStock).length;

    // Calculate product sales breakdown from valid bills
    const productSoldMap = new Map<string, { count: number; revenue: number; name: string; image: string }>();
    for (const bill of validBills) {
      for (const item of bill.items) {
        const prod = allProducts.find((p) => p.id === item.productId);
        const existing = productSoldMap.get(item.productId) || {
          count: 0,
          revenue: 0,
          name: item.productName || prod?.name || 'Coffee Item',
          image:
            prod?.image ||
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        };
        existing.count += item.quantity || 1;
        existing.revenue += item.subtotal || ((item.price || 0) * (item.quantity || 1));
        productSoldMap.set(item.productId, existing);
      }
    }

    let topBrew = {
      name: 'No Sales Yet',
      count: 0,
      revenue: 0,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    };

    let topProducts: { name: string; count: number; revenue: number }[] = [];

    if (productSoldMap.size > 0) {
      const sorted = Array.from(productSoldMap.values()).sort((a, b) => b.count - a.count || b.revenue - a.revenue);
      if (sorted[0] && sorted[0].count > 0) {
        topBrew = sorted[0];
      }
      topProducts = sorted.slice(0, 5).map((p) => ({
        name: p.name,
        count: p.count,
        revenue: p.revenue,
      }));
    }

    // Category stats
    const catMap = new Map<string, { revenue: number; sold: number; count: number }>();
    for (const cat of allCategories) {
      const prodInCat = allProducts.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase());
      if (prodInCat.length > 0) {
        catMap.set(cat.name, { revenue: 0, sold: 0, count: prodInCat.length });
      }
    }

    for (const bill of validBills) {
      for (const item of bill.items) {
        const prod = allProducts.find((p) => p.id === item.productId);
        const catName = prod?.category || 'Pancake';
        const existing = catMap.get(catName) || { revenue: 0, sold: 0, count: 1 };
        existing.revenue += item.subtotal || ((item.price || 0) * (item.quantity || 1));
        existing.sold += item.quantity || 1;
        catMap.set(catName, existing);
      }
    }

    const categoryStats = Array.from(catMap.entries())
      .filter(([_, stat]) => stat.count > 0)
      .map(([category, stat]) => ({
        category,
        revenue: stat.revenue,
        sold: stat.sold,
        count: stat.count,
      }));

    // Dynamic Hourly Sales for Today (08:00 to 22:00)
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const hourlyMap = new Map<string, number>();
    hours.forEach((h) => hourlyMap.set(h, 0));

    for (const bill of todayBills) {
      // Parse bill time (e.g., "10:35 AM" or "22:15" or createdAt)
      let billHour = 8;
      if (bill.createdAt) {
        const dateObj = new Date(bill.createdAt);
        // Get hour in IST
        const hourStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          hour12: false,
        }).format(dateObj);
        billHour = parseInt(hourStr, 10) || 8;
      }

      // Map to 2-hour interval
      let slot = '08:00';
      if (billHour >= 22) slot = '22:00';
      else if (billHour >= 20) slot = '20:00';
      else if (billHour >= 18) slot = '18:00';
      else if (billHour >= 16) slot = '16:00';
      else if (billHour >= 14) slot = '14:00';
      else if (billHour >= 12) slot = '12:00';
      else if (billHour >= 10) slot = '10:00';
      else slot = '08:00';

      hourlyMap.set(slot, (hourlyMap.get(slot) || 0) + (bill.total || 0));
    }

    const recentHourlySales = hours.map((hour) => ({
      hour,
      sales: hourlyMap.get(hour) || 0,
    }));

    // Dynamic Weekly Sales (Last 7 days ending today)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySales: { day: string; sales: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
      
      const dayLabel = dayNames[d.getDay()];
      const daySales = validBills
        .filter((b) => b.date === dStr)
        .reduce((sum, b) => sum + (b.total || 0), 0);

      weeklySales.push({
        day: dayLabel,
        sales: daySales,
      });
    }

    return {
      salesToday,
      totalBillsToday,
      totalProducts,
      lowStockCount,
      topBrew,
      topProducts,
      categoryStats,
      recentHourlySales,
      weeklySales,
    };
  }
}

export const cloudSql = new CloudSQLService();
