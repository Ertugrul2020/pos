
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { Product, Sale, Category, AppSettings, StockMovement, Expense, Customer } from './types.ts';

export class POSDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  categories!: Table<Category>;
  settings!: Table<AppSettings>;
  stockMovements!: Table<StockMovement>;
  expenses!: Table<Expense>;
  customers!: Table<Customer>;

  constructor() {
    super('SmartPOSDatabase');
    
    this.version(7).stores({
      products: '++id, name, barcode, category',
      sales: '++id, timestamp, synced, customerId',
      categories: '++id, name',
      settings: 'id',
      stockMovements: '++id, productId, timestamp, type',
      expenses: '++id, timestamp, category',
      customers: '++id, name, phone'
    });
  }
}

export const db = new POSDatabase();

export const seedDatabase = async () => {
  try {
    const settings = await db.settings.get('main');
    if (!settings) {
      await db.settings.add({
        id: 'main',
        adminPassword: '1234',
        storeName: 'الصياد',
        adminEmail: 'admin@example.com',
        adminPhone: '0123456789',
        storeAddress: 'القاهرة، مصر',
        storePhone: '0100000000'
      });
    }

    const categoryCount = await db.categories.count();
    if (categoryCount === 0) {
      await db.categories.bulkAdd([
        { name: 'وجبات', color: '#ef4444' },
        { name: 'مشروبات', color: '#3b82f6' }
      ]);
    }
  } catch (err) {
    console.warn("Database seeding noticed:", err);
  }
};
