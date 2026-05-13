'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const timerRef = useRef(null);
  const isGuest = searchParams.get('guest') === 'true';

  useEffect(() => {
    if (!user && !isGuest) { router.push('/login'); return; }
    loadQuestions();
    return () => clearTimeout(timerRef.current);
  }, [user, isGuest]);

  const loadQuestions = async () => {
    try {
      const { data } = await api.get('/quiz/questions');
      setQuestions(data);
    } catch { setError('加载测试题失败'); }
    finally { setLoading(false); }
  };

  const selectAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentIndex < questions.length - 1) {
      timerRef.current = setTimeout(() => {
        setAnimating(true);
        setTimeout(() => { setCurrentIndex(i => i + 1); setAnimating(false); }, 200);
      }, 400);
    }
  };

  const handlePrev = () => {
    clearTimeout(timerRef.current);
    if (currentIndex > 0) {
      setAnimating(true);
      setTimeout(() => { setCurrentIndex(i => i - 1); setAnimating(false); }, 200);
    }
  };

  const changeAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentIndex < questions.length - 1) {
      timerRef.current = setTimeout(() => {
        setAnimating(true);
        setTimeout(() => { setCurrentIndex(i => i + 1); setAnimating(false); }, 200);
      }, 400);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitting(true);
    const payload = questions.map(q => ({ questionId: q.id, value: answers[q.id] }));
    try {
      const endpoint = isGuest ? '/novel/generate-guest' : '/novel/generate';
      const { data } = await api.post(endpoint, { answers: payload });
      localStorage.setItem('lastResult', JSON.stringify(data));
      router.push(isGuest ? '/quiz/result?guest=true' : '/quiz/result');
    } catch (err) {
      setError(err.response?.data?.error || '生成失败');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-[#EF4444] font-medium mb-4">{error}</p>
        <button onClick={loadQuestions} className="btn-outline">重试</button>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = Object.keys(answers).length === questions.length;
  const hasAnswered = answers[q?.id] !== undefined;

  return (
    <div className="max-w-2xl mx-auto min-h-[70vh] flex flex-col px-4 py-8">
      {/* Progress */}
      <div className="mb-8 animate-fade">
        <div className="flex items-center justify-between text-sm text-[#9CA3AF] mb-2">
          <span className="font-medium">第 {currentIndex + 1} / {questions.length} 题</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div key={currentIndex} className="flex-1 animate-in">
        <h2 className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed text-[#2D2B3D]">
          {q.text}
        </h2>

        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            const isSelected = answers[q.id] === opt.value;
            return (
              <button
                key={idx}
                onClick={() => hasAnswered ? changeAnswer(q.id, opt.value) : selectAnswer(q.id, opt.value)}
                className={`quiz-option ${isSelected ? 'selected' : ''}`}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold mr-3"
                  style={isSelected ? { background: '#8B5CF6', color: '#fff' } : { background: '#F3E8FF', color: '#8B5CF6' }}>
                  {opt.value}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: '1px solid #E8E4F0' }}>
        <button onClick={handlePrev} disabled={currentIndex === 0}
          className="btn-outline text-sm px-5 py-2">
          ← 上一题
        </button>

        <span className="text-sm font-medium text-[#9CA3AF]">
          {allAnswered ? '全部答完 ✓' : `还剩 ${questions.length - Object.keys(answers).length} 题`}
        </span>

        {allAnswered && (
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary text-sm px-5 py-2">
            {submitting ? '生成中…' : '提交生成'}
          </button>
        )}
        {!allAnswered && <div className="w-24" />}
      </div>
    </div>
  );
}
