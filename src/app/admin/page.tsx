'use client';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Activity, Plus, FileSpreadsheet, Layers, Tag, CheckCircle, Clock, BarChart3, Edit2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function InlineCategoryRename({ oldName, onRename }: { oldName: string, onRename: (o: string, n: string) => void }) {
  const [val, setVal] = useState(oldName);
  const [editing, setEditing] = useState(false);
  
  const handleBlur = () => {
    setEditing(false);
    if (val.trim() && val.trim() !== oldName) onRename(oldName, val.trim());
  };

  if (editing) {
    return <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={e => e.key === 'Enter' && handleBlur()} style={{ height: 20, padding: '0 4px', fontSize: 12, width: 100, border: '1px solid var(--accent)', borderRadius: 4, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />;
  }

  return (
    <span onClick={() => setEditing(true)} title="Click to rename everywhere" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {oldName || <i style={{color: 'var(--text-muted)'}}>Uncategorized</i>}
      <Edit2 size={10} style={{ opacity: 0.3 }} />
    </span>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function AdminDashboard() {
  const { products, activityLogs, user, fetchData, updateProduct } = useAppStore();
  const [renaming, setRenaming] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const handleRenameCategory = async (oldName: string, newName: string) => {
    setRenaming(true);
    const targets = products.filter(p => p.category === oldName);
    for (const p of targets) {
      await updateProduct(p.id, { category: newName });
    }
    await fetchData();
    setRenaming(false);
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const cocreateProducts = products.filter(p => p.isCocreate).length;
  const standardProducts = products.filter(p => !p.isCocreate).length;

  const catCounts: Record<string, number> = {};
  products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const catList = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const catColorPalette = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  // Brand breakdown
  const brandCounts: Record<string, number> = {};
  products.forEach(p => { const brand = p.shortName || p.brand || p.name.split(' ')[0]; brandCounts[brand] = (brandCounts[brand] || 0) + 1; });
  const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', href: '/admin/products' },
    { label: 'Active Products', value: activeProducts, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', href: '/admin/products' },
    { label: 'Categories', value: catList.length, icon: Layers, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', href: '/admin/catalog' },
    { label: 'Co-Create', value: cocreateProducts, icon: Tag, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', href: '/admin/products' },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/upload', icon: Plus, color: 'var(--accent)', desc: 'Add a single product manually' },
    { label: 'Import CSV', href: '/admin/import', icon: FileSpreadsheet, color: '#22c55e', desc: 'Bulk import from CSV file' },
    { label: 'View Catalog', href: '/admin/catalog', icon: Layers, color: '#f59e0b', desc: 'Browse product catalog' },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: '#3b82f6', desc: 'View performance metrics' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <h1 className="page-title">Dashboard</h1>
          <span className="badge badge-success" style={{ fontSize: 11 }}>Live</span>
        </div>
        <p className="page-subtitle">Welcome back, {user?.name || 'Tushar Makwana'}. Here&apos;s your system overview.</p>
      </div>

      {/* Stats Grid */}
      <motion.div initial="hidden" animate="visible" variants={stagger}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="stat-card" style={{ cursor: 'pointer' }}
            onClick={() => window.location.href = s.href}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
              <TrendingUp size={14} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 24 }}>
        {quickActions.map(({ label, href, icon: Icon, color, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = color; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--surface-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }} className="responsive-grid-2-1">
        {/* Recent Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Recent Products</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Latest added to system</p>
            </div>
            <Link href="/admin/products" className="badge badge-accent" style={{ textDecoration: 'none', cursor: 'pointer', fontSize: 11 }}>View All →</Link>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No products yet. <Link href="/admin/import" style={{ color: 'var(--accent-hover)' }}>Import CSV →</Link>
            </div>
          ) : (
            <div>
              {products.slice(0, 7).map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 6 && i < products.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', background: 'var(--accent-subtle)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border)' }}>
                    {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={13} color="var(--accent-hover)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.code} · {p.category}</div>
                  </div>
                  <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Category Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>By Category</h3>
          {catList.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No data yet.</div>
          ) : (
            catList.map(([name, count], idx) => {
              const pct = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
              const color = catColorPalette[idx % catColorPalette.length];
              return (
                <div key={name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
                      <InlineCategoryRename oldName={name} onRename={handleRenameCategory} />
                      {renaming && <span style={{fontSize:10, color:'var(--text-muted)'}}>(saving...)</span>}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      style={{ height: '100%', borderRadius: 'var(--radius-full)', background: color }} />
                  </div>
                </div>
              );
            })
          )}

          {totalProducts > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--surface-border)', display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-hover)' }}>{standardProducts}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Standard</div>
              </div>
              <div style={{ width: 1, background: 'var(--surface-border)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#8b5cf6' }}>{cocreateProducts}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Co-Create</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Brands */}
      {topBrands.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top Product Brands</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topBrands.map(([brand, count], idx) => (
              <div key={brand} style={{ padding: '8px 14px', background: 'var(--bg-primary)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: catColorPalette[idx % catColorPalette.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0 }}>{brand[0]}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{brand}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Activity</h3>
          <Activity size={15} color="var(--text-muted)" />
        </div>
        {activityLogs.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No activity yet. Actions will appear here.</div>
        ) : (
          activityLogs.slice(0, 6).map((log, i) => {
            const typeColors: Record<string, string> = { scan: '#6366f1', view: '#3b82f6', edit: '#f59e0b', create: '#22c55e', delete: '#ef4444', login: '#a78bfa', import: '#22c55e' };
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 0', borderBottom: i < Math.min(activityLogs.length, 6) - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[log.type] || '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{log.userName}</span>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>{' '}
                    <span style={{ fontWeight: 500, color: 'var(--accent-hover)' }}>{log.target}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {new Date(log.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
