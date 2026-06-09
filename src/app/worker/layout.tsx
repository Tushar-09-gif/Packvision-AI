'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Home, Camera, Grid3X3, User, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/worker', label: 'Home', icon: Home },
  { href: '/worker/scan', label: 'Scan', icon: Camera },
  { href: '/worker/catalog', label: 'Products', icon: Grid3X3 },
  { href: '/worker/manual', label: 'Manual', icon: BookOpen },
];

function WorkerNameGate({ onEnter }: { onEnter: (name: string) => void }) {
  const [name, setName] = useState('');

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)',
      position: 'relative', overflow: 'hidden', padding: '20px',
    }}>
      <div className="orb orb-1" style={{ opacity: 0.08 }} />
      <div className="orb orb-2" style={{ opacity: 0.08 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="glass-card"
        style={{ width: '100%', maxWidth: 420, padding: 'clamp(28px, 6vw, 48px)', textAlign: 'center' }}
      >
        <div style={{
          width: 68, height: 68, borderRadius: 18,
          background: 'var(--gradient-brand)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
        }}>
          <User size={32} color="white" />
        </div>

        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Worker Portal
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>
          Enter your name to access the product catalog and scanner.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onEnter(name.trim()); }}>
          <div className="float-label" style={{ marginBottom: 18, textAlign: 'left' }}>
            <label>Your Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. Rahul, Priya, Amit..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              style={{ fontSize: 16 }}
            />
          </div>
          <motion.button
            type="submit"
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={!name.trim()}
            style={{ width: '100%', padding: '14px', fontSize: 15, opacity: name.trim() ? 1 : 0.45 }}
          >
            Enter <ArrowRight size={16} />
          </motion.button>
        </form>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          Admin?{' '}
          <Link href="/login" style={{ color: 'var(--accent-hover)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in here →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Use Zustand persisted state directly — no sessionStorage conflict
  const { user, setUser, theme, addActivityLog } = useAppStore();

  const workerName = user?.name || null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleEnter = (name: string) => {
    setUser({
      id: `W-${Date.now()}`,
      name,
      role: 'worker',
      avatar: name[0].toUpperCase(),
      email: '',
    });
    addActivityLog({
      id: `AL-${Date.now()}`,
      userName: name,
      action: 'logged in to',
      target: 'Worker Panel',
      timestamp: new Date().toISOString(),
      type: 'login',
    });
  };

  const handleExit = () => {
    setUser(null);
  };

  // Show name gate if no worker logged in
  if (!workerName) {
    return (
      <div data-theme={theme}>
        <WorkerNameGate onEnter={handleEnter} />
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}
      data-theme={theme}
    >
      {/* Header */}
      <header style={{
        height: 60, background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--gradient-brand)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13, color: 'white',
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>PackVision AI</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Worker</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--gradient-brand)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: 'white',
            }}>
              {workerName[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {workerName}
            </span>
          </div>
          {user?.role === 'admin' ? (
            <Link
              href="/admin"
              style={{
                padding: '5px 12px', background: 'var(--accent-subtle)',
                border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6,
                color: 'var(--accent-hover)', textDecoration: 'none', fontSize: 12, fontWeight: 600,
              }}
            >
              Admin Panel
            </Link>
          ) : (
            <button
              onClick={handleExit}
              style={{
                padding: '5px 12px', background: 'var(--bg-glass)',
                border: '1px solid var(--surface-border)', borderRadius: 6,
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '20px 16px 90px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        <div className="page-enter">{children}</div>
      </main>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 68,
        background: 'var(--bg-secondary)', borderTop: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: '0 16px', zIndex: 40,
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3, padding: '10px 0',
                borderRadius: 'var(--radius-md)', textDecoration: 'none',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-hover)' : 'var(--text-muted)',
                transition: 'all 0.2s', maxWidth: 120,
              }}>
              <item.icon size={22} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
