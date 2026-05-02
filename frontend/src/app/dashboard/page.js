'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardPage() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadNovels();
  }, [user]);

  const loadNovels = async () => {
    try {
      const { data } = await api.get('/novel/list');
      setNovels(data);
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除？')) return;
    try {
      await api.delete(`/novel/${id}`);
      setNovels(prev => prev.filter(n => n.id !== id));
    } catch { alert('删除失败'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#2D2B3D]">我的小说</h1>
        <Link href="/quiz" className="btn-primary text-sm">+ 创建新小说</Link>
      </div>

      {error && <p className="text-[#EF4444] font-medium mb-4">{error}</p>}

      {novels.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2 text-[#2D2B3D]">还没有小说</h3>
          <p className="text-[#9CA3AF] mb-6">做一次性格测试，生成你的第一篇小说吧</p>
          <Link href="/quiz" className="btn-primary">开始测试</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {novels.map(novel => (
            <div key={novel.id} className="card card-hover group">
              <Link href={`/novel/${novel.id}`}>
                <h3 className="text-lg font-bold mb-2 text-[#2D2B3D] group-hover:text-[#8B5CF6] transition-colors">
                  《{novel.title}》
                </h3>
              </Link>
              {novel.protagonistProfile && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {novel.protagonistProfile.slice(0, 4).map(p => (
                    <span key={p.dimension}
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                      {p.trait}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs font-medium text-[#9CA3AF]">
                <span>{new Date(novel.createdAt).toLocaleDateString('zh-CN')}</span>
                <div className="flex gap-3">
                  <Link href={`/novel/${novel.id}`} className="hover:text-[#8B5CF6] transition-colors">阅读</Link>
                  <button onClick={() => handleDelete(novel.id)}
                    className="text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
