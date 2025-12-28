
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { getAIInsights } from '../geminiService.ts';
import { BrainCircuit, Sparkles, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<{title: string, description: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const sales = await db.sales.toArray();
      const products = await db.products.toArray();
      
      if (sales.length < 5) {
        setError("نحتاج إلى 5 مبيعات على الأقل للبدء في تحليل البيانات وتقديم نصائح دقيقة.");
        setLoading(false);
        return;
      }

      const result = await getAIInsights(sales, products);
      setInsights(result.insights);
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. تأكد من جودة الإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-gradient-to-l from-[#1e40af] to-[#1e293b] p-8 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-2xl backdrop-blur-md border border-blue-400/30">
                <BrainCircuit className="w-8 h-8 text-blue-300" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">مستشار الصياد الذكي</h2>
            </div>
            <p className="max-w-xl text-blue-100/80 font-medium text-lg leading-relaxed">
              تحليل فوري لمخزونك ومبيعاتك باستخدام أحدث تقنيات الذكاء الاصطناعي لتقديم خطط نمو لمتجرك.
            </p>
          </div>
          <button 
            disabled={loading}
            onClick={fetchInsights}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 border-2 border-blue-400/50 disabled:opacity-50"
          >
            {loading ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            تحديث التحليل
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold text-lg animate-pulse">جاري تحليل الاستراتيجيات...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem] text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-200 font-bold text-lg">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-gray-800 flex flex-col hover:border-blue-500/50 transition-all group shadow-xl">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">{insight.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium flex-1">{insight.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
