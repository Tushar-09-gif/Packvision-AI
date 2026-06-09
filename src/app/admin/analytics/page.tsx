'use client';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Scan, Package, Users, Clock, Target, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useMemo } from 'react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function AnalyticsPage() {
  const { products, recognitionLogs } = useAppStore();

  const m = useMemo(() => {
    const totalScans = recognitionLogs.length;
    const successfulScans = recognitionLogs.filter(l => l.matched).length;
    const uniqueProducts = new Set(recognitionLogs.filter(l => l.productId).map(l => l.productId)).size;
    const accuracy = totalScans > 0 ? ((successfulScans / totalScans) * 100).toFixed(1) : '0.0';
    
    // Weekly data (Mon-Sun)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekStats = Array.from({ length: 7 }, (_, i) => ({ day: days[(i + 1) % 7], scans: 0, matches: 0 }));
    const getDayIndex = (d: number) => d === 0 ? 6 : d - 1;

    // Hourly data (0-23)
    const hourStats = new Array(24).fill(0);

    const catStats: Record<string, { scans: number }> = {};
    const workerStats: Record<string, { scans: number, matches: number, avatar: string }> = {};

    recognitionLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const dayIdx = getDayIndex(date.getDay());
      weekStats[dayIdx].scans++;
      if (log.matched) weekStats[dayIdx].matches++;

      hourStats[date.getHours()]++;

      if (!workerStats[log.userName]) workerStats[log.userName] = { scans: 0, matches: 0, avatar: log.userName.charAt(0).toUpperCase() };
      workerStats[log.userName].scans++;
      if (log.matched) workerStats[log.userName].matches++;

      if (log.productId) {
        const product = products.find(p => p.id === log.productId);
        const cat = product?.category || 'Uncategorized';
        if (!catStats[cat]) catStats[cat] = { scans: 0 };
        catStats[cat].scans++;
      }
    });

    const catList = Object.entries(catStats)
      .map(([name, { scans }]) => ({ name, scans, pct: ((scans / totalScans) * 100) || 0 }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 4);

    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];
    const catListWithColor = catList.map((c, i) => ({ ...c, color: colors[i % colors.length] }));

    const workerList = Object.entries(workerStats)
      .map(([name, stat]) => ({
        name,
        scans: stat.scans,
        accuracy: stat.scans > 0 ? Math.round((stat.matches / stat.scans) * 100) : 0,
        avatar: stat.avatar
      }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 3);

    const uniqueDays = new Set(recognitionLogs.map(l => new Date(l.timestamp).toDateString())).size;
    const avgScans = uniqueDays > 0 ? Math.round(totalScans / uniqueDays) : 0;

    return { totalScans, accuracy, uniqueProducts, avgScans, weekStats, hourStats, catListWithColor, workerList };
  }, [recognitionLogs, products]);

  const maxScans = Math.max(1, ...m.weekStats.map(d => d.scans));

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Analytics</h1>
        <p className="page-subtitle">Performance metrics and operational insights.</p>
      </div>

      {/* KPI Row */}
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="responsive-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Scans', value: m.totalScans.toString(), icon: Scan, color: '#6366f1', sub: `Avg ${m.avgScans}/day` },
          { label: 'Recognition Accuracy', value: `${m.accuracy}%`, icon: Target, color: '#22c55e', sub: 'Real-time accuracy' },
          { label: 'Avg. Response Time', value: '1.2s', icon: Zap, color: '#f59e0b', sub: 'AI Processing' },
          { label: 'Unique Products Scanned', value: m.uniqueProducts.toString(), icon: Package, color: '#3b82f6', sub: `of ${products.length} total` },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="responsive-grid-1-1" style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        {/* Weekly Scans */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Weekly Scan Performance</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Scans vs Successful Matches</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
            {m.weekStats.map((d, i) => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 180 }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.scans / maxScans) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                    style={{ flex: 1, background: 'rgba(99,102,241,0.25)', borderRadius: '3px 3px 0 0' }} />
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.matches / maxScans) * 100}%` }} transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                    style={{ flex: 1, background: 'var(--gradient-brand)', borderRadius: '3px 3px 0 0' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(99,102,241,0.25)' }} /> Total Scans
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }} /> Matched
            </div>
          </div>
        </motion.div>

        {/* Hourly Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Hourly Activity</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Scan distribution across 24 hours</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 180 }}>
            {m.hourStats.map((h, i) => {
              const maxH = Math.max(1, ...m.hourStats);
              return (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(h / maxH) * 100}%` }} transition={{ duration: 0.6, delay: 0.5 + i * 0.02 }}
                  style={{ flex: 1, background: h > 30 ? '#6366f1' : h > 15 ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)', borderRadius: '2px 2px 0 0', minHeight: h > 0 ? 2 : 0 }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>12 AM</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>6 AM</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>12 PM</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>6 PM</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>11 PM</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="responsive-grid-1-1" style={{ display: 'grid', gap: 16 }}>
        {/* Top Categories */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Product Category Performance</h3>
          {m.catListWithColor.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No scan data yet.</div>
          ) : (
            m.catListWithColor.map((c) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--surface-border)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{c.name}</div>
                  <div style={{ height: 4, borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 1, delay: 0.6 }}
                      style={{ height: '100%', borderRadius: 'var(--radius-full)', background: c.color }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{c.scans}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>scans</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Worker Performance */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Worker Performance</h3>
          {m.workerList.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No worker scan data yet.</div>
          ) : (
            m.workerList.map((w, i) => (
              <div key={w.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < m.workerList.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0 }}>{w.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.scans} total scans</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: w.accuracy >= 95 ? 'var(--success)' : w.accuracy >= 90 ? 'var(--warning)' : 'var(--danger)' }}>{w.accuracy}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>accuracy</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
