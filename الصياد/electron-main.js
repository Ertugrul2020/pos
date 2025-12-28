
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "الصياد - نظام المبيعات المتقدم",
    icon: path.join(__dirname, 'icon.png'), // تأكد من وجود أيقونة بهذا الاسم أو سيتجاهلها
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#0f172a'
  });

  // إزالة القائمة الافتراضية للمتصفح
  Menu.setApplicationMenu(null);

  // تحميل ملف المشروع الرئيسي
  win.loadFile('index.html');

  // فتح البرنامج بملء الشاشة عند البدء
  win.maximize();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
