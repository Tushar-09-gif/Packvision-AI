'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, HardHat, ArrowRight, Eye, EyeOff, Zap, AlertCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

const ADMIN_EMAIL = 'admin@packvisionai.com';
const ADMIN_PASSWORD = 'packvisionai@123';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const { loginContent, fetchLoginContent } = useAppStore();
  const [tab, setTab] = useState<'admin' | 'worker'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoginContent();
  }, [fetchLoginContent]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try {
        const payload = { id: 'U-001', name: 'Tushar Makwana', role: 'admin', avatar: 'T', email };
        await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
        setUser(payload as any);
        useAppStore.getState().addActivityLog({
          id: `AL-${Date.now()}`,
          userId: payload.id,
          userName: payload.name,
          action: 'logged in to',
          target: 'Admin Panel',
          timestamp: new Date().toISOString(),
          type: 'login',
        });
        router.push('/admin');
      } catch (err) {
        setError('Server error during login.');
        setLoading(false);
      }
    } else {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  const handleWorkerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!workerName.trim()) { setError('Please enter your name.'); return; }
    setLoading(true);
    try {
      const initials = workerName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const payload = { id: `W-${Date.now()}`, name: workerName.trim(), role: 'worker', avatar: initials, email: '' };
      await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
      setUser(payload as any);
      useAppStore.getState().addActivityLog({
        id: `AL-${Date.now()}`,
        userId: payload.id,
        userName: payload.name,
        action: 'logged in to',
        target: 'Worker Panel',
        timestamp: new Date().toISOString(),
        type: 'login',
      });
      router.push('/worker');
    } catch (err) {
      setError('Server error during login.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      {/* Left — Login Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(24px,5vw,80px)', position: 'relative', zIndex: 1, maxWidth: 540, minWidth: 320 }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white' }}>A</div>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>PackVision AI</span>
          </div>

          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
            {loginContent?.title || 'Welcome back'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
            {loginContent?.subtitle || 'Sign in to access the Product Management System'}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', padding: 4, borderRadius: 'var(--radius-md)', marginBottom: 28, border: '1px solid var(--surface-border)' }}>
            {(['admin', 'worker'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                style={{ flex: 1, padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s',
                  background: tab === t ? 'var(--bg-elevated)' : 'transparent',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                }}>
                {t === 'admin' ? <Shield size={14} /> : <HardHat size={14} />}
                {t === 'admin' ? (loginContent?.adminTabLabel || 'Admin') : (loginContent?.workerTabLabel || 'Employee')}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 18, fontSize: 13, color: 'var(--danger)' }}>
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {tab === 'admin' ? (
              <motion.form key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={handleAdminLogin}>
                <div className="float-label" style={{ marginBottom: 14 }}>
                  <label>Email Address</label>
                  <input id="admin-email" className="input-field" type="email" placeholder="admin@packvisionai.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="float-label" style={{ marginBottom: 24 }}>
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="admin-password" className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <motion.button id="admin-signin-btn" type="submit" className="btn-primary" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', padding: '13px 24px', fontSize: 14, opacity: loading ? 0.7 : 1, justifyContent: 'center' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Signing in...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Sign in as Admin <ArrowRight size={15} />
                    </span>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form key="worker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={handleWorkerLogin}>
                <div style={{ padding: '14px 16px', background: 'var(--info-subtle)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 13, color: 'var(--info)' }}>
                  Employee access lets you view the product catalog. No password required.
                </div>
                <div className="float-label" style={{ marginBottom: 24 }}>
                  <label>Your Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="worker-name" className="input-field" type="text" placeholder="Enter your full name" required value={workerName} onChange={e => setWorkerName(e.target.value)} style={{ paddingLeft: 42 }} />
                  </div>
                </div>
                <motion.button id="worker-signin-btn" type="submit" className="btn-primary" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', padding: '13px 24px', fontSize: 14, opacity: loading ? 0.7 : 1, justifyContent: 'center', background: 'var(--info)' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Entering...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Access Employee Portal <ArrowRight size={15} />
                    </span>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right — Visual Panel */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
        className="login-right"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '100vh' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 40, maxWidth: 380 }}>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 160, height: 160, borderRadius: 'var(--radius-xl)', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 20px 60px rgba(99,102,241,0.25)' }}>
            <Zap size={64} color="white" strokeWidth={1.5} />
          </motion.div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>Product Intelligence</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
            Enterprise-grade product catalog management with AI recognition, bulk CSV import, and real-time analytics.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left' }}>
            {['191 Products', '3 Categories', 'CSV Import', 'Role-Based Access'].map(f => (
              <div key={f} style={{ padding: '10px 14px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-right { display: none !important; }
        }
      `}</style>
    </div>
  );
}
