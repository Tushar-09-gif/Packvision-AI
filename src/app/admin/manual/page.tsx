'use client';
import { useState, useRef, useEffect } from 'react';
import { BookOpen, Upload, FileText, CheckCircle, Maximize, Minimize, Trash2 } from 'lucide-react';
import mammoth from 'mammoth';

import { useAppStore } from '@/lib/store';

export default function PackagingManualPage() {
  const { manualHtml, manualFileName, setManual } = useAppStore();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setManual(result.value, file.name);
    } catch (err) {
      console.error(err);
      alert('Error extracting Word file. Make sure it is a valid .docx file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manual-workspace">
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, letterSpacing: '-0.03em' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 12px 32px rgba(99,102,241,0.35)' }}>
            <BookOpen size={36} />
          </div>
          Packaging Material Manual
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>Upload and manage your packaging specifications. The document will be instantly distributed to all workers in a highly readable format.</p>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {/* Content Viewer - Made Large */}
        <div className={`viewer-container ${isFullscreen ? 'fullscreen' : ''}`} style={{ width: '100%', maxWidth: '100%' }}>
          <div className="viewer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{mounted && manualFileName ? manualFileName : 'Document Viewer'}</h3>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{mounted && manualHtml ? 'Live Preview' : 'Awaiting Upload'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {mounted && manualHtml && (
                <>
                  <span className="badge badge-success" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={16} /> Ready
                  </span>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove the current manual?')) {
                        setManual(null, null);
                      }
                    }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </>
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
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <BookOpen size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>No Document Loaded</h3>
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.6 }}>Upload a .docx file to see the beautifully formatted preview here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Upload Box */}
      <div className="upload-zone floating" onClick={() => fileRef.current?.click()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="upload-icon-wrapper" style={{ margin: 0, width: 48, height: 48 }}>
            <Upload size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{loading ? 'Processing...' : 'Upload Manual'}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Select a .docx file</p>
          </div>
        </div>
        <input type="file" accept=".docx" ref={fileRef} onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>

      <style jsx global>{`
        .manual-workspace {
          width: 100%;
          min-height: 80vh;
          position: relative;
        }

        /* Floating Upload Zone */
        .upload-zone.floating {
          position: fixed;
          bottom: 40px;
          right: 40px;
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 100px;
          background: var(--bg-card);
          padding: 8px 24px 8px 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }
        [data-theme='dark'] .upload-zone.floating {
          box-shadow: 0 12px 30px rgba(0,0,0,0.5);
          background: #1e293b;
          border-color: rgba(99,102,241,0.5);
        }
        .upload-zone.floating:hover {
          border-color: var(--accent);
          background: var(--accent-subtle);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(99,102,241,0.3);
        }
        .upload-icon-wrapper {
          border-radius: 50%;
          background: var(--gradient-brand);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 8px 16px rgba(99,102,241,0.3);
          transition: transform 0.3s ease;
        }
        .upload-zone.floating:hover .upload-icon-wrapper {
          transform: scale(1.05);
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
