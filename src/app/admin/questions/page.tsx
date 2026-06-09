'use client';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, Clock, Send } from 'lucide-react';

export default function AdminQuestionsPage() {
  const { questions, answerQuestion, fetchData } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const pendingQuestions = questions.filter(q => q.status === 'pending');
  const answeredQuestions = questions.filter(q => q.status === 'answered');

  const displayedQuestions = activeTab === 'pending' ? pendingQuestions : answeredQuestions;

  const handleAnswerSubmit = async (id: string) => {
    const text = answers[id];
    if (!text?.trim()) return;
    
    setLoading(prev => ({ ...prev, [id]: true }));
    await answerQuestion(id, text.trim());
    setLoading(prev => ({ ...prev, [id]: false }));
    setAnswers(prev => ({ ...prev, [id]: '' }));
  };

  if (!mounted) return null;

  return (
    <div className="qa-dashboard">
      <div className="page-header" style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, letterSpacing: '-0.02em' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 12px 30px rgba(99,102,241,0.3)' }}>
            <MessageCircle size={28} />
          </div>
          Worker Q&A
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          Review and answer packaging material questions asked by workers on the shop floor.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
            background: activeTab === 'pending' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'pending' ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: activeTab === 'pending' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderBottom: activeTab === 'pending' ? '3px solid var(--accent)' : '3px solid transparent'
          }}
        >
          <Clock size={18} /> Pending ({pendingQuestions.length})
        </button>
        <button 
          onClick={() => setActiveTab('answered')}
          style={{
            padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
            background: activeTab === 'answered' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'answered' ? 'var(--success)' : 'var(--text-muted)',
            boxShadow: activeTab === 'answered' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderBottom: activeTab === 'answered' ? '3px solid var(--success)' : '3px solid transparent'
          }}
        >
          <CheckCircle size={18} /> Answered ({answeredQuestions.length})
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {displayedQuestions.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--surface-border)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={40} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No {activeTab} questions at the moment.</p>
          </div>
        ) : (
          displayedQuestions.map(q => (
            <div key={q.id} className="q-card" style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--surface-border)', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {q.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{q.userName}</h4>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(q.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                {q.status === 'pending' ? (
                  <span style={{ padding: '6px 12px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} /> Needs Answer
                  </span>
                ) : (
                  <span style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} /> Answered
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: 18, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>
                "{q.question}"
              </div>

              {q.status === 'pending' ? (
                <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 16, border: '1px solid var(--surface-border)' }}>
                  <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.05em' }}>Your Answer</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <textarea 
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Type your answer here..."
                      style={{ flex: 1, resize: 'vertical', minHeight: 60, padding: 16, borderRadius: 12, border: '1px solid var(--surface-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 15 }}
                    />
                    <button 
                      onClick={() => handleAnswerSubmit(q.id)}
                      disabled={loading[q.id] || !answers[q.id]?.trim()}
                      style={{ padding: '0 24px', borderRadius: 12, background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: (loading[q.id] || !answers[q.id]?.trim()) ? 0.5 : 1, transition: '0.2s' }}
                    >
                      <Send size={18} /> {loading[q.id] ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--accent-subtle)', padding: 24, borderRadius: 16, borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.05em' }}>Admin Reply</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.answeredAt ? new Date(q.answeredAt).toLocaleString() : ''}</div>
                  </div>
                  <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.6 }}>{q.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
