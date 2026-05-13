'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
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
      const { data } = await api.post('/auth/login', { phone, password });
      login(data.user, data.token);
      router.push('/quiz');
    } catch (err) {
      setError(err.response?.data?.error || err.message || '登录失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#2D2B3D]">登录 NovelForge</h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium"
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">手机号</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required
              className="input-field" placeholder="输入手机号" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="input-field" placeholder="••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#9CA3AF]">
          还没有账号？{' '}
          <Link href="/register" className="font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
