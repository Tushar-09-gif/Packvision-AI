'use client';
import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Upload, Package, Check, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Product } from '@/types';

export default function UploadPage() {
  const { addProduct, products, user } = useAppStore();
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', code: '', category: '', price: 0, stock: 0,
    tags: '', description: '', notes: '', instructions: '',
    isCocreate: false, status: 'active' as const
  });

  const [specs, setSpecs] = useState<{ key: string; val: string }[]>([
    { key: 'Bottle Type', val: '' },
    { key: 'Size', val: '' }
  ]);

  // Extract dynamic categories for datalist auto-complete
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [products]);

  const update = (key: string, value: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    setSaving(true);
    
    const specRecord: Record<string, string> = {};
    specs.forEach(s => {
      if (s.key.trim() && s.val.trim()) specRecord[s.key.trim()] = s.val.trim();
    });

    const newProduct: Product = {
      id: `PRD-${Date.now()}`,
      name: form.name,
      code: form.code,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: [imagePreview].filter(Boolean),
      image: imagePreview, // legacy
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      specifications: specRecord,
      description: form.description,
      notes: form.notes,
      instructions: form.instructions,
      isCocreate: form.isCocreate,
      status: form.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.name || 'Admin',
    };

    await addProduct(newProduct);
    
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
    
    setForm({ name: '', code: '', category: '', price: 0, stock: 0, tags: '', description: '', notes: '', instructions: '', isCocreate: false, status: 'active' });
    setSpecs([{ key: 'Bottle Type', val: '' }, { key: 'Size', val: '' }]);
    setImagePreview('');
  };



  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Add Product</h1>
        <p className="page-subtitle">Add a new product to the central database.</p>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '14px 20px', background: 'var(--success-subtle)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
          <Check size={18} /> Product added and synced successfully!
        </motion.div>
      )}

      <datalist id="categoriesList">
        {existingCategories.map(c => <option key={c} value={c} />)}
      </datalist>

      <form onSubmit={handleSubmit}>
        <div className="responsive-form-layout" style={{ gap: 20 }}>
          {/* Left — Form */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Product Details</h3>

            <div className="responsive-form-grid" style={{ marginBottom: 14 }}>
              <div className="float-label"><label>Product Name *</label><input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. AquaPure Crystal 500ml" /></div>
              <div className="float-label"><label>Product Code *</label><input className="input-field" value={form.code} onChange={e => update('code', e.target.value)} placeholder="e.g. APC-500" /></div>
              <div className="float-label"><label>Category</label><input className="input-field" list="categoriesList" value={form.category} onChange={e => update('category', e.target.value)} placeholder="Type new or select existing" /></div>
              <div className="float-label"><label>Price ($)</label><input className="input-field" type="number" value={form.price} onChange={e => update('price', parseFloat(e.target.value) || 0)} /></div>
              <div className="float-label"><label>Stock Quantity</label><input className="input-field" type="number" value={form.stock} onChange={e => update('stock', parseFloat(e.target.value) || 0)} /></div>
              <div className="float-label"><label>Tags</label><input className="input-field" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="e.g. new, bestseller, liquid (comma separated)" /></div>
            </div>

            {/* Dynamic Specifications */}
            <div style={{ marginBottom: 20, padding: 14, background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Specifications</h4>
                <button type="button" onClick={() => setSpecs([...specs, { key: '', val: '' }])} style={{ background: 'none', border: 'none', color: 'var(--accent-hover)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                  <Plus size={14} /> Add Spec
                </button>
              </div>
              {specs.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <input className="input-field" placeholder="Name (e.g. Size)" value={s.key} onChange={e => { const n = [...specs]; n[i].key = e.target.value; setSpecs(n); }} style={{ flex: 1 }} />
                  <input className="input-field" placeholder="Value (e.g. 500ml)" value={s.val} onChange={e => { const n = [...specs]; n[i].val = e.target.value; setSpecs(n); }} style={{ flex: 2 }} />
                  <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} style={{ background: 'var(--danger-subtle)', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', color: 'var(--danger)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="float-label" style={{ marginBottom: 12 }}>
              <label>Description</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} placeholder="Product description..." />
            </div>
            <div className="float-label" style={{ marginBottom: 12 }}>
              <label>Admin Notes</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Internal notes (only visible to admin)..." style={{ resize: 'vertical' }} />
            </div>
            <div className="float-label" style={{ marginBottom: 16 }}>
              <label>Worker Instructions</label>
              <textarea className="input-field" rows={2} value={form.instructions} onChange={e => update('instructions', e.target.value)} placeholder="Instructions workers will see when they scan this product..." style={{ resize: 'vertical' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: 20 }}>
              <input type="checkbox" checked={form.isCocreate} onChange={e => update('isCocreate', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              Cocreate Product
            </label>

            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '14px 32px', fontSize: 15, opacity: saving ? 0.7 : 1 }}>
              <Package size={16} /> {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>

          {/* Right — Image Upload */}
          <div>
            <div className="glass-card" style={{ padding: 20, marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Product Image</h3>

              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />

              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="preview" style={{ width: '100%', borderRadius: 'var(--radius-lg)', objectFit: 'cover', maxHeight: 220, border: '1px solid var(--surface-border)' }} />
                  <button type="button" onClick={() => setImagePreview('')}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                    <X size={14} />
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ width: '100%', marginTop: 8, fontSize: 13 }}>
                    <ImageIcon size={14} /> Change Image
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--surface-border)'}`, borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-subtle)' : 'transparent', transition: 'all 0.2s' }}>
                  <Upload size={30} color={dragOver ? 'var(--accent-hover)' : 'var(--text-muted)'} style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: dragOver ? 'var(--accent-hover)' : 'var(--text-primary)' }}>Tap to upload or drag & drop</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>PNG, JPG, WEBP · max 5MB</p>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photo Tips</h3>
              {['Clear, well-lit photos work best', 'Show bottle shape & label clearly', 'White or neutral background preferred', 'Front-facing orientation ideal'].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-hover)', fontWeight: 700, flexShrink: 0 }}>→</span> {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
