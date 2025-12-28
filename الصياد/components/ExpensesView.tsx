
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Expense } from '../types';
import { Plus, Trash2, Wallet, Calendar, Tag, DollarSign } from 'lucide-react';

interface ExpensesViewProps {
  canDelete: boolean;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ canDelete }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', amount: 0, category: 'أخرى' });

  useEffect(() => { loadExpenses(); }, []);

  const loadExpenses = async () => {
    const all = await db.expenses.orderBy('timestamp').reverse().toArray();
    setExpenses(all);
  };

  const handleAdd = async () => {
    if (!newExp.title || newExp.amount <= 0) return alert('أدخل بيانات صحيحة');
    await db.expenses.add({
      ...newExp,
      timestamp: Date.now()
    });
    setNewExp({ title: '', amount: 0, category: 'أخرى' });
    setShowAdd(false);
    loadExpenses();
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) return;
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      await db.expenses.delete(id);
      loadExpenses();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <Wallet className="text-orange-500" /> سجل المصروفات
        </h2>
        <button onClick={() => setShowAdd(true)} className="bg-orange-600 hover:bg-orange-500 px-6 py-3 rounded-2xl font-black text-white flex items-center gap-2 shadow-lg shadow-orange-900/20">
          <Plus className="w-5 h-5" /> إضافة مصروف جديد
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-right">
          <thead className="bg-[#0f172a]/50 text-gray-500 text-[11px] font-black uppercase tracking-wider">
            <tr>
              <th className="px-8 py-5">المصروف</th>
              <th className="px-8 py-5">التصنيف</th>
              <th className="px-8 py-5">المبلغ</th>
              <th className="px-8 py-5">التاريخ</th>
              {canDelete && <th className="px-8 py-5 text-left">التحكم</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-orange-500/5 transition-colors">
                <td className="px-8 py-5 font-bold text-white">{exp.title}</td>
                <td className="px-8 py-5">
                  <span className="bg-gray-800 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full border border-gray-700">{exp.category}</span>
                </td>
                <td className="px-8 py-5 font-black text-red-500">{exp.amount.toFixed(2)} ج.م</td>
                <td className="px-8 py-5 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><Calendar className="w-3 h-3" />{new Date(exp.timestamp).toLocaleDateString('ar-EG')}</div>
                </td>
                {canDelete && (
                  <td className="px-8 py-5 text-left">
                    <button onClick={() => handleDelete(exp.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="p-8 border-b border-gray-800">
              <h3 className="text-xl font-black text-white">إضافة مصروف</h3>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase">وصف المصروف</label>
                <div className="relative">
                  <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                  <input type="text" className="w-full pr-12 pl-4 py-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-orange-500" value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-black uppercase">المبلغ</label>
                  <div className="relative">
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                    <input type="number" className="w-full pr-12 pl-4 py-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-orange-500" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: parseFloat(e.target.value)||0})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-black uppercase">التصنيف</label>
                  <select className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-orange-500 appearance-none" value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})}>
                    <option value="رواتب">رواتب</option>
                    <option value="إيجار">إيجار</option>
                    <option value="كهرباء/مياه">كهرباء/مياه</option>
                    <option value="مشتريات">مشتريات</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-8 bg-[#0f172a]/50 flex gap-3">
              <button onClick={handleAdd} className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-500 shadow-xl">حفظ المصروف</button>
              <button onClick={() => setShowAdd(false)} className="px-6 bg-gray-800 text-gray-400 py-4 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
