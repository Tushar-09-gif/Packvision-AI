'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LayoutDashboard, Camera, FileSpreadsheet, Package, BookOpen } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/worker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/worker/scan', label: 'AI Scan', icon: Camera },
  { href: '/worker/sku', label: 'Product SKUs', icon: FileSpreadsheet },
  { href: '/worker/catalog', label: 'Catalog', icon: Package },
  { href: '/worker/manual', label: 'SOP Manual', icon: BookOpen },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Use Zustand persisted state directly — no sessionStorage conflict
  const { user, setUser, theme, addActivityLog, fetchData } = useAppStore();

  const workerName = user?.name || null;
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAuthChecked(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authChecked) {
      if (!user || (user.role !== 'worker' && user.role !== 'admin')) {
        router.replace('/login');
      } else {
        fetchData();
      }
    }
  }, [authChecked, user, router, fetchData]);

  const handleExit = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.replace('/login');
  };

  if (!mounted || !authChecked) return null;
  if (!workerName && user?.role !== 'admin') return null;

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
              {workerName ? workerName[0].toUpperCase() : 'W'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {workerName || 'Worker'}
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
