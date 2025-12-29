
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// بسيط: Error Boundary لالتقاط أخطاء الواجهة وعرض رسالة بديلة
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // رصد الأخطاء لاختبار/لوغ
    console.error('Unhandled error in React tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, direction: 'rtl', fontFamily: 'sans-serif' }}>
          حدث خطأ في التطبيق. الرجاء إعادة التشغيل أو مراجعة وحدة التحكم للمزيد من التفاصيل.
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

// تسجيل Service Worker فقط في البيئات الانتاجية
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// تفعيل HMR الخاص بـ Vite
if ((import.meta as any).hot) {
  (import.meta as any).hot.accept();
}
