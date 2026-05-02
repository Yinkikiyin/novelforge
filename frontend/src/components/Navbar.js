'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8E4F0' }}
      className="sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NovelForge
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          {user ? (
            <>
              <Link href="/quiz" className="text-[#2D2B3D] hover:text-[#8B5CF6] transition-colors">
                测试
              </Link>
              <Link href="/dashboard" className="text-[#2D2B3D] hover:text-[#8B5CF6] transition-colors">
                我的小说
              </Link>
              <span className="text-[#9CA3AF]">{user.name}</span>
              <button onClick={logout}
                className="text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer">
                退出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[#2D2B3D] hover:text-[#8B5CF6] transition-colors">
                登录
              </Link>
              <Link href="/register" className="btn-primary text-xs px-5 py-2">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
