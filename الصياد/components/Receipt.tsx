
import React, { useState, useEffect } from 'react';
import { Sale, AppSettings } from '../types.ts';
import { db } from '../db.ts';

interface ReceiptProps {
  sale: Sale;
}

const Receipt: React.FC<ReceiptProps> = ({ sale }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const subtotal = sale.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.14;

  useEffect(() => {
    db.settings.get('main').then(setSettings);
  }, []);

  if (!settings) return null;

  return (
    <div className="p-4 text-black text-center" style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', backgroundColor: '#fff' }}>
      {settings.logoBase64 && (
        <img src={settings.logoBase64} className="w-20 h-20 mx-auto mb-2 object-contain" alt="Store Logo" />
      )}
      <h2 className="text-xl font-bold border-b-2 border-black pb-1">{settings.storeName}</h2>
      <p className="text-[10px]">{settings.storeAddress}</p>
      <p className="text-[10px] mb-2">ت: {settings.storePhone}</p>
      
      <div className="border-y border-black my-2 flex justify-between text-[9px] py-1">
        <span>رقم: #{sale.id}</span>
        <span>{new Date(sale.timestamp).toLocaleString('ar-EG')}</span>
      </div>

      <table className="w-full text-[9px] mt-2">
        <thead>
          <tr className="border-b border-black">
            <th className="text-right">الصنف</th>
            <th className="text-center">سعر</th>
            <th className="text-center">كم</th>
            <th className="text-left">إجمالي</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="text-right py-1">{item.name}</td>
              <td className="text-center">{item.price.toFixed(1)}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-left font-bold">{item.total.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 text-[10px] space-y-1">
        <div className="flex justify-between"><span>الفرعي:</span><span>{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>الضريبة:</span><span>{tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-black text-sm border-t border-black pt-1">
          <span>الإجمالي:</span><span>{sale.totalAmount.toFixed(2)} ج.م</span>
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-black pt-2 text-[9px]">
        <p>الدفع: {sale.paymentMethod === 'cash' ? 'نقدي' : 'فيزا'}</p>
        <p className="mt-2 font-bold italic">شكراً لزيارتكم</p>
      </div>
    </div>
  );
};

export default Receipt;
