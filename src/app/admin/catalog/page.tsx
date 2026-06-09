'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List, Package, Tag, Box, Droplets, Pill, Eye, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

const catIcons: Record<string, React.ElementType> = { 'Beverages': Droplets, 'Home Care': Box, 'Personal Care': Pill, 'Food & Pantry': Tag };
const catColors: Record<string, string> = { 'Beverages': '#6366f1', 'Home Care': '#22c55e', 'Personal Care': '#f59e0b', 'Food & Pantry': '#ef4444' };

export default function CatalogPage() {
  const { products } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
      const matchCat = !activeCat || p.category === activeCat;
      return matchSearch && matchCat;
    });
  }, [products, search, activeCat]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Product Catalog</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Visual overview of all products across categories.</p>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCat('')}
          className={activeCat === '' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 18px', fontSize: 13 }}>
          All ({products.length})
        </button>
        {categories.map(c => {
          const count = products.filter(p => p.category === c).length;
          const Icon = catIcons[c] || Package;
          return (
            <button key={c} onClick={() => setActiveCat(c)}
              className={activeCat === c ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 18px', fontSize: 13 }}>
              <Icon size={14} /> {c} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & View Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <div className="search-wrapper" style={{ flex: 1 }}>
          <Search size={16} />
          <input className="input-field" placeholder="Search catalog..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button onClick={() => setView('grid')} style={{ padding: '8px 12px', background: view === 'grid' ? 'var(--accent-subtle)' : 'transparent', border: 'none', color: view === 'grid' ? 'var(--accent-hover)' : 'var(--text-muted)', cursor: 'pointer' }}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView('list')} style={{ padding: '8px 12px', background: view === 'list' ? 'var(--accent-subtle)' : 'transparent', border: 'none', color: view === 'list' ? 'var(--accent-hover)' : 'var(--text-muted)', cursor: 'pointer' }}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <motion.div layout style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 16 }}>
        {filtered.map((p, i) => {
          const color = catColors[p.category] || '#6366f1';
          return (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
              className="glass-card" style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}>
              {/* Color Bar */}
              <div style={{ height: 3, background: color }} />

              {view === 'grid' ? (
                <div style={{ padding: 20 }}>
                  {/* Product Image */}
                  <div style={{ height: 120, marginBottom: 16, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--surface-border)', background: 'var(--bg-glass)' }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Package size={28} style={{ marginBottom: 4, opacity: 0.4 }} />
                        <div style={{ fontSize: 10, opacity: 0.6 }}>{p.bottleType}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>{p.name}</h3>
                    <span className={`badge ${p.isCocreate ? 'badge-accent' : 'badge-info'}`} style={{ marginLeft: 8, fontSize: 10, flexShrink: 0 }}>
                      {p.isCocreate ? 'Co-Create' : 'Standard'}
                    </span>
                  </div>

                  <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>{p.code}</code>

                    <div><span style={{ color: 'var(--text-muted)' }}>Price:</span> <span style={{ fontWeight: 600 }}>₹{p.price?.toFixed(2)}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Stock:</span> <span style={{ fontWeight: 700, color }}>{p.stock}</span></div>

                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)' }}>
                    📦 {p.packagingType || 'N/A'}
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 8, borderTop: '1px solid var(--surface-border)', paddingTop: 12 }}>
                    <Link href={`/admin/products?view=${p.id}`} className="btn-secondary" style={{ flex: 1, padding: '6px', fontSize: 12, justifyContent: 'center' }}><Eye size={14}/> View</Link>
                    <Link href={`/admin/products?edit=${p.id}`} className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: 12, justifyContent: 'center' }}><Edit2 size={14}/> Edit</Link>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={20} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.code} · {p.category} · {p.bottleType} · {p.size}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color }}>{p.stock}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>in stock</div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 11 }}>{p.status}</span>
                  <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
                    <Link href={`/admin/products?view=${p.id}`} className="btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}><Eye size={14}/></Link>
                    <Link href={`/admin/products?edit=${p.id}`} className="btn-primary" style={{ padding: '6px 10px', fontSize: 12 }}><Edit2 size={14}/></Link>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <Package size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 500 }}>No products match your filters.</p>
        </div>
      )}
    </div>
  );
}
