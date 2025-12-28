
import React from 'react';
import { View, UserRole } from '../types.ts';
import { LayoutDashboard, ShoppingCart, Package, History, BrainCircuit, Menu, X, Anchor, Settings, LogOut, Info, Wallet, Users } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  role: UserRole;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, role, logout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, adminOnly: true },
    { id: 'pos', label: 'كاشير', icon: ShoppingCart, adminOnly: false },
    { id: 'inventory', label: 'المخزون والقوائم', icon: Package, adminOnly: true },
    { id: 'sales', label: 'سجل المبيعات', icon: History, adminOnly: false },
    { id: 'expenses', label: 'المصروفات', icon: Wallet, adminOnly: false },
    { id: 'customers', label: 'العملاء والديون', icon: Users, adminOnly: false },
    { id: 'ai-insights', label: 'مستشار الذكاء', icon: BrainCircuit, adminOnly: true },
    { id: 'settings', label: 'الإعدادات', icon: Settings, adminOnly: true },
    { id: 'about', label: 'عن المبرمج', icon: Info, adminOnly: false },
  ] as const;

  const filteredMenu = menuItems.filter(item => !item.adminOnly || role === 'admin');

  return (
    <>
      <div className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-[#0f172a] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-l border-gray-800
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Anchor className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-black text-white tracking-tighter">الصياد</span>
          </div>
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6 flex flex-col h-[calc(100vh-10rem)]">
          <div className="space-y-1 px-3 flex-1 overflow-y-auto custom-scrollbar">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 font-bold text-sm
                  ${currentView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="px-3 mb-6 space-y-2">
            <div className={`p-4 rounded-2xl text-[10px] text-center font-black ${role === 'admin' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'bg-gray-800/50 text-gray-500 border border-gray-700'}`}>
              دخول: {role === 'admin' ? 'مدير النظام' : 'كاشير'}
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/10 text-red-500 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </nav>
      </div>

      {!isOpen && (
        <button 
          className="fixed top-4 right-4 z-50 p-2 bg-slate-900 text-white rounded-md md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
