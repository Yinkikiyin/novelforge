import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata = {
  title: 'NovelForge - AI小说生成器',
  description: '通过性格测试，生成属于你自己的小说',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
