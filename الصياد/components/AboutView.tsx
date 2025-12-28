
import React from 'react';
import { Phone, MessageSquare, Heart, User } from 'lucide-react';

const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
      {/* قسم المطور الرئيسي */}
      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[3rem] border border-gray-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="p-8 md:p-16 relative z-10 flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/20 border-4 border-white/5">
            <User className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">محمد نصر الصياد</h1>
          <p className="text-blue-500 font-bold text-lg mb-8">مطور أنظمة الإدارة والذكاء الاصطناعي</p>
          <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-8"></div>
          <p className="text-gray-400 max-w-2xl leading-relaxed font-medium text-lg mb-12">
            تم تصميم نظام "الصياد" ليكون شريكك الذكي في إدارة تجارتك. نهدف دائماً لتوفير حلول برمجية متطورة، سهلة الاستخدام، وتعمل في كافة الظروف (أونلاين وأوفلاين).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
            <a 
              href="tel:01009514300" 
              className="flex items-center justify-center gap-3 p-5 bg-[#0f172a] border border-gray-800 rounded-2xl text-white font-black hover:border-blue-500 transition-all group"
            >
              <Phone className="w-6 h-6 text-green-500" /> 
              01009514300
            </a>
            <a 
              href="https://wa.me/201009514300" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-3 p-5 bg-[#0f172a] border border-gray-800 rounded-2xl text-white font-black hover:border-green-500 transition-all group"
            >
              <MessageSquare className="w-6 h-6 text-blue-500" /> 
              تحدث واتساب
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a]/50 p-6 text-center border border-gray-800 rounded-[2rem]">
        <p className="text-xs text-gray-600 font-black flex items-center justify-center gap-2">
          تم التطوير بكل <Heart className="w-3 h-3 text-red-500 fill-red-500" /> لدعم تجارنا في كل مكان
        </p>
      </div>
    </div>
  );
};

export default AboutView;
