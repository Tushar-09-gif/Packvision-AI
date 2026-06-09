'use client';
import { motion } from 'framer-motion';
import { Camera, Search, Package, Scan, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

export default function WorkerDashboard() {
  const { products, recognitionLogs, user } = useAppStore();
  const recentScans = recognitionLogs.slice(0, 3);
  const workerName = user?.name || 'Worker';

  return (
    <div>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28, padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-brand)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Welcome, {workerName} 👋</h1>
          <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>Scan any product to instantly get its details, instructions, and packaging info.</p>
        </div>
        <div style={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', right: 40, top: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      </motion.div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        <Link href="/worker/scan" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="glass-card"
            style={{ padding: 24, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Camera size={28} color="#6366f1" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Scan Product</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Open camera &amp; identify</div>
          </motion.div>
        </Link>
        <Link href="/worker/catalog" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="glass-card"
            style={{ padding: 24, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Search size={28} color="#22c55e" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Search Products</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Browse full catalog</div>
          </motion.div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Products', val: products.length, icon: Package, color: '#6366f1' },
          { label: 'Your Scans', val: 47, icon: Scan, color: '#22c55e' },
          { label: 'Accuracy', val: '96%', icon: CheckCircle, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
            <s.icon size={18} color={s.color} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 22, fontWeight: 800 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Scans */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Recent Scans</h2>
        {recentScans.map((scan) => (
          <div key={scan.id} className="glass-card" style={{ padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: scan.matched ? 'var(--success-subtle)' : 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {scan.matched ? <CheckCircle size={18} color="var(--success)" /> : <Scan size={18} color="var(--danger)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{scan.productName || 'Unrecognized'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} /> {new Date(scan.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: scan.confidence > 80 ? 'var(--success)' : 'var(--warning)' }}>{scan.confidence}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
