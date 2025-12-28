
export interface Product {
  id?: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  barcode?: string;
  image?: string;
  lowStockThreshold?: number;
}

export interface Category {
  id?: number;
  name: string;
  color?: string;
}

export interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  cost: number;
  total: number;
}

export interface Sale {
  id?: number;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'debt';
  customerId?: number;
  timestamp: number;
  synced: boolean;
}

export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  timestamp: number;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  totalDebt: number;
  debtLimit?: number; // سقف الدين المسموح به للعميل
  lastVisit: number;
}

export interface StockMovement {
  id?: number;
  productId: number;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  timestamp: number;
  reason: string;
}

export interface AppSettings {
  id: string;
  adminPassword: string;
  storeName: string;
  adminEmail: string;
  adminPhone: string;
  storeAddress: string;
  storePhone: string;
  logoBase64?: string;
  lastReportSentDate?: string;
  autoReportHour?: number;
}

export type UserRole = 'admin' | 'cashier' | null;
export type View = 'dashboard' | 'pos' | 'inventory' | 'sales' | 'ai-insights' | 'settings' | 'about' | 'expenses' | 'customers';
