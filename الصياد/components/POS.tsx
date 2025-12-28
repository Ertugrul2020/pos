
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { db } from '../db.ts';
import { Product, SaleItem, Sale, Category, Customer } from '../types.ts';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag, Barcode, UserPlus, Users, X, MessageSquare, AlertCircle } from 'lucide-react';
import Receipt from './Receipt.tsx';

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    searchInputRef.current?.focus();
  }, []);

  const loadData = async () => {
    const allProducts = await db.products.toArray();
    const allCategories = await db.categories.toArray();
    const allCustomers = await db.customers.toArray();
    setProducts(allProducts);
    setCategories(allCategories);
    setCustomers(allCustomers);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('المنتج نفذ من المخزون');
      return;
    }
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id!,
        name: product.name,
        price: product.price,
        cost: product.cost,
        quantity: 1,
        total: product.price
      }]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const handleCheckout = async (method: 'cash' | 'card' | 'debt', customerId?: number) => {
    if (cart.length === 0) return;
    
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + (subtotal * 0.14);

    if (method === 'debt' && customerId) {
      const customer = await db.customers.get(customerId);
      if (customer && customer.debtLimit && (customer.totalDebt + total) > customer.debtLimit) {
        const proceed = confirm(`⚠️ تنبيه: هذا العميل سيتجاوز حد الدين المسموح به (${customer.debtLimit} ج.م). مديونيته الحالية: ${customer.totalDebt} ج.م. هل تريد الإكمال؟`);
        if (!proceed) return;
      }
    }

    setLoading(true);
    try {
      const sale: Sale = {
        items: cart,
        totalAmount: total,
        paymentMethod: method,
        customerId: customerId,
        timestamp: Date.now(),
        synced: false
      };
      
      const id = await db.sales.add(sale);
      sale.id = id as number;
      
      for (const item of cart) {
        const product = await db.products.get(item.productId);
        if (product) {
          await db.products.update(item.productId, { stock: product.stock - item.quantity });
        }
      }

      if (method === 'debt' && customerId) {
        const customer = await db.customers.get(customerId);
        if (customer) {
          await db.customers.update(customerId, {
            totalDebt: customer.totalDebt + total,
            lastVisit: Date.now()
          });
        }
      }

      printReceipt(sale);
      setCart([]);
      setShowCustomerPicker(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إتمام العملية');
    } finally {
      setLoading(false);
      searchInputRef.current?.focus();
    }
  };

  const printReceipt = (sale: Sale) => {
    const printArea = document.getElementById('receipt-print-area');
    if (printArea) {
      const root = ReactDOM.createRoot(printArea);
      root.render(<Receipt sale={sale} />);
      setTimeout(() => {
        window.print();
        printArea.innerHTML = '';
      }, 500);
    }
  };

  const sendShiftReport = async () => {
    const settings = await db.settings.get('main');
    if (!settings?.adminPhone) return alert('سجل رقم المدير أولاً');

    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = (await db.sales.toArray()).filter(s => s.timestamp >= today);
    const todayExpenses = (await db.expenses.toArray()).filter(e => e.timestamp >= today);
    
    const tRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const tExp = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const message = `*🔔 تقرير وردية سريعة*\n🏪 المحل: ${settings.storeName}\n💰 مبيعات اليوم: ${tRevenue.toFixed(2)} ج.م\n📉 مصروفات اليوم: ${tExp.toFixed(2)} ج.م\n✅ الإغلاق: ${(tRevenue - tExp).toFixed(2)} ج.م`;
    window.open(`https://wa.me/${settings.adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8.5rem)] animate-in slide-in-from-bottom-4 duration-700">
      <div className="lg:w-44 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide">
        <button onClick={() => setSelectedCategory('الكل')} className={`flex-shrink-0 px-4 py-4 rounded-2xl font-black text-xs transition-all border-2 ${selectedCategory === 'الكل' ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40 scale-105' : 'bg-[#1e293b] border-gray-800 text-gray-400 hover:border-gray-600'}`}>الكل 📦</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`flex-shrink-0 px-4 py-4 rounded-2xl font-black text-xs transition-all border-2 ${selectedCategory === cat.name ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40 scale-105' : 'bg-[#1e293b] border-gray-800 text-gray-400 hover:border-gray-600'}`}>{cat.name}</button>
        ))}
        <div className="flex-1"></div>
        <button onClick={sendShiftReport} className="flex-shrink-0 px-4 py-4 rounded-2xl font-black text-[10px] bg-green-600/10 border-2 border-green-500/20 text-green-500 hover:bg-green-600 hover:text-white transition-all flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> إرسال جرد سريع
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <input ref={searchInputRef} type="text" placeholder="بحث بالاسم أو الباركود..." className="w-full pr-12 pl-4 py-4 rounded-2xl bg-[#1e293b] border-2 border-gray-800 text-white focus:border-blue-500 outline-none shadow-xl transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-6 h-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto pr-1 pb-4">
          {filteredProducts.map(product => (
            <button key={product.id} onClick={() => addToCart(product)} className="bg-[#1e293b] p-3 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:bg-[#243147] transition-all flex flex-col group relative h-48 shadow-lg active:scale-95">
              <div className="w-full h-24 bg-[#0f172a] rounded-xl mb-3 overflow-hidden border border-gray-800">
                {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-800 opacity-20"><ShoppingBag className="w-10 h-10" /></div>}
              </div>
              <span className="font-black text-white text-[13px] text-center line-clamp-2 px-1 mb-1 leading-tight">{product.name}</span>
              <div className="mt-auto flex justify-center"><span className="text-blue-400 font-black text-sm">{product.price.toFixed(2)} ج.م</span></div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 bg-[#1e293b] rounded-3xl shadow-2xl flex flex-col border border-gray-800 overflow-hidden animate-in slide-in-from-left-4 duration-700">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-black text-blue-400 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> الفاتورة الحالية</h2>
          <button onClick={() => setCart([])} className="text-[11px] font-bold text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-lg">مسح</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.map(item => (
            <div key={item.productId} className="flex items-center justify-between gap-3 bg-[#0f172a] p-3 rounded-2xl border border-gray-800">
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-black text-white truncate">{item.name}</h4>
                <p className="text-[11px] text-blue-400 font-bold">{item.price.toFixed(2)} ج.م</p>
              </div>
              <div className="flex items-center gap-2 bg-[#1e293b] p-1 rounded-xl">
                <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 rounded-lg hover:bg-red-500/20 text-red-400"><Minus className="w-3 h-3" /></button>
                <span className="text-xs font-black w-5 text-center text-white">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 rounded-lg hover:bg-green-500/20 text-green-400"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#0f172a] border-t border-gray-800">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-xl font-black pt-2">
              <span className="text-white">الإجمالي:</span>
              <span className="text-green-500">{(cart.reduce((s, i) => s + i.total, 0) * 1.14).toFixed(2)} ج.م</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleCheckout('cash')} disabled={cart.length === 0 || loading} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-3 rounded-xl flex flex-col items-center gap-1 transition-all"><Banknote className="w-5 h-5"/><span className="text-[10px] font-black">كـاش</span></button>
            <button onClick={() => handleCheckout('card')} disabled={cart.length === 0 || loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-xl flex flex-col items-center gap-1 transition-all"><CreditCard className="w-5 h-5"/><span className="text-[10px] font-black">فيـزا</span></button>
            <button onClick={() => setShowCustomerPicker(true)} disabled={cart.length === 0 || loading} className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white p-3 rounded-xl flex flex-col items-center gap-1 transition-all"><Users className="w-5 h-5"/><span className="text-[10px] font-black">شكك</span></button>
          </div>
        </div>
      </div>

      {showCustomerPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-white">اختر العميل للدفع الآجل</h3>
              <button onClick={() => setShowCustomerPicker(false)} className="text-gray-500 p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-2">
              {customers.map(c => (
                <button key={c.id} onClick={() => handleCheckout('debt', c.id)} className="w-full p-4 bg-[#0f172a] hover:bg-blue-600/10 rounded-2xl border border-gray-800 hover:border-blue-500 text-right transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-white group-hover:text-blue-400">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.phone}</p>
                    </div>
                    {c.debtLimit && c.totalDebt >= c.debtLimit && (
                      <div className="bg-red-500/10 text-red-500 p-2 rounded-lg flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[9px] font-black">تجاوز الحد</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-gray-600">
                    الدين الحالي: {c.totalDebt.toFixed(2)} / سقف الدين: {c.debtLimit?.toFixed(2) || 'بدون حد'}
                  </div>
                </button>
              ))}
              {customers.length === 0 && <p className="text-center text-gray-500 py-4 font-bold">لا يوجد عملاء مسجلين</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
