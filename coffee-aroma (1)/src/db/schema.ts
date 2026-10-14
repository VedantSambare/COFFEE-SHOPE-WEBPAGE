import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { IngredientRecipe, AddOnOption, BillItem } from '../types.js';

// 1. Users Table (Admin & Staff Accounts + Google OAuth UID link)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID if logged in via OAuth
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('EMPLOYEE'), // 'ADMIN' | 'EMPLOYEE'
  phone: text('phone'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'INACTIVE'
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Categories Table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  description: text('description').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
});

// 3. Products Table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: doublePrecision('price').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  availability: boolean('availability').notNull().default(true),
  inventoryQuantity: integer('inventory_quantity').notNull().default(100),
  minStock: integer('min_stock').notNull().default(10),
  isFeatured: boolean('is_featured').default(false),
  isSpecial: boolean('is_special').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  ingredients: jsonb('ingredients').$type<IngredientRecipe[]>().notNull().default([]),
  addOns: jsonb('add_ons').$type<AddOnOption[]>().notNull().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Inventory Table
export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  quantity: doublePrecision('quantity').notNull().default(0),
  unit: text('unit').notNull(),
  minStock: doublePrecision('min_stock').notNull().default(5),
  supplier: text('supplier'),
  lastRestocked: timestamp('last_restocked').defaultNow().notNull(),
});

// 5. Bills & Invoices Table
export const bills = pgTable('bills', {
  id: text('id').primaryKey(),
  billNumber: text('bill_number').notNull().unique(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  tableNo: text('table_no'),
  items: jsonb('items').$type<BillItem[]>().notNull().default([]),
  subtotal: doublePrecision('subtotal').notNull(),
  discount: doublePrecision('discount').notNull().default(0),
  total: doublePrecision('total').notNull(),
  paymentMethod: text('payment_method').notNull().default('ONLINE'),
  status: text('status').notNull().default('PAID'),
  createdBy: text('created_by').notNull().default('ADMIN'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Offers & Promotions Table
export const offers = pgTable('offers', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  discountPercent: integer('discount_percent').notNull(),
  badgeText: text('badge_text').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  applicableCategories: jsonb('applicable_categories').$type<string[]>().default([]),
  bannerImage: text('banner_image'),
  isActive: boolean('is_active').notNull().default(true),
});

// 7. Shop Status Table (Single active row or key-value store)
export const shopStatus = pgTable('shop_status', {
  id: text('id').primaryKey().default('main_shop_status'),
  isOpen: boolean('is_open').notNull().default(true),
  statusMessage: text('status_message').notNull(),
  openingHours: text('opening_hours').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  googleReviewUrl: text('google_review_url').notNull(),
  googleMapsUrl: text('google_maps_url').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Notifications / Waitlist Table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  date: timestamp('date').defaultNow().notNull(),
});
