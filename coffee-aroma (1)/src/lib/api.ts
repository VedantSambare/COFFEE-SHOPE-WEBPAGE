import { Product, Category, InventoryItem, Bill, Offer, ShopStatus, NotificationRequest, User, AnalyticsData, PaymentMethod } from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('coffee_aroma_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('coffee_aroma_token', token);
  } else {
    localStorage.removeItem('coffee_aroma_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  firebaseLogin: (idToken: string) =>
    request<{ token: string; user: User }>('/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  getMe: () => request<{ user: User }>('/auth/me'),
  resetPassword: (data: { currentPassword?: string; newPassword: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Shop Status
  getShopStatus: () => request<ShopStatus>('/shop/status'),
  updateShopStatus: (status: Partial<ShopStatus>) =>
    request<ShopStatus>('/shop/status', {
      method: 'PUT',
      body: JSON.stringify(status),
    }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // Products
  getProducts: (params?: { category?: string; search?: string; featured?: boolean; special?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    if (params?.special) query.append('special', 'true');
    const qStr = query.toString();
    return request<Product[]>(`/products${qStr ? `?${qStr}` : ''}`);
  },
  getProductById: (id: string) => request<Product>(`/products/${id}`),
  createProduct: (data: Partial<Product>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
  syncAll62Products: () =>
    request<{ success: boolean; count: number; products: Product[] }>('/products/sync-all-62', {
      method: 'POST',
    }),

  // Inventory
  getInventory: () => request<InventoryItem[]>('/inventory'),
  createInventoryItem: (data: Partial<InventoryItem>) =>
    request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) =>
    request<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteInventoryItem: (id: string) =>
    request<{ message: string }>(`/inventory/${id}`, {
      method: 'DELETE',
    }),

  // Bills & POS
  getBills: (params?: { employee?: string; creator?: string; status?: string; paymentMethod?: string; date?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.employee) query.append('employee', params.employee);
    if (params?.creator) query.append('creator', params.creator);
    if (params?.status) query.append('status', params.status);
    if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    if (params?.date) query.append('date', params.date);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    const qStr = query.toString();
    return request<Bill[]>(`/bills${qStr ? `?${qStr}` : ''}`);
  },
  getBillById: (id: string) => request<Bill>(`/bills/${id}`),
  createBill: (data: any) =>
    request<Bill>('/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBillStatus: (id: string, status: 'PENDING' | 'ACCEPTED' | 'PAID' | 'CANCELLED', paymentMethod?: PaymentMethod) =>
    request<Bill>(`/bills/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentMethod }),
    }),
  checkoutCustomerOrder: (data: any) =>
    request<Bill>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteBill: (id: string) =>
    request<{ message: string }>(`/bills/${id}`, {
      method: 'DELETE',
    }),
  clearAllBills: (confirmation: string) =>
    request<{ message: string }>('/bills/danger-clear-all', {
      method: 'POST',
      body: JSON.stringify({ confirmation }),
    }),

  // Offers
  getOffers: () => request<Offer[]>('/offers'),
  createOffer: (data: Partial<Offer>) =>
    request<Offer>('/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateOffer: (id: string, data: Partial<Offer>) =>
    request<Offer>(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteOffer: (id: string) =>
    request<{ message: string }>(`/offers/${id}`, {
      method: 'DELETE',
    }),

  // Employees
  getEmployees: () => request<User[]>('/employees'),
  createEmployee: (data: any) =>
    request<User>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEmployee: (id: string, data: any) =>
    request<User>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEmployee: (id: string) =>
    request<{ message: string }>(`/employees/${id}`, {
      method: 'DELETE',
    }),

  // Notifications ("Notify Me")
  submitNotification: (data: { email: string; productId: string; productName: string }) =>
    request<{ message: string; notification: NotificationRequest }>('/notify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getNotifications: () => request<NotificationRequest[]>('/notifications'),

  // Analytics & DB Status
  getAnalytics: () => request<AnalyticsData>('/analytics'),
  getDbStatus: () => request<{ status: string; engine: string; collections: Record<string, number>; latency: string; uptime: string }>('/db/status'),
};
