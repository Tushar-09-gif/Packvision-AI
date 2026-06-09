'use client';
import { BookOpen, FileText, CheckCircle, MessageCircle, X, Send, Maximize, Minimize } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function WorkerPackagingManualPage() {
  const { manualHtml, manualFileName, user, questions, addQuestion, fetchData } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [qText, setQText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData(); // Ensure questions are loaded
  }, [fetchData]);

  const handleAsk = async () => {
    if (!qText.trim() || !user) return;
    setLoading(true);
    await addQuestion({
      id: `Q-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      question: qText.trim(),
      answer: null,
      status: 'pending',
      timestamp: new Date().toISOString(),
      answeredAt: null,
    });
    setQText('');
    setLoading(false);
  };

  return (
    <div className="manual-workspace">
      <div style={{ marginBottom: 40 }}>
        <h1 className="page-title" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.02em' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
            <BookOpen size={24} />
          </div>
          Packaging Material Manual
        </h1>
        <p className="page-subtitle" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Standard operating procedures and packaging guidelines provided by the admin.</p>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className={`viewer-container ${isFullscreen ? 'fullscreen' : ''}`} style={{ width: '100%', maxWidth: '100%' }}>
          <div className="viewer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{(mounted && manualFileName) || 'No Document Available'}</h3>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Read-only Version</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {mounted && manualHtml && (
                <span className="badge badge-success" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} /> Loaded
                </span>
              )}
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
          
          <div className="viewer-body">
            {mounted && manualHtml ? (
              <div className="manual-paper" dangerouslySetInnerHTML={{ __html: manualHtml }} />
            ) : (
              <div className="viewer-empty">
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <BookOpen size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>No Document Available</h3>
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.6, margin: '0 auto' }}>The admin has not uploaded a packaging manual yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Ask Button */}
      {mounted && (
        <button 
          className="ask-fab"
          onClick={() => setPanelOpen(true)}
          style={{
            position: 'fixed', bottom: 40, right: 40, 
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 24px rgba(99,102,241,0.4)',
            border: 'none', cursor: 'pointer', zIndex: 90,
            transition: 'transform 0.2s',
          }}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Q&A Slide-over Panel */}
      {panelOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={() => setPanelOpen(false)} />
          <div className="qa-panel" style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 450,
            background: 'var(--bg-card)', zIndex: 101, display: 'flex', flexDirection: 'column',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.2)', borderLeft: '1px solid var(--surface-border)'
          }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={20} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Ask Admin</h2>
              </div>
              <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, background: 'var(--bg-primary)' }}>
              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                  <MessageCircle size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                  <p>No questions asked yet.<br/>Type below to ask the admin about packaging materials.</p>
                </div>
              ) : (
                questions.map(q => (
                  <div key={q.id} style={{ background: 'var(--surface)', padding: 20, borderRadius: 16, border: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{q.userName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(q.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: q.answer ? 16 : 0, fontWeight: 500, lineHeight: 1.5 }}>{q.question}</p>
                    
                    {q.answer ? (
                      <div style={{ background: 'var(--accent-subtle)', padding: 16, borderRadius: 12, borderLeft: '3px solid var(--accent)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>Admin Reply</div>
                        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{q.answer}</p>
                      </div>
                    ) : (
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)' }} /> Pending answer...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '24px 32px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <textarea 
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Ask a question about packaging..."
                  style={{ flex: 1, resize: 'none', height: 48, padding: '12px 16px', borderRadius: 24, border: '1px solid var(--surface-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 14 }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                />
                <button 
                  onClick={handleAsk}
                  disabled={loading || !qText.trim()}
                  style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--accent)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (loading || !qText.trim()) ? 0.5 : 1 }}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .manual-workspace {
          width: 100%;
          min-height: 80vh;
        }

        /* Viewer Container */
        .viewer-container {
          background: var(--bg-card);
          border: 1px solid var(--surface-border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        [data-theme='dark'] .viewer-container {
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .viewer-container.fullscreen {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
          border-radius: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .viewer-container.fullscreen .viewer-body {
          flex: 1;
        }
        .viewer-header {
          padding: 24px 32px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--surface-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .viewer-body {
          background: var(--bg-primary);
          padding: clamp(20px, 4vw, 40px);
          min-height: 600px;
          display: flex;
          justify-content: center;
          overflow-x: auto;
        }
        .viewer-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 100px 20px;
          width: 100%;
        }

        /* Manual Paper Style */
        .manual-paper {
          width: 100%;
          max-width: 1400px;
          background: #ffffff;
          color: #1e293b;
          padding: clamp(40px, 8vw, 100px) clamp(30px, 6vw, 80px);
          border-radius: 8px; /* Slightly rounded for web, but feels like paper */
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 0 10px rgba(0,0,0,0.03);
          font-family: 'Inter', system-ui, sans-serif;
          line-height: 1.8;
          font-size: clamp(16px, 1.8vw, 20px);
          overflow-wrap: break-word;
        }
        [data-theme='dark'] .manual-paper {
          background: #0f1115;
          color: #f1f5f9;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .manual-paper img { max-width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .manual-paper h1 { font-size: clamp(32px, 5vw, 48px); font-weight: 900; margin: 0 0 32px; color: var(--accent); line-height: 1.2; letter-spacing: -0.03em; border-bottom: 3px solid var(--accent-subtle); padding-bottom: 16px; }
        .manual-paper h2 { font-size: clamp(26px, 4vw, 36px); font-weight: 800; margin: 40px 0 20px; line-height: 1.3; letter-spacing: -0.02em; }
        .manual-paper h3 { font-size: clamp(22px, 3vw, 28px); font-weight: 700; margin: 32px 0 16px; letter-spacing: -0.01em; }
        .manual-paper h4, .manual-paper h5 { font-size: clamp(18px, 2.5vw, 24px); font-weight: 700; margin: 24px 0 12px; }
        
        .manual-paper p { margin-bottom: 20px; }
        .manual-paper p:last-child { margin-bottom: 0; }
        
        .manual-paper ul, .manual-paper ol { padding-left: clamp(20px, 4vw, 28px); margin-bottom: 24px; }
        .manual-paper li { margin-bottom: 10px; }
        
        /* Premium Tables */
        .manual-paper table { 
          width: 100%; 
          border-collapse: separate; 
          border-spacing: 0;
          margin: 32px 0; 
          font-size: clamp(15px, 1.4vw, 18px);
          border-radius: 12px;
          overflow: hidden;
          table-layout: auto;
          border: 1px solid var(--surface-border);
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .manual-paper th, .manual-paper td { 
          padding: clamp(12px, 1.5vw, 18px) clamp(16px, 2vw, 24px); 
          text-align: left; 
          vertical-align: top;
          word-break: break-word;
          border-bottom: 1px solid var(--surface-border);
          border-right: 1px solid var(--surface-border);
        }
        .manual-paper th:last-child, .manual-paper td:last-child { border-right: none; }
        .manual-paper tr:last-child td { border-bottom: none; }
        
        .manual-paper th { 
          background: var(--bg-secondary); 
          font-weight: 800; 
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 14px;
        }
        .manual-paper tr:hover td {
          background: var(--bg-glass);
        }
        
        .manual-paper strong, .manual-paper b { font-weight: 800; color: var(--text-primary); }
        .manual-paper em, .manual-paper i { font-style: italic; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
