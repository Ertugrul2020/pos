
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Sale } from './types.ts';

export const getAIInsights = async (sales: Sale[], products: Product[]) => {
  const apiKey = process?.env?.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. AI Insights will not work.");
    return { insights: [] };
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      تحليل مبيعات المتجر الحالي:
      إجمالي عدد المبيعات: ${sales.length}
      المنتجات المتوفرة: ${products.map(p => `${p.name} (سعر: ${p.price}, مخزون: ${p.stock})`).join(', ')}
      آخر 50 عملية بيع: ${JSON.stringify(sales.slice(-50).map(s => ({ total: s.totalAmount, date: new Date(s.timestamp).toLocaleDateString() })))}
    `,
    config: {
      systemInstruction: "أنت خبير نمو تجاري لمتاجر التجزئة والمطاعم. قم بتحليل البيانات المقدمة واستخراج 3 نصائح ذهبية باللغة العربية لزيادة الأرباح أو تحسين إدارة المخزون. الرد يجب أن يكون بتنسيق JSON حصراً بمصفوفة insights تحتوي على حقول title و description.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          }
        },
        required: ["insights"]
      }
    }
  });

  try {
    const jsonStr = response.text || '{"insights": []}';
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return { insights: [] };
  }
};
