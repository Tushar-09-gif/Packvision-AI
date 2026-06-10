'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, X, Filter, Layers, Tag, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Product } from '@/types';

const PAGE_SIZE = 24;

export default function WorkerCatalogPage() {
  const { products, fetchData } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchData(); }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !search || (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.shortName?.toLowerCase().includes(q)
      );
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      const matchType = filterType === 'All' || (filterType === 'cocreate' ? p.isCocreate : !p.isCocreate);
      return matchSearch && matchCat && matchType;
    });
  }, [products, search, filterCategory, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Cleaning': '#6366f1',
      'Powder': '#f59e0b',
      'Agricultural': '#22c55e',
    };
    return colors[cat] || '#8b5cf6';
  };

  const statusColor = (s: string) => s === 'active' ? 'badge-success' : s === 'draft' ? 'badge-warning' : 'badge-danger';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Product Catalog</h1>
        <p className="page-subtitle">{filtered.length} products available · View only</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="search-wrapper" style={{ flex: '1 1 220px' }}>
          <Search size={15} />
          <input className="input-field" placeholder="Search by name, code, category..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 42, height: 38 }} />
        </div>
        {[
          { value: filterCategory, setter: setFilterCategory, options: categories, prefix: 'Cat' },
          { value: filterType, setter: setFilterType, options: [['All', 'All Types'], ['cocreate', 'Cocreate'], ['standard', 'Standard']] as [string, string][], prefix: 'Type' },
        ].map(({ value, setter, options, prefix }) => (
          <div key={prefix} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', padding: '0 12px', borderRadius: 'var(--radius-md)', height: 38 }}>
            <Filter size={13} color="var(--text-muted)" />
            <select value={value} onChange={e => { setter(e.target.value); setPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: 13, cursor: 'pointer' }}>
              {options.map(o => Array.isArray(o)
                ? <option key={o[0]} value={o[0]}>{o[1]}</option>
                : <option key={o} value={o}>{o}</option>
              )}
            </select>
          </div>
        ))}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(cat => {
          const color = cat === 'All' ? 'var(--accent)' : getCategoryColor(cat);
          const isActive = filterCategory === cat;
          return (
            <button key={cat} onClick={() => { setFilterCategory(cat); setPage(1); }}
              style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${isActive ? color : 'var(--surface-border)'}`, background: isActive ? `${color}18` : 'var(--bg-glass)', color: isActive ? color : 'var(--text-secondary)', transition: 'all 0.15s' }}>
              {cat === 'All' ? 'All Categories' : cat}
              {cat !== 'All' && <span style={{ marginLeft: 5, opacity: 0.7, fontSize: 10 }}>({products.filter(p => p.category === cat).length})</span>}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {paginated.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Package size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No products found</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          <AnimatePresence>
            {paginated.map((p, i) => {
              const catColor = getCategoryColor(p.category);
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setViewProduct(p)}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}>
                  {/* Color bar by category */}
                  <div style={{ height: 3, background: catColor }} />

                  {/* Product Image / Placeholder */}
                  <div style={{ height: 110, background: `${catColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Package size={28} color={catColor} style={{ opacity: 0.5, marginBottom: 4 }} />
                        <div style={{ fontSize: 9, color: catColor, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.category}</div>
                      </div>
                    )}
                    {p.isCocreate && (
                      <div style={{ position: 'absolute', top: 6, right: 6, padding: '2px 6px', background: 'rgba(139,92,246,0.9)', borderRadius: 4, fontSize: 9, color: 'white', fontWeight: 700 }}>CO</div>
                    )}
                  </div>

                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.3, minHeight: 30 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <code style={{ fontSize: 10, color: catColor, background: `${catColor}15`, padding: '1px 6px', borderRadius: 3, fontWeight: 700 }}>{p.code}</code>
                      <span className={`badge ${statusColor(p.status)}`} style={{ fontSize: 9, padding: '1px 6px' }}>{p.status}</span>
                    </div>
                    {p.size && <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Layers size={9} /> {p.size} {p.unit}
                    </div>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 12px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 8, cursor: page === 1 ? 'default' : 'pointer', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 12px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 8, cursor: page === totalPages ? 'default' : 'pointer', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {viewProduct && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewProduct(null)} style={{ zIndex: 1000 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '100%' }}>
              {/* Color header */}
              <div style={{ height: 4, background: getCategoryColor(viewProduct.category), borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3, marginBottom: 5 }}>{viewProduct.name}</h2>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <code style={{ fontSize: 11, color: getCategoryColor(viewProduct.category), background: `${getCategoryColor(viewProduct.category)}18`, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{viewProduct.code}</code>
                      <span className={`badge ${statusColor(viewProduct.status)}`} style={{ fontSize: 10 }}>{viewProduct.status}</span>
                      {viewProduct.isCocreate && <span className="badge badge-accent" style={{ fontSize: 10 }}><Tag size={9} style={{ marginRight: 2 }} />Cocreate</span>}
                    </div>
                  </div>
                  <button onClick={() => setViewProduct(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}><X size={20} /></button>
                </div>

                {/* Image */}
                {viewProduct.image ? (
                  <img src={viewProduct.image} alt={viewProduct.name} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: 16, border: '1px solid var(--surface-border)' }} />
                ) : (
                  <div style={{ height: 120, background: `${getCategoryColor(viewProduct.category)}10`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `1px dashed ${getCategoryColor(viewProduct.category)}40` }}>
                    <Package size={32} color={getCategoryColor(viewProduct.category)} style={{ opacity: 0.4 }} />
                  </div>
                )}

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    ['Category', viewProduct.category],
                    ['Short Name', viewProduct.shortName || '—'],
                    ['Size', viewProduct.size ? `${viewProduct.size} ${viewProduct.unit || ''}` : (viewProduct.specifications?.Size || '—')],
                    ['Type', viewProduct.isCocreate ? 'Cocreate' : 'Standard'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>

                {/* Specs */}
                {viewProduct.specifications && Object.keys(viewProduct.specifications).length > 0 && (
                  <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--surface-border)', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Specifications</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6 }}>
                      {Object.entries(viewProduct.specifications).map(([k, v]) => (
                        <div key={k} style={{ fontSize: 12 }}><span style={{ color: 'var(--text-secondary)' }}>{k}:</span> <strong>{v}</strong></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {viewProduct.description && (
                  <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--surface-border)', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{viewProduct.description}</div>
                  </div>
                )}

                {/* Worker Instructions */}
                {viewProduct.instructions && (
                  <div style={{ padding: '12px 14px', background: 'var(--info-subtle)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--info)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Info size={11} /> Instructions
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{viewProduct.instructions}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
