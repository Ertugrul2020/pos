
import React, { useState } from 'react';
import { Wifi, WifiOff, Bell, Anchor, Maximize2, Minimize2 } from 'lucide-react';
import { UserRole } from '../types.ts';

interface HeaderProps {
  title: string;
  isOnline: boolean;
  role: UserRole;
}

const Header: React.FC<HeaderProps> = ({ title, isOnline, role }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="h-16 bg-[#1e293b] border-b border-gray-800 flex items-center justify-between px-6 shadow-xl relative z-10">
      <div className="flex items-center gap-4">
        <Anchor className="w-6 h-6 text-blue-500 md:hidden" />
        <h1 className="text-xl font-black text-white">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleFullscreen}
          className="p-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 rounded-lg"
          title="ملء الشاشة"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${isOnline ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isOnline ? 'أونلاين' : 'أوفلاين'}
        </div>
        
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
