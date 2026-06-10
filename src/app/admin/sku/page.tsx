'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FileSpreadsheet, Search, Upload, AlertCircle, CheckCircle, Package } from 'lucide-react';

export default function SKUManagementPage() {
  const { products, fetchData } = useAppStore();
  const [search, setSearch] = useState('');
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/csv', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }
      
      setResult(data);
      fetchData(); // Refresh products in global store
    } catch (err: any) {
      setError(err.message || 'Network error during upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Edit State
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const startEdit = (p: typeof products[0]) => {
    setEditingProduct(p);
    setEditForm({
      code: p.code,
      name: p.name,
      packagingType: p.packagingType || p.size || p.specifications?.Size || '',
      bottleType: p.bottleType || p.specifications?.['Bottle Type'] || '',
      color: p.color || p.specifications?.Color || '',
      subcategory: p.subcategory || p.category || '',
      cfbSize: p.cfbSize || p.specifications?.['CFB Size'] || '',
      quantity: (p.quantity || p.stock || 0).toString(),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editForm.code,
          name: editForm.name,
          packagingType: editForm.packagingType,
          bottleType: editForm.bottleType,
          color: editForm.color,
          subcategory: editForm.subcategory,
          cfbSize: editForm.cfbSize,
          quantity: parseInt(editForm.quantity) || 0,
        })
      });

      if (!res.ok) throw new Error('Failed to update SKU');
      
      await fetchData(); // Refresh data
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || 'Error updating SKU');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.code.toLowerCase().includes(search.toLowerCase()) || 
    (p.brand || '').toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>SKU Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Manage packaging specifications and directly import SKUs.</p>
        </div>
        
        {/* Quick Upload Button */}
        <div>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          <button 
            className="btn-primary" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {uploading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Upload size={18} />}
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </div>
      </div>

      {/* Upload Feedback */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ marginBottom: 24, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#ef4444' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{error}</span>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ marginBottom: 24, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <CheckCircle size={20} color="#22c55e" style={{ marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>Import Successful</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Imported: {result.imported} | Skipped: {result.skipped}
              </p>
              {result.errors.length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>Warnings ({result.errors.length}):</p>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    {result.errors.length > 5 && <li>...and {result.errors.length - 5} more</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="glass-card" style={{ marginBottom: 24, padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-primary)', padding: '0 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', flex: 1, height: 42 }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by Material Code or Brand..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', minWidth: 1000 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-hover)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Material Code</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pack Size</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Bottle Type</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Cap Colour</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Bottle Category</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>CFB Size</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Qty/CFB</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  No SKUs found. Try uploading a CSV.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, i) => {
                const packSize = p.packagingType || p.size || p.specifications?.Size || '-';
                const bottleType = p.bottleType || p.specifications?.['Bottle Type'] || '-';
                const capColor = p.color || p.specifications?.Color || '-';
                const category = p.subcategory || p.category || '-';
                const cfbSize = p.cfbSize || p.specifications?.['CFB Size'] || '-';
                const qtyCfb = p.quantity || p.stock || '-';

                return (
                  <motion.tr 
                    key={p.id}
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>{p.code}</td>
                    <td style={{ padding: '14px 20px' }}>{p.name}</td>
                    <td style={{ padding: '14px 20px' }}>{packSize}</td>
                    <td style={{ padding: '14px 20px' }}>{bottleType}</td>
                    <td style={{ padding: '14px 20px' }}>{capColor}</td>
                    <td style={{ padding: '14px 20px' }}>{category}</td>
                    <td style={{ padding: '14px 20px' }}>{cfbSize}</td>
                    <td style={{ padding: '14px 20px' }}>{qtyCfb}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => startEdit(p)}
                        className="btn-secondary" 
                        style={{ padding: '4px 12px', fontSize: 12 }}
                      >
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '100%', maxWidth: 500, padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Edit SKU: {editingProduct.name}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label className="form-label">Material Code</label>
                <input type="text" className="form-input" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Product Name</label>
                <input type="text" className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Pack Size</label>
                <input type="text" className="form-input" value={editForm.packagingType} onChange={e => setEditForm({...editForm, packagingType: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Bottle Type</label>
                <input type="text" className="form-input" value={editForm.bottleType} onChange={e => setEditForm({...editForm, bottleType: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Cap Colour</label>
                <input type="text" className="form-input" value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Bottle Category</label>
                <input type="text" className="form-input" value={editForm.subcategory} onChange={e => setEditForm({...editForm, subcategory: e.target.value})} />
              </div>
              <div>
                <label className="form-label">CFB Size</label>
                <input type="text" className="form-input" value={editForm.cfbSize} onChange={e => setEditForm({...editForm, cfbSize: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Qty/CFB</label>
                <input type="number" className="form-input" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setEditingProduct(null)} disabled={saving}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
