
import React, { useState, useEffect } from 'react';
import { seedDatabase, db } from './db.ts';
import { View, UserRole, AppSettings } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import POS from './components/POS.tsx';
import Inventory from './components/Inventory.tsx';
import SalesHistory from './components/SalesHistory.tsx';
import AIInsights from './components/AIInsights.tsx';
import SettingsView from './components/SettingsView.tsx';
import AboutView from './components/AboutView.tsx';
import ExpensesView from './components/ExpensesView.tsx';
import CustomersView from './components/CustomersView.tsx';
import { WifiOff, Lock, User, ShieldAlert, KeyRound, ArrowRight, Phone, Mail, BellRing, MessageSquare, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('pos');
  const [role, setRole] = useState<UserRole>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [showLogin, setShowLogin] = useState(true);
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // نسيان كلمة المرور
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryData, setRecoveryData] = useState({ email: '', phone: '' });
  const [recoveryError, setRecoveryError] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // نظام التنبيه التلقائي للتقرير
  const [showAutoReportPrompt, setShowAutoReportPrompt] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    seedDatabase();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // فحص دوري للوقت كل دقيقة لإرسال التقرير
    const timer = setInterval(checkReportStatus, 60000);
    checkReportStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  const checkReportStatus = async () => {
    const s = await db.settings.get('main');
    if (!s) return;
    setSettings(s);

    const now = new Date();
    const currentHour = now.getHours();
    const todayStr = now.toLocaleDateString('en-CA');

    // إذا كانت الساعة هي الساعة المحددة (مثلاً 0 لمنتصف الليل) والتقرير متبعتش النهاردة
    if (currentHour === (s.autoReportHour || 0) && s.lastReportSentDate !== todayStr) {
      setShowAutoReportPrompt(true);
    }
  };

  const handleSendReportAction = async () => {
    if (!settings) return;
    
    // تجميع البيانات للتقرير (نفس منطق الداشبورد)
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = (await db.sales.toArray()).filter(s => s.timestamp >= today);
    const todayExpenses = (await db.expenses.toArray()).filter(e => e.timestamp >= today);
    
    const tRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const tExp = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const message = `
*🚀 تقرير إغلاق اليوم التلقائي (منتصف الليل)*
--------------------------
🏪 المتجر: ${settings.storeName}
📅 التاريخ: ${new Date().toLocaleDateString('ar-EG')}

💰 مبيعات اليوم: ${tRevenue.toFixed(2)} ج.م
📉 مصروفات اليوم: ${tExp.toFixed(2)} ج.م
✅ الصافي: ${(tRevenue - tExp).toFixed(2)} ج.م
--------------------------
_تم التنبيه بواسطة نظام الصياد الذكي_
    `.trim();

    const todayStr = new Date().toLocaleDateString('en-CA');
    await db.settings.update('main', { lastReportSentDate: todayStr });
    
    window.open(`https://wa.me/${settings.adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setShowAutoReportPrompt(false);
  };

  const handleAdminLogin = async () => {
    const s = await db.settings.get('main');
    if (passInput === s?.adminPassword) {
      setRole('admin');
      setShowLogin(false);
      setCurrentView('dashboard');
    } else {
      setLoginError(true);
      setPassInput('');
    }
  };

  const handleRecovery = async () => {
    const s = await db.settings.get('main');
    if (recoveryData.email === s?.adminEmail && recoveryData.phone === s?.adminPhone) {
      setTempPassword(s.adminPassword);
      setRecoveryError(false);
    } else {
      setRecoveryError(true);
    }
  };

  const logout = () => {
    setRole(null);
    setShowLogin(true);
    setPassInput('');
    setShowForgot(false);
    setTempPassword(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'sales': return <SalesHistory canDelete={role === 'admin'} />;
      case 'expenses': return <ExpensesView canDelete={role === 'admin'} />;
      case 'customers': return <CustomersView />;
      case 'ai-insights': return <AIInsights />;
      case 'settings': return <SettingsView />;
      case 'about': return <AboutView />;
      default: return <POS />;
    }
  };

  if (showLogin) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-4xl grid md:grid-cols-2 bg-[#1e293b] rounded-[3rem] shadow-2xl border border-gray-800 overflow-hidden">
          <div className="p-12 flex flex-col justify-center items-center text-center bg-blue-600 relative overflow-hidden">
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md relative z-10">
               <ShieldAlert className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 relative z-10">نظام الصياد</h1>
            <p className="text-blue-100 font-medium relative z-10">الإصدار الاحترافي v2.0</p>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </div>
          
          <div className="p-12 flex flex-col justify-center space-y-8 bg-[#1e293b]">
            {!showForgot ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <button onClick={() => { setRole('cashier'); setShowLogin(false); setCurrentView('pos'); }}
                  className="w-full p-6 bg-[#0f172a] border border-gray-800 rounded-2xl flex items-center gap-6 hover:border-blue-500 transition-all group text-right">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">حساب كاشير</h3>
                    <p className="text-gray-500 text-sm">دخول سريع للبيع</p>
                  </div>
                </button>

                <div className="relative pt-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1e293b] px-4 text-gray-500 font-bold">دخول المدير</span></div></div>

                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                    <input type="password" placeholder="كلمة المرور" className={`w-full pr-12 pl-4 py-5 bg-[#0f172a] rounded-2xl text-white outline-none border ${loginError ? 'border-red-500 animate-shake' : 'border-gray-800'} focus:border-blue-500 transition-all`} value={passInput} onChange={(e) => {setPassInput(e.target.value); setLoginError(false);}} onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} />
                  </div>
                  <button onClick={handleAdminLogin} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 shadow-xl shadow-blue-900/20 transition-all">دخول لوحة التحكم</button>
                  <button onClick={() => setShowForgot(true)} className="w-full text-center text-gray-500 text-xs font-bold hover:text-blue-400 py-2">نسيت كلمة المرور؟</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <button onClick={() => {setShowForgot(false); setTempPassword(null); setRecoveryError(false);}} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4">
                  <ArrowRight className="w-4 h-4" /> العودة للدخول
                </button>
                <div className="text-center">
                  <KeyRound className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-xl font-black text-white">استعادة الوصول</h3>
                  <p className="text-gray-500 text-sm">أدخل البيانات المسجلة في الإعدادات</p>
                </div>

                {!tempPassword ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                      <input type="email" placeholder="البريد الإلكتروني للمدير" className="w-full pr-12 pl-4 py-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={recoveryData.email} onChange={(e) => setRecoveryData({...recoveryData, email: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                      <input type="text" placeholder="رقم الهاتف المسجل" className="w-full pr-12 pl-4 py-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={recoveryData.phone} onChange={(e) => setRecoveryData({...recoveryData, phone: e.target.value})} />
                    </div>
                    {recoveryError && <p className="text-red-500 text-center text-xs font-bold">البيانات لا تطابق السجلات!</p>}
                    <button onClick={handleRecovery} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all">تحقق من البيانات</button>
                  </div>
                ) : (
                  <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-4">
                    <p className="text-green-500 font-bold">تم التحقق بنجاح!</p>
                    <div className="text-white">
                      <p className="text-xs text-gray-500 mb-1">كلمة مرورك هي:</p>
                      <p className="text-3xl font-black tracking-widest">{tempPassword}</p>
                    </div>
                    <button onClick={() => { setShowForgot(false); setPassInput(tempPassword); setTempPassword(null); }} className="w-full py-3 bg-green-600 text-white rounded-xl font-black">استخدام كلمة المرور</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar currentView={currentView} setView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} role={role} logout={logout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={
            currentView === 'dashboard' ? 'لوحة التحكم' :
            currentView === 'pos' ? 'كاشير' :
            currentView === 'inventory' ? 'المخزن والقوائم' :
            currentView === 'sales' ? 'تاريخ المبيعات' : 
            currentView === 'expenses' ? 'المصروفات' :
            currentView === 'customers' ? 'العملاء والديون' :
            currentView === 'settings' ? 'إعدادات النظام' : 
            currentView === 'about' ? 'حول المبرمج' : 'تحليلات الصياد'
          } isOnline={isOnline} role={role} />
        <main className="flex-1 overflow-y-auto p-4 bg-[#0f172a]">
          <div className="max-w-[1600px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      {/* تنبيه منتصف الليل التلقائي لإرسال التقرير */}
      {showAutoReportPrompt && (
        <div className="fixed bottom-8 left-8 z-[200] w-full max-w-sm animate-in slide-in-from-left-8 duration-500">
          <div className="bg-[#1e293b] rounded-3xl border-2 border-green-500/50 shadow-2xl overflow-hidden">
            <div className="bg-green-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-black">
                <BellRing className="w-5 h-5 animate-bounce" />
                تنبيه: إغلاق الوردية
              </div>
              <button onClick={() => setShowAutoReportPrompt(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-white font-bold text-sm">حان الآن موعد إغلاق اليوم (الساعة 12:00 صباحاً). هل تود إرسال التقرير النهائي للمدير الآن؟</p>
              <button 
                onClick={handleSendReportAction}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-500 transition-all shadow-xl shadow-green-900/20"
              >
                <MessageSquare className="w-5 h-5" /> إرسال التقرير واتساب
              </button>
              <button onClick={() => setShowAutoReportPrompt(false)} className="w-full py-2 text-gray-500 font-bold text-xs">تجاهل الآن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
