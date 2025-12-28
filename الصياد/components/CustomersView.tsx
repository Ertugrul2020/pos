
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Customer } from '../types';
import { Plus, UserPlus, Phone, Search, Wallet, History, Trash2, X, AlertTriangle } from 'lucide-react';

const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', debtLimit: 1000 });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    const all = await db.customers.toArray();
    setCustomers(all);
  };

  const handleAdd = async () => {
    if (!newCust.name || !newCust.phone) return alert('أدخل الاسم والموبايل');
    await db.customers.add({ ...newCust, totalDebt: 0, lastVisit: Date.now() });
    setNewCust({ name: '', phone: '', debtLimit: 1000 });
    setShowAdd(false);
    loadCustomers();
  };

  const filtered = customers.filter(c => c.name.includes(search) || c.phone.includes(search));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <Wallet className="text-blue-500" /> مديونيات العملاء (الشكك)
        </h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input type="text" placeholder="بحث باسم العميل..." className="w-full pr-10 pl-4 py-3 bg-[#1e293b] rounded-xl text-white border border-gray-800 focus:border-blue-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> عميل جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(cust => (
          <div key={cust.id} className={`bg-[#1e293b] p-8 rounded-[2.5rem] border ${cust.debtLimit && cust.totalDebt >= cust.debtLimit ? 'border-red-500/50 shadow-red-900/10' : 'border-gray-800'} hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-xl`}>
            {cust.debtLimit && cust.totalDebt >= cust.debtLimit && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-4 py-1 rounded-bl-xl flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> تجاوز الحد
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Wallet className="w-8 h-8" />
              </div>
              <button onClick={async () => { if(confirm('حذف العميل؟')) { await db.customers.delete(cust.id!); loadCustomers(); } }} className="text-gray-600 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
            
            <h3 className="text-xl font-black text-white mb-1">{cust.name}</h3>
            <p className="text-gray-500 text-sm font-bold flex items-center gap-2 mb-6"><Phone className="w-3 h-3" /> {cust.phone}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#0f172a] rounded-2xl border border-gray-800">
                <p className="text-[9px] text-gray-500 font-black uppercase">المديونية</p>
                <p className={`text-lg font-black ${cust.totalDebt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {cust.totalDebt.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-2xl border border-gray-800">
                <p className="text-[9px] text-gray-500 font-black uppercase">سقف الدين</p>
                <p className="text-lg font-black text-blue-400">
                  {cust.debtLimit?.toFixed(0) || '∞'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-3 bg-gray-800 text-white rounded-xl text-xs font-black hover:bg-gray-700">كشف حساب</button>
              <button className="flex-1 py-3 bg-green-600/10 text-green-500 border border-green-500/20 rounded-xl text-xs font-black hover:bg-green-600 hover:text-white">تسديد مبلغ</button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-sm border border-gray-700 shadow-2xl animate-in zoom-in">
            <div className="p-8 border-b border-gray-800 flex justify-between">
              <h3 className="text-xl font-black text-white">إضافة عميل جديد</h3>
              <button onClick={() => setShowAdd(false)}><X className="text-gray-500" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase">اسم العميل</label>
                <input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white border border-gray-800 outline-none focus:border-blue-500" value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase">رقم الموبايل</label>
                <input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white border border-gray-800 outline-none focus:border-blue-500" value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase">سقف الدين المسموح (ج.م)</label>
                <input type="number" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white border border-gray-800 outline-none focus:border-blue-500" value={newCust.debtLimit} onChange={e => setNewCust({...newCust, debtLimit: parseFloat(e.target.value)||0})} />
              </div>
              <button onClick={handleAdd} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl mt-4">حفظ العميل</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
