
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { AppSettings } from '../types';
import { Save, Lock, Store, ShieldCheck, Mail, Phone, MapPin, Camera, Clock } from 'lucide-react';

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    id: 'main',
    adminPassword: '',
    storeName: '',
    adminEmail: '',
    adminPhone: '',
    storeAddress: '',
    storePhone: '',
    logoBase64: '',
    autoReportHour: 0 // تم التغيير ليكون الافتراضي منتصف الليل
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await db.settings.get('main');
    if (s) setSettings(s);
    setLoading(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!settings.adminPassword || !settings.storeName || !settings.adminEmail || !settings.adminPhone) {
      alert('يرجى تعبئة بيانات المدير (الباسورد، الايميل، الموبايل) لضمان استعادة الحساب');
      return;
    }
    await db.settings.put(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-10">
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* بيانات المدير والاستعادة */}
        <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <Lock className="text-blue-500" /> حماية الحساب والاستعادة
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2"><Lock className="w-3 h-3"/> كلمة المرور</label>
              <input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500 font-bold" value={settings.adminPassword} onChange={(e) => setSettings({...settings, adminPassword: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2"><Mail className="w-3 h-3"/> بريد المدير (للاستعادة)</label>
              <input type="email" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={settings.adminEmail} onChange={(e) => setSettings({...settings, adminEmail: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2"><Phone className="w-3 h-3"/> موبايل المدير (للواتساب)</label>
              <input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={settings.adminPhone} placeholder="مثال: 201000000000" onChange={(e) => setSettings({...settings, adminPhone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2"><Clock className="w-3 h-3"/> موعد تنبيه الإغلاق اليومي (ساعة)</label>
              <input type="number" min="0" max="23" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={settings.autoReportHour} onChange={(e) => setSettings({...settings, autoReportHour: parseInt(e.target.value) || 0})} />
              <p className="text-[9px] text-gray-600 mr-2">ملاحظة: 0 تعني منتصف الليل، 13 تعني الساعة 1 ظهراً.</p>
            </div>
          </div>
        </div>

        {/* هوية المتجر والفاتورة */}
        <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <Store className="text-green-500" /> بيانات الفاتورة المطبوعة
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-[#0f172a] rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
              {settings.logoBase64 ? (
                <img src={settings.logoBase64} className="w-full h-full object-contain p-2" />
              ) : (
                <Camera className="w-8 h-8 text-gray-700" />
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
              <div className="absolute inset-0 bg-black/60 items-center justify-center hidden group-hover:flex text-[10px] text-white font-bold">تغيير</div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">اسم المنشأة</label>
              <input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500 font-bold" value={settings.storeName} onChange={(e) => setSettings({...settings, storeName: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2"><MapPin className="w-3 h-3"/> العنوان</label>
              <input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={settings.storeAddress} onChange={(e) => setSettings({...settings, storeAddress: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2"><Phone className="w-3 h-3"/> تليفون المحل</label>
              <input type="text" className="w-full p-4 bg-[#0f172a] rounded-2xl text-white outline-none border border-gray-800 focus:border-blue-500" value={settings.storePhone} onChange={(e) => setSettings({...settings, storePhone: e.target.value})} />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-500 shadow-2xl shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-3">
        {saved ? <ShieldCheck className="w-8 h-8" /> : <Save className="w-8 h-8" />}
        {saved ? 'تم حفظ كافة الإعدادات' : 'حفظ التعديلات'}
      </button>
    </div>
  );
};

export default SettingsView;
