'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Search, Package } from 'lucide-react';

export default function WorkerSKUPage() {
  const { products } = useAppStore();
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.code.toLowerCase().includes(search.toLowerCase()) || 
    (p.brand || '').toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Product SKUs</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>View all verified packaging specifications.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ marginBottom: 24, padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-primary)', padding: '0 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', flex: 1, height: 42 }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by Material Code or Product Name..." 
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
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  No SKUs found.
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
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
