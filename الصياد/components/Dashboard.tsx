
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { Sale, Product, Expense, AppSettings } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Wallet, ShoppingBag, AlertTriangle, ArrowUpRight, ReceiptText, MessageSquare, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalProfit: 0, 
    totalExpenses: 0,
    netProfit: 0,
    orders: 0, 
    lowStockCount: 0,
    cashTotal: 0,
    cardTotal: 0,
    debtTotal: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const allSales = await db.sales.toArray();
    const allProducts = await db.products.toArray();
    const allExpenses = await db.expenses.toArray();
    const storeSettings = await db.settings.get('main');
    
    setSettings(storeSettings || null);

    let revenue = 0;
    let grossProfit = 0;
    let expensesTotal = 0;
    let cashTotal = 0;
    let cardTotal = 0;
    let debtTotal = 0;
    
    allSales.forEach(sale => {
      revenue += sale.totalAmount;
      if (sale.paymentMethod === 'cash') cashTotal += sale.totalAmount;
      else if (sale.paymentMethod === 'card') cardTotal += sale.totalAmount;
      else debtTotal += sale.totalAmount;

      sale.items.forEach(item => {
        grossProfit += (item.price - item.cost) * item.quantity;
      });
    });

    allExpenses.forEach(exp => {
      expensesTotal += exp.amount;
    });

    const lowStock = allProducts.filter(p => p.stock <= (p.lowStockThreshold || 5));
    
    setSales(allSales);
    setLowStockProducts(lowStock);
    setStats({
      totalRevenue: revenue,
      totalProfit: grossProfit,
      totalExpenses: expensesTotal,
      netProfit: grossProfit - expensesTotal,
      orders: allSales.length,
      lowStockCount: lowStock.length,
      cashTotal,
      cardTotal,
      debtTotal
    });
  };

  const sendWhatsAppReport = async () => {
    if (!settings?.adminPhone) {
      alert('يرجى تسجيل رقم هاتف المدير في الإعدادات');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = sales.filter(s => s.timestamp >= today);
    const todayExpenses = (await db.expenses.toArray()).filter(e => e.timestamp >= today);
    
    const tRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const tCash = todaySales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
    const tCard = todaySales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.totalAmount, 0);
    const tDebt = todaySales.filter(s => s.paymentMethod === 'debt').reduce((sum, s) => sum + s.totalAmount, 0);
    const tExp = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const message = `
*🚀 تقرير إغلاق اليوم - ${settings.storeName}*
--------------------------
📅 التاريخ: ${new Date().toLocaleDateString('ar-EG')}
⏰ الوقت: ${new Date().toLocaleTimeString('ar-EG')}

💰 *المبيعات الإجمالية:* ${tRevenue.toFixed(2)} ج.م
💵 كاش: ${tCash.toFixed(2)} ج.م
💳 فيزا: ${tCard.toFixed(2)} ج.م
📝 آجل (شكك): ${tDebt.toFixed(2)} ج.م

📉 *المصروفات اليومية:* ${tExp.toFixed(2)} ج.م
--------------------------
✅ *صافي الربح التقريبي اليوم:* ${(tRevenue - tExp).toFixed(2)} ج.م

📦 نواقص المخزن: ${stats.lowStockCount} أصناف
--------------------------
_تم الإرسال أوتوماتيكياً من نظام الصياد_
    `.trim();

    if (settings) {
      await db.settings.update('main', { lastReportSentDate: todayStr });
      setSettings({ ...settings, lastReportSentDate: todayStr });
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${settings.adminPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const isReportSentToday = settings?.lastReportSentDate === new Date().toLocaleDateString('en-CA');

  const chartData = sales.slice(-7).map(s => ({
    name: new Date(s.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    total: s.totalAmount
  }));

  const cards = [
    { title: 'كاش اليوم', value: `${stats.cashTotal.toLocaleString()} ج.م`, icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'صافي الربح الفعلي', value: `${stats.netProfit.toLocaleString()} ج.م`, icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'إجمالي المصروفات', value: `${stats.totalExpenses.toLocaleString()} ج.م`, icon: ReceiptText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'الديون المتبقية', value: `${stats.debtTotal.toLocaleString()} ج.م`, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#1e293b] p-6 rounded-[2rem] border border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">نظام الإغلاق اليومي</h2>
          <p className="text-xs text-gray-500 mt-1">
            {isReportSentToday ? '✅ تم إرسال تقرير اليوم للمدير بنجاح' : '⚠️ لم يتم إرسال تقرير إغلاق اليوم حتى الآن'}
          </p>
        </div>
        <button 
          onClick={sendWhatsAppReport}
          className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-xl ${isReportSentToday ? 'bg-gray-800 text-gray-500 cursor-default' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-900/20 animate-bounce'}`}
        >
          {isReportSentToday ? <CheckCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {isReportSentToday ? 'تم إرسال تقرير اليوم' : 'إغلاق اليوم وإرسال واتساب'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-[#1e293b] p-6 rounded-3xl border border-gray-800 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-xl font-black text-white">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1e293b] p-8 rounded-[2.5rem] border border-gray-800">
          <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-500" /> تحليل المبيعات الأخيرة
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip 
                  cursor={{ fill: '#0f172a' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#fff' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-gray-800 flex flex-col">
          <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> تنبيهات المخزن
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#0f172a] border border-red-500/10">
                <div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-[10px] text-gray-500">المتبقي: {p.stock} قطعة</p>
                </div>
                <div className="text-red-500 font-black text-xs px-3 py-1 bg-red-500/5 rounded-lg border border-red-500/20">
                  ناقص
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-30">
                <Package className="w-16 h-16 mb-2" />
                <p className="text-xs font-bold">المخزن بحالة ممتازة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
