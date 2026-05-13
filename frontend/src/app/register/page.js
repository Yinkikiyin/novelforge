'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, phone, password });
      login(data.user, data.token);
      router.push('/quiz');
    } catch (err) {
      setError(err.response?.data?.error || err.message || '注册失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md">
        {/* 权益说明 */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h3 className="font-semibold text-[#2D2B3D] mb-1">注册即享专属小说库</h3>
              <p className="text-sm text-[#6B7280]">永久保存你生成的每一篇小说，随时随地回看你的专属故事</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#2D2B3D]">创建账号</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1.5">昵称</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="input-field" placeholder="你的昵称" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1.5">手机号</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required
                className="input-field" placeholder="11位手机号" maxLength={11} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1.5">密码</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="input-field" placeholder="至少6位" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#9CA3AF]">
            已有账号？{' '}
            <Link href="/login" className="font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">
              去登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
