'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

const dimColors = {
  bravery: '#8B5CF6', idealism: '#F472B6', passion: '#F59E0B',
  altruism: '#10B981', rebellion: '#3B82F6', extraversion: '#EC4899',
};
const dimLabels = {
  bravery: '勇气', idealism: '理想', passion: '热血',
  altruism: '利他', rebellion: '叛逆', extraversion: '开朗',
};

export default function ResultPage() {
  const [result, setResult] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isGuest = searchParams.get('guest') === 'true';

  useEffect(() => {
    if (!user && !isGuest) { router.push('/login'); return; }
    const stored = localStorage.getItem('lastResult');
    if (stored) {
      try { setResult(JSON.parse(stored)); } catch { router.push('/quiz'); }
    } else { router.push('/quiz'); }
  }, [user, isGuest]);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { title, worldSetting, plot, protagonistProfile } = result;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in">
      <h1 className="text-3xl font-bold mb-2 text-center text-[#2D2B3D]">
        你的小说已生成 ✨
      </h1>

      {/* Personality */}
      <div className="card my-8">
        <h3 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wide mb-4">性格画像</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {protagonistProfile.map((item) => {
            const key = Object.keys(dimLabels).find(k => dimLabels[k] === item.dimension.replace(/\/.*$/, '')) || 'bravery';
            const pct = (item.score / 5) * 100;
            return (
              <div key={item.dimension} className="text-center">
                <div className="text-xs font-medium text-[#9CA3AF] mb-1.5">{dimLabels[key] || item.dimension}</div>
                <div className="h-24 rounded-xl bg-[#F3F0F8] relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-xl transition-all duration-700"
                    style={{ height: `${pct}%`, backgroundColor: dimColors[key] || '#8B5CF6', opacity: 0.25 }} />
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-lg"
                    style={{ color: dimColors[key] || '#8B5CF6' }}>
                    {item.score}
                  </div>
                </div>
                <div className="text-xs font-medium mt-1 text-[#2D2B3D]">{item.trait}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-extrabold my-8 text-center"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        《{title}》
      </h2>

      {/* World */}
      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">🌍 世界观设定</h3>
        <p className="text-[#2D2B3D] leading-relaxed whitespace-pre-wrap text-[15px]">{worldSetting}</p>
      </div>

      {/* Plot */}
      <div className="card mb-6">
        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">📖 故事主线</h3>
        <p className="text-[#2D2B3D] leading-relaxed whitespace-pre-wrap text-[15px]">{plot}</p>
      </div>

      {/* 游客注册引导 */}
      {isGuest && (
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)', textAlign: 'center' }}>
          <p className="text-sm text-[#6B7280] mb-3">📚 喜欢这篇小说？注册账号永久保存到你的专属小说库</p>
          <Link href="/register" className="btn-primary text-sm">免费注册 · 保存小说</Link>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link href={isGuest ? "/quiz?guest=true" : "/quiz"} className="btn-outline">重新测试</Link>
        {user ? (
          <Link href="/dashboard" className="btn-primary">我的小说库</Link>
        ) : (
          <Link href="/register" className="btn-primary">注册保存小说</Link>
        )}
      </div>
    </div>
  );
}
