
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { Product, Category, StockMovement } from '../types.ts';
import { Plus, Edit2, Trash2, Search, Package, X, Save, Layers, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'movements'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState('');
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({ 
    name: '', price: 0, cost: 0, stock: 0, category: '', lowStockThreshold: 5 
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string, data: any } | null>(null);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    const p = await db.products.toArray();
    const c = await db.categories.toArray();
    const m = await db.stockMovements.orderBy('timestamp').reverse().toArray();
    setProducts(p);
    setCategories(c);
    setMovements(m);
    if (c.length > 0 && !currentProduct.category) {
      setCurrentProduct(prev => ({ ...prev, category: c[0].name }));
    }
  };

  const handleSaveProduct = async () => {
    if (!currentProduct.name || !currentProduct.category) return alert('أكمل البيانات');
    
    if (isEditing && currentProduct.id) {
      await db.products.update(currentProduct.id, currentProduct);
    } else {
      const id = await db.products.add(currentProduct as Product);
      await db.stockMovements.add({
        productId: id as number,
        productName: currentProduct.name!,
        type: 'in',
        quantity: currentProduct.stock!,
        timestamp: Date.now(),
        reason: 'إضافة منتج جديد'
      });
    }
    setShowProductModal(false);
    loadData();
  };

  const confirmPasswordAndExecute = async () => {
    const settings = await db.settings.get('main');
    if (passwordInput === settings?.adminPassword) {
      if (pendingAction?.type === 'product') await db.products.delete(pendingAction.data);
      setShowPasswordModal(false);
      loadData();
    } else { setPasswordError(true); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-[#1e293b] p-1 rounded-2xl border border-gray-800">
          <button onClick={() => setActiveTab('products')} className={`px-6 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>المنتجات</button>
          <button onClick={() => setActiveTab('movements')} className={`px-6 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'movements' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>حركات المخزن</button>
        </div>
        {activeTab === 'products' && (
          <button onClick={() => { setIsEditing(false); setCurrentProduct({ name: '', price: 0, cost: 0, stock: 0, category: categories[0]?.name || '', lowStockThreshold: 5 }); setShowProductModal(true); }} 
            className="bg-blue-600 hover:bg-blue-500 p-2.5 px-6 rounded-xl font-black text-white flex items-center gap-2">
            <Plus className="w-5 h-5" /> إضافة منتج
          </button>
        )}
      </div>

      {activeTab === 'products' ? (
        <div className="bg-[#1e293b] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#0f172a]/50 text-gray-400 text-[11px] font-black uppercase">
              <tr><th className="px-6 py-4">المنتج</th><th className="px-6 py-4">التصنيف</th><th className="px-6 py-4">التكلفة</th><th className="px-6 py-4">البيع</th><th className="px-6 py-4">المخزون</th><th className="px-6 py-4 text-left">التحكم</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-blue-600/5 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white text-sm">{p.name}</td>
                  <td className="px-6 py-4 text-xs text-blue-400">{p.category}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{p.cost.toFixed(1)}</td>
                  <td className="px-6 py-4 text-sm font-black text-green-500">{p.price.toFixed(1)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${p.stock <= (p.lowStockThreshold || 5) ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                      {p.stock} حبة
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setIsEditing(true); setCurrentProduct(p); setShowProductModal(true); }} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { setPendingAction({ type: 'product', data: p.id }); setPasswordInput(''); setPasswordError(false); setShowPasswordModal(true); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#0f172a]/50 text-gray-400 text-[11px] font-black uppercase">
              <tr><th className="px-6 py-4">المنتج</th><th className="px-6 py-4">النوع</th><th className="px-6 py-4">الكمية</th><th className="px-6 py-4">التاريخ</th><th className="px-6 py-4">السبب</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {movements.map(m => (
                <tr key={m.id} className="text-xs text-gray-300">
                  <td className="px-6 py-3 font-bold">{m.productName}</td>
                  <td className="px-6 py-3">
                    {m.type === 'in' ? <span className="text-green-500">توريد (+)</span> : <span className="text-red-500">بيع (-)</span>}
                  </td>
                  <td className="px-6 py-3 font-black">{m.quantity}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(m.timestamp).toLocaleString('ar-EG')}</td>
                  <td className="px-6 py-3 text-gray-500 italic">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-white">{isEditing ? 'تعديل المنتج' : 'إضافة منتج'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-500 p-2 hover:bg-gray-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase mr-1">الاسم</label><input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase mr-1">التصنيف</label><select className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500 appearance-none" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase mr-1">التكلفة</label><input type="number" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white border border-gray-800" value={currentProduct.cost} onChange={e => setCurrentProduct({...currentProduct, cost: parseFloat(e.target.value)||0})} /></div>
                <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase mr-1">البيع</label><input type="number" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white border border-gray-800" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)||0})} /></div>
                <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase mr-1">المخزون</label><input type="number" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white border border-gray-800" value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value)||0})} /></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-red-500 font-bold uppercase mr-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> حد التنبيه للنقص (Alert Threshold)</label>
                <input type="number" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white border border-red-500/20" value={currentProduct.lowStockThreshold} onChange={e => setCurrentProduct({...currentProduct, lowStockThreshold: parseInt(e.target.value)||5})} />
              </div>
            </div>
            <div className="p-8 bg-[#0f172a]/50 border-t border-gray-800 flex gap-4">
              <button onClick={handleSaveProduct} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl">حفظ البيانات</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-sm border border-red-500/30 overflow-hidden animate-in zoom-in">
            <div className="p-8 text-center space-y-4">
              <Lock className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-xl font-black text-white">تأكيد الهوية</h3>
              <input type="password" autoFocus className={`w-full p-5 bg-[#0f172a] rounded-2xl text-white text-center text-2xl tracking-[1em] outline-none border ${passwordError ? 'border-red-500 animate-shake' : 'border-gray-800'} focus:border-red-500 transition-all`} placeholder="****" value={passwordInput} onChange={(e) => {setPasswordInput(e.target.value); setPasswordError(false);}} onKeyDown={(e) => e.key === 'Enter' && confirmPasswordAndExecute()} />
            </div>
            <div className="p-6 bg-[#0f172a]/50 flex gap-3"><button onClick={confirmPasswordAndExecute} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black">تأكيد</button><button onClick={() => setShowPasswordModal(false)} className="px-6 bg-gray-800 text-gray-400 py-4 rounded-2xl font-bold">إلغاء</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
