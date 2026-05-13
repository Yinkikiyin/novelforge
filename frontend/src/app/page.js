'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl md:text-8xl font-extrabold mb-4 tracking-tight leading-none">
        <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NovelForge
        </span>
      </h1>
      <p className="text-lg md:text-xl text-[#6B7280] max-w-lg mb-12 leading-relaxed">
        一份性格测试，AI 为你量身打造独一无二的小说世界
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {user ? (
          <Link href="/quiz" className="btn-primary text-lg">开始性格测试</Link>
        ) : (
          <>
            <Link href="/register" className="btn-primary text-lg">免费开始</Link>
            <Link href="/login" className="btn-outline text-lg">已有账号？登录</Link>
          </>
        )}
      </div>

      {/* 游客通道 */}
      {!user && (
        <div className="mb-16">
          <Link href="/quiz?guest=true" className="text-sm text-[#9CA3AF] hover:text-[#8B5CF6] transition-colors underline underline-offset-4">
            不想注册？免注册直接体验 →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {[
          { emoji: '🧠', title: '性格测试', desc: '30道精选题目，深度分析你的性格特质' },
          { emoji: '🦸', title: '主角塑造', desc: 'AI根据你的性格，创造独特的主角形象' },
          { emoji: '📖', title: '小说生成', desc: '自动生成世界观、剧情和精彩的小说名' },
        ].map((item) => (
          <div key={item.title} className="card text-center">
            <div className="text-3xl mb-3">{item.emoji}</div>
            <h3 className="text-base font-semibold mb-1 text-[#2D2B3D]">{item.title}</h3>
            <p className="text-[#9CA3AF] text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
