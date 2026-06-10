'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit2, Trash2, Eye, Package, X, Upload,
  Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download,
  CheckSquare, Square, Tag, Layers
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Product } from '@/types';

type EditableProduct = Omit<Product, 'price' | 'stock'> & { price: string | number; stock: string | number };
type SortKey = 'name' | 'code' | 'category' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const PAGE_SIZES = [25, 50, 100];

// ─── Helpers defined OUTSIDE component so they never get recreated ───────────

const emptyProduct = (): EditableProduct => ({
  id: '', name: '', code: '', category: '', tags: [], images: [], image: '',
  price: '', stock: '', specifications: {}, description: '', notes: '', instructions: '',
  isCocreate: false, status: 'active', createdBy: '',
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

function exportToCSV(products: Product[]) {
  const headers = ['SKU', 'Name', 'Short Name', 'Brand', 'Size', 'Unit', 'Category', 'Description', 'Price', 'Stock', 'Status', 'Cocreate'];
  const rows = products.map(p => [
    p.code, p.name, p.shortName || '', p.brand || '',
    p.size || p.specifications?.Size || '', p.unit || '',
    p.category, p.description || '', p.price, p.stock,
    p.status, p.isCocreate ? 'Yes' : 'No',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `packvisionai-products-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// SortIcon is a pure component defined outside – never recreated on re-render
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3 }}>
      {active && dir === 'desc' ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
    </span>
  );
}

function statusColor(s: string) {
  return s === 'active' ? 'badge-success' : s === 'draft' ? 'badge-warning' : 'badge-danger';
}

function InlineCategoryEdit({ product, onSave }: { product: Product, onSave: (id: string, cat: string) => void }) {
  const [val, setVal] = useState(product.category || '');
  const [editing, setEditing] = useState(false);
  
  const handleBlur = () => {
    setEditing(false);
    if (val.trim() !== product.category) onSave(product.id, val.trim());
  };

  if (editing) {
    return (
      <input 
        autoFocus 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        onBlur={handleBlur} 
        onKeyDown={e => e.key === 'Enter' && handleBlur()} 
        style={{ height: 26, padding: '0 6px', fontSize: 12, width: 120, border: '1px solid var(--accent)', borderRadius: 4, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
      />
    );
  }

  return (
    <span 
      onClick={() => setEditing(true)} 
      title="Click to edit"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 6px', borderRadius: 4, background: 'var(--bg-glass)' }}
    >
      <Layers size={12} color="var(--text-muted)" />
      {product.category || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Uncategorized</span>}
      <Edit2 size={10} style={{ opacity: 0.3, marginLeft: 4 }} />
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { products, deleteProduct, updateProduct, addProduct, fetchData, user } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter/sort/page state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCocreate, setFilterCocreate] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState<EditableProduct>(emptyProduct());
  const [specs, setSpecs] = useState<{ key: string; val: string }[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (products.length > 0) {
      const viewId = searchParams.get('view');
      const editId = searchParams.get('edit');
      if (viewId) {
        const p = products.find(p => p.id === viewId);
        if (p) {
          setViewProduct(p);
          router.replace('/admin/products');
        }
      } else if (editId) {
        const p = products.find(p => p.id === editId);
        if (p) {
          openEdit(p);
          router.replace('/admin/products');
        }
      }
    }
  }, [searchParams, products, router]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !search || (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.shortName?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      const matchCocreate = filterCocreate === 'All' || (filterCocreate === 'yes' ? p.isCocreate : !p.isCocreate);
      return matchSearch && matchCat && matchStatus && matchCocreate;
    });
    list = [...list].sort((a, b) => {
      const aVal = String((a as any)[sortKey] ?? '').toLowerCase();
      const bVal = String((b as any)[sortKey] ?? '').toLowerCase();
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return list;
  }, [products, search, filterCategory, filterStatus, filterCocreate, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
    });
  };
  const toggleAll = () => {
    setSelected(selected.size === paginated.length ? new Set() : new Set(paginated.map(p => p.id)));
  };
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected products?`)) return;
    for (const id of selected) await deleteProduct(id);
    setSelected(new Set());
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product permanently?')) deleteProduct(id);
  };

  const openEdit = (product: Product) => {
    const specArr = Object.entries(product.specifications || {}).map(([k, v]) => ({ key: k, val: String(v) }));
    setEditProduct({ ...product });
    setTagsInput(product.tags?.join(', ') || '');
    setSpecs(specArr.length > 0 ? specArr : [{ key: 'Size', val: '' }]);
    setImagePreview(product.image || '');
    setIsEditing(true);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditProduct({ ...emptyProduct(), id: `PRD-${Date.now()}`, createdBy: user?.name || 'Admin' });
    setTagsInput('');
    setSpecs([{ key: 'Bottle Type', val: '' }, { key: 'Size', val: '' }]);
    setImagePreview('');
    setIsEditing(false);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setImagePreview(''); };

  const handleSave = async () => {
    if (!editProduct.name || !editProduct.code) { alert('Name and Code are required.'); return; }
    const specRecord: Record<string, string> = {};
    specs.forEach(s => { if (s.key.trim() && s.val.trim()) specRecord[s.key.trim()] = s.val.trim(); });
    const final: Product = {
      ...editProduct as Product,
      price: Number(editProduct.price) || 0,
      stock: Number(editProduct.stock) || 0,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      specifications: specRecord,
      image: imagePreview || editProduct.image || '',
      images: [imagePreview || editProduct.image || ''].filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    if (isEditing) await updateProduct(final.id, final);
    else await addProduct(final);
    closeModal();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Products</h1>
          <p className="page-subtitle">{filtered.length} of {products.length} products</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => exportToCSV(filtered)} style={{ fontSize: 13, padding: '9px 16px' }}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn-primary" onClick={openAdd} style={{ fontSize: 13, padding: '9px 16px' }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="search-wrapper" style={{ flex: '1 1 240px' }}>
          <Search size={15} />
          <input className="input-field" placeholder="Search name, SKU, category, brand..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 42, height: 38 }} />
        </div>
        {[
          { label: 'Category', value: filterCategory, setter: setFilterCategory, options: categories },
          { label: 'Status', value: filterStatus, setter: setFilterStatus, options: ['All', 'active', 'discontinued', 'draft'] },
          { label: 'Type', value: filterCocreate, setter: setFilterCocreate, options: [['All', 'All'], ['yes', 'Cocreate'], ['no', 'Standard']] as [string, string][] },
        ].map(({ label, value, setter, options }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', padding: '0 12px', borderRadius: 'var(--radius-md)', height: 38 }}>
            <Filter size={13} color="var(--text-muted)" />
            <select value={value} onChange={e => { setter(e.target.value); setPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: 13, cursor: 'pointer' }}>
              {options.map(o => Array.isArray(o)
                ? <option key={o[0]} value={o[0]}>{o[1]}</option>
                : <option key={o} value={o}>{o === 'All' ? `All ${label}` : o}</option>
              )}
            </select>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', padding: '0 12px', borderRadius: 'var(--radius-md)', height: 38, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Show</span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: 13 }}>
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span>/ page</span>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--accent-subtle)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-md)', marginBottom: 12, fontSize: 13 }}>
            <span style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>{selected.size} selected</span>
            <button className="btn-danger" style={{ padding: '6px 14px', fontSize: 12 }} onClick={bulkDelete}>
              <Trash2 size={13} /> Delete Selected
            </button>
            <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => exportToCSV(products.filter(p => selected.has(p.id)))}>
              <Download size={13} /> Export Selected
            </button>
            <button onClick={() => setSelected(new Set())} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {selected.size > 0 && selected.size === paginated.length ? <CheckSquare size={16} color="var(--accent-hover)" /> : <Square size={16} />}
                  </button>
                </th>
                {[['name', 'Product'], ['code', 'SKU'], ['category', 'Category'], ['status', 'Status']] .map(([key, label]) => (
                  <th key={key} onClick={() => handleSort(key as SortKey)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {label}<SortIcon active={sortKey === key} dir={sortDir} />
                    </span>
                  </th>
                ))}
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} style={{ background: selected.has(p.id) ? 'var(--accent-subtle)' : undefined }}>
                  <td>
                    <button onClick={() => toggleSelect(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      {selected.has(p.id) ? <CheckSquare size={15} color="var(--accent-hover)" /> : <Square size={15} />}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border)' }}>
                        {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={14} color="var(--accent-hover)" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.shortName || p.brand || (p.tags?.[0] ?? '')}</div>
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-hover)', background: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: 4 }}>{p.code}</code></td>
                  <td style={{ fontSize: 13 }}>
                    <InlineCategoryEdit product={p} onSave={(id, cat) => updateProduct(id, { category: cat })} />
                  </td>
                  <td><span className={`badge ${statusColor(p.status)}`}>{p.status}</span></td>
                  <td>
                    {p.isCocreate
                      ? <span className="badge badge-accent" style={{ fontSize: 10 }}><Tag size={9} style={{ marginRight: 3 }} />Cocreate</span>
                      : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Standard</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                      <button onClick={() => setViewProduct(p)} title="View"
                        style={{ padding: '6px 8px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        <Eye size={13} />
                      </button>
                      <button onClick={() => openEdit(p)} title="Edit"
                        style={{ padding: '6px 10px', background: 'var(--accent-subtle)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, cursor: 'pointer', color: 'var(--accent-hover)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Delete"
                        style={{ padding: '6px 8px', background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Package size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No products found</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{products.length === 0 ? 'Import a CSV or add products manually.' : 'Try adjusting your search or filters.'}</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button onClick={() => setPage(1)} disabled={page === 1}
                style={{ padding: '6px 10px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 6, cursor: page === 1 ? 'default' : 'pointer', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 13 }}>«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '6px 10px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 6, cursor: page === 1 ? 'default' : 'pointer', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pg = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) pg = i + 1;
                  else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                  else pg = page - 2 + i;
                }
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    style={{ padding: '6px 11px', background: pg === page ? 'var(--accent)' : 'var(--bg-glass)', border: `1px solid ${pg === page ? 'var(--accent)' : 'var(--surface-border)'}`, borderRadius: 6, cursor: 'pointer', color: pg === page ? 'white' : 'var(--text-primary)', fontSize: 13, fontWeight: pg === page ? 700 : 400 }}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '6px 10px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 6, cursor: page === totalPages ? 'default' : 'pointer', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={15} />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                style={{ padding: '6px 10px', background: 'var(--bg-glass)', border: '1px solid var(--surface-border)', borderRadius: 6, cursor: page === totalPages ? 'default' : 'pointer', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 13 }}>»</button>
            </div>
          </div>
        )}
      </div>

      <datalist id="dynamicCategories">
        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
      </datalist>

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay"
          style={{ zIndex: 1000, overflowY: 'auto', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-content" style={{ padding: '24px 22px', maxWidth: 820, width: '100%', borderRadius: 'var(--radius-xl)', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />

            <div className="responsive-form-grid" style={{ marginBottom: 14 }}>
              <div className="float-label"><label>Product Name *</label><input className="input-field" value={editProduct.name} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} placeholder="e.g. COSTA 1 LTR" /></div>
              <div className="float-label"><label>SKU / Code *</label><input className="input-field" value={editProduct.code} onChange={e => setEditProduct(p => ({ ...p, code: e.target.value }))} placeholder="e.g. 300003" /></div>
              <div className="float-label"><label>Category</label><input className="input-field" list="dynamicCategories" value={editProduct.category} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))} /></div>
              <div className="float-label"><label>Short Name / Brand</label><input className="input-field" value={editProduct.shortName || ''} onChange={e => setEditProduct(p => ({ ...p, shortName: e.target.value }))} placeholder="e.g. COSTA" /></div>
              <div className="float-label"><label>Size</label><input className="input-field" value={editProduct.size || ''} onChange={e => setEditProduct(p => ({ ...p, size: e.target.value }))} placeholder="e.g. 500" /></div>
              <div className="float-label"><label>Unit</label><input className="input-field" value={editProduct.unit || ''} onChange={e => setEditProduct(p => ({ ...p, unit: e.target.value }))} placeholder="ML / LTR / KG / GM" /></div>
              <div className="float-label"><label>Price (₹)</label><input className="input-field" type="number" value={editProduct.price} onChange={e => setEditProduct(p => ({ ...p, price: e.target.value }))} /></div>
              <div className="float-label"><label>Stock</label><input className="input-field" type="number" value={editProduct.stock} onChange={e => setEditProduct(p => ({ ...p, stock: e.target.value }))} /></div>
            </div>

            {/* Specs */}
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Specifications</h4>
                <button type="button" onClick={() => setSpecs(s => [...s, { key: '', val: '' }])} style={{ background: 'none', border: 'none', color: 'var(--accent-hover)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={13} /> Add
                </button>
              </div>
              {specs.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="input-field" placeholder="Key (e.g. Bottle Type)" value={s.key} onChange={e => { const n = [...specs]; n[i].key = e.target.value; setSpecs(n); }} style={{ flex: 1 }} />
                  <input className="input-field" placeholder="Value" value={s.val} onChange={e => { const n = [...specs]; n[i].val = e.target.value; setSpecs(n); }} style={{ flex: 2 }} />
                  <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} style={{ background: 'var(--danger-subtle)', border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="float-label" style={{ marginBottom: 12 }}><label>Tags</label><input className="input-field" placeholder="comma separated" value={tagsInput} onChange={e => setTagsInput(e.target.value)} /></div>
            <div className="float-label" style={{ marginBottom: 12 }}><label>Description</label><textarea className="input-field" rows={2} value={editProduct.description} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
            <div className="float-label" style={{ marginBottom: 12 }}><label>Admin Notes</label><textarea className="input-field" rows={2} value={editProduct.notes} onChange={e => setEditProduct(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>

            {/* Image */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Product Image</div>
              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="preview" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--surface-border)' }} />
                  <button type="button" onClick={() => setImagePreview('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={12} /></button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--surface-border)', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-glass)' }}>
                  <Upload size={18} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click to upload image</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="cocreate-cb" checked={editProduct.isCocreate} onChange={e => setEditProduct(p => ({ ...p, isCocreate: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              <label htmlFor="cocreate-cb" style={{ fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>Cocreate Product</label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>{isEditing ? 'Update Product' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ────────────────────────────────────────────────────────── */}
      {viewProduct && (
        <div className="modal-overlay"
          style={{ zIndex: 1000, overflowY: 'auto', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setViewProduct(null); }}>
          <div className="modal-content" style={{ padding: '24px 22px', maxWidth: 600, width: '100%', borderRadius: 'var(--radius-xl)', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{viewProduct.name}</h2>
                <code style={{ fontSize: 12, color: 'var(--accent-hover)', background: 'var(--accent-subtle)', padding: '1px 8px', borderRadius: 4 }}>{viewProduct.code}</code>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setViewProduct(null); openEdit(viewProduct); }} className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}><Edit2 size={13} /> Edit</button>
                <button onClick={() => setViewProduct(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
            </div>

            {viewProduct.image && <img src={viewProduct.image} alt={viewProduct.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 16, border: '1px solid var(--surface-border)' }} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
              {[
                ['Category', viewProduct.category], ['Short Name', viewProduct.shortName || '—'],
                ['Brand', viewProduct.brand || '—'], ['Size', viewProduct.size ? `${viewProduct.size} ${viewProduct.unit || ''}` : (viewProduct.specifications?.Size || '—')],
                ['Status', viewProduct.status], ['Type', viewProduct.isCocreate ? 'Cocreate' : 'Standard'],
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{val || '—'}</div>
                </div>
              ))}
            </div>

            {viewProduct.specifications && Object.keys(viewProduct.specifications).length > 0 && (
              <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--surface-border)', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Specifications</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                  {Object.entries(viewProduct.specifications).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 13 }}><span style={{ color: 'var(--text-secondary)' }}>{k}:</span> <strong>{v}</strong></div>
                  ))}
                </div>
              </div>
            )}
            {viewProduct.description && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Description</div><div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{viewProduct.description}</div></div>}
            {viewProduct.notes && <div style={{ padding: 12, background: 'var(--warning-subtle)', borderRadius: 8, marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', marginBottom: 3 }}>Admin Notes</div><div style={{ fontSize: 13 }}>{viewProduct.notes}</div></div>}
          </div>
        </div>
      )}
    </div>
  );
}
