'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function NovelDetailPage() {
  const { id } = useParams();
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadNovel();
  }, [user, id]);

  const loadNovel = async () => {
    try {
      const { data } = await api.get(`/novel/${id}`);
      setNovel(data);
    } catch { setError('加载小说失败'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-[#EF4444] font-medium mb-4">{error || '小说不存在'}</p>
        <Link href="/dashboard" className="btn-outline">返回</Link>
      </div>
    );
  }

  const { title, worldSetting, plot, protagonistProfile, createdAt } = novel;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in">
      <Link href="/dashboard" className="text-sm font-medium text-[#9CA3AF] hover:text-[#8B5CF6] transition-colors">
        ← 返回我的小说
      </Link>

      <h1 className="text-3xl md:text-4xl font-extrabold my-6 text-center"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        《{title}》
      </h1>

      {protagonistProfile?.length > 0 && (
        <div className="card mb-4">
          <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">主角性格</h3>
          <div className="flex flex-wrap gap-2">
            {protagonistProfile.map(p => (
              <span key={p.dimension}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                {p.dimension.replace(/\/.*$/, '')}: {p.trait}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">🌍 世界观设定</h3>
        <p className="text-[#2D2B3D] leading-relaxed whitespace-pre-wrap text-[15px]">{worldSetting}</p>
      </div>

      <div className="card mb-8">
        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">📖 故事主线</h3>
        <p className="text-[#2D2B3D] leading-relaxed whitespace-pre-wrap text-[15px]">{plot}</p>
      </div>

      <p className="text-center text-[#9CA3AF] font-medium text-xs">
        生成于 {new Date(createdAt).toLocaleDateString('zh-CN')}
      </p>
    </div>
  );
}
