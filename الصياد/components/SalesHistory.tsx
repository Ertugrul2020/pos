
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { Sale } from '../types.ts';
import { Calendar, CreditCard, Banknote, Search, FileText, Download, Trash2 } from 'lucide-react';

interface SalesHistoryProps {
  canDelete: boolean;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ canDelete }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const all = await db.sales.orderBy('timestamp').reverse().toArray();
    setSales(all);
  };

  const exportToCSV = () => {
    const headers = ['رقم الفاتورة', 'التاريخ', 'الإجمالي', 'طريقة الدفع', 'عدد الأصناف'];
    const rows = sales.map(s => [
      s.id,
      new Date(s.timestamp).toLocaleString('ar-EG'),
      s.totalAmount,
      s.paymentMethod === 'cash' ? 'كاش' : 'فيزا',
      s.items.length
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Arabic support in Excel
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => { csvContent += row.join(",") + "\n"; });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mabyat_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = sales.filter(s => 
    s.id?.toString().includes(search) || 
    s.totalAmount.toString().includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input type="text" placeholder="بحث في الفواتير..." className="w-full pr-12 pl-4 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white outline-none focus:border-blue-500 shadow-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        <button onClick={exportToCSV} className="w-full md:w-auto px-8 py-4 bg-green-600/10 text-green-500 border border-green-500/20 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all">
          <Download className="w-5 h-5" /> تصدير لـ Excel
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#0f172a]/50 text-gray-400 text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">رقم الفاتورة</th>
                <th className="px-6 py-4">التاريخ والوقت</th>
                <th className="px-6 py-4">طريقة الدفع</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4 text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(sale => (
                <tr key={sale.id} className="hover:bg-blue-600/5 transition-colors">
                  <td className="px-6 py-4 font-black text-white text-sm">#INV-{sale.id}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" />{new Date(sale.timestamp).toLocaleString('ar-EG')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-black">
                      {sale.paymentMethod === 'cash' ? <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">كاش</span> : 
                       sale.paymentMethod === 'card' ? <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">فيزا</span> :
                       <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20">شكك</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-green-500 text-sm">{sale.totalAmount.toFixed(2)} ج.م</td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-white bg-[#0f172a] rounded-lg border border-gray-800"><FileText className="w-4 h-4" /></button>
                      {canDelete && <button onClick={async () => { if(confirm('حذف الفاتورة؟')) { await db.sales.delete(sale.id!); loadSales(); } }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
