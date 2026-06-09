'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, X, ChevronRight, Table, RefreshCw, Download } from 'lucide-react';

interface ParsedRow {
  [key: string]: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  total: number;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
    current += char;
  }
  result.push(current.trim().replace(/\r/g, ''));
  return result;
}

const STAGE_TYPES = {
  IDLE: 'idle',
  PREVIEW: 'preview',
  IMPORTING: 'importing',
  DONE: 'done',
} as const;

type Stage = typeof STAGE_TYPES[keyof typeof STAGE_TYPES];

export default function CSVImportPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a CSV file (.csv)');
      return;
    }
    setCsvFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split('\n').filter(l => l.trim());
      if (lines.length < 2) { setError('CSV must have a header row and at least one data row.'); return; }
      const hdrs = parseCSVLine(lines[0]);
      const rows: ParsedRow[] = [];
      for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
        const vals = parseCSVLine(lines[i]);
        const row: ParsedRow = {};
        hdrs.forEach((h, idx) => { row[h] = vals[idx] || ''; });
        rows.push(row);
      }
      setHeaders(hdrs);
      setPreviewRows(rows);
      setTotalRows(lines.length - 1);
      setStage('preview');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (!csvFile) return;
    setStage('importing');
    setProgress(0);

    // Fake progress animation
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 85));
    }, 150);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await fetch('/api/csv', { method: 'POST', body: formData });
      clearInterval(interval);
      setProgress(100);

      if (!res.ok) { throw new Error('Upload failed'); }
      const data = await res.json();
      setResult(data);
      setStage('done');
    } catch (err) {
      clearInterval(interval);
      setError('Import failed. Please try again.');
      setStage('preview');
    }
  };

  const reset = () => {
    setStage('idle');
    setCsvFile(null);
    setHeaders([]);
    setPreviewRows([]);
    setTotalRows(0);
    setResult(null);
    setError('');
    setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadTemplate = () => {
    const template = 'SKU,Product Name,Short Name,Brand / Variant,Size,Unit,Category,Description,Price,Stock,Status,Image URL\n300001,Sample Product,Sample,Standard,500,ML,Cleaning,Sample description,0,0,Active,\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'packvisionai-template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>CSV Import</h1>
          <p className="page-subtitle">Bulk import products from a CSV file. Auto-detects columns and maps them to product fields.</p>
        </div>
        <button className="btn-secondary" onClick={downloadTemplate} style={{ fontSize: 13, padding: '9px 16px' }}>
          <Download size={14} /> Download Template
        </button>
      </div>

      {/* Column Mapping Reference */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Auto-Detected CSV Columns</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            ['SKU / Product Code', 'code'],
            ['Product Name', 'name'],
            ['Short Name', 'shortName'],
            ['Brand / Variant', 'brand'],
            ['Size + Unit', 'size'],
            ['Category', 'category'],
            ['Description', 'description'],
            ['Price', 'price'],
            ['Stock', 'stock'],
            ['Status', 'status'],
            ['Bottle Type', 'bottleType'],
            ['CFB Size', 'cfbSize'],
          ].map(([csv, field]) => (
            <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'var(--bg-primary)', border: '1px solid var(--surface-border)', borderRadius: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{csv}</span>
              <ChevronRight size={11} color="var(--text-muted)" />
              <code style={{ color: 'var(--accent-hover)', background: 'var(--accent-subtle)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>{field}</code>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE — Drop Zone */}
        {stage === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: 'var(--danger)' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFileInput} />
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--surface-border)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: '60px 40px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'var(--accent-subtle)' : 'var(--bg-card)',
                transition: 'all 0.25s',
              }}>
              <motion.div animate={{ scale: dragOver ? 1.08 : 1 }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 20, background: dragOver ? 'var(--accent)' : 'var(--bg-glass)', border: '2px solid var(--surface-border)', marginBottom: 20 }}>
                <Upload size={28} color={dragOver ? 'white' : 'var(--text-muted)'} />
              </motion.div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: dragOver ? 'var(--accent-hover)' : 'var(--text-primary)' }}>
                {dragOver ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>or click to browse — CSV files only</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}>
                <FileText size={13} /> Supports: products_website_upload.csv or any structured CSV
              </div>
            </div>
          </motion.div>
        )}

        {/* PREVIEW */}
        {stage === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'var(--success-subtle)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, marginBottom: 20 }}>
              <Check size={18} color="var(--success)" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>File ready: {csvFile?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{totalRows} rows detected · {headers.length} columns found</div>
              </div>
              <button onClick={reset} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {/* Detected Columns */}
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Detected Columns ({headers.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {headers.map(h => (
                  <span key={h} style={{ padding: '3px 10px', background: 'var(--accent-subtle)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, fontSize: 12, color: 'var(--accent-hover)', fontWeight: 600 }}>{h}</span>
                ))}
              </div>
            </div>

            {/* Preview Table */}
            <div className="glass-card" style={{ overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Table size={15} color="var(--text-muted)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Preview — first 5 rows</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 600 }}>
                  <thead>
                    <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {headers.map(h => (
                          <td key={h} style={{ fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row[h] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalRows > 5 && (
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--surface-border)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  ...and {totalRows - 5} more rows
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={reset}>Cancel</button>
              <button className="btn-primary" onClick={handleImport} style={{ padding: '11px 28px' }}>
                <Upload size={15} /> Import {totalRows} Products
              </button>
            </div>
          </motion.div>
        )}

        {/* IMPORTING */}
        {stage === 'importing' && (
          <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-subtle)', border: '2px solid var(--accent)', marginBottom: 24 }}>
                <RefreshCw size={24} color="var(--accent-hover)" />
              </motion.div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Importing Products...</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>Parsing CSV, mapping columns and saving to database</p>
              <div style={{ maxWidth: 300, margin: '0 auto', height: 8, background: 'var(--bg-tertiary)', borderRadius: 8, overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', background: 'var(--gradient-brand)', borderRadius: 8 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--accent-hover)', fontWeight: 600 }}>{progress}%</div>
            </div>
          </motion.div>
        )}

        {/* DONE */}
        {stage === 'done' && result && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: '48px 40px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-subtle)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={32} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Import Complete!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>Your products have been imported and are live in the database.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 400, margin: '0 auto 32px' }}>
                {[
                  { label: 'Imported', value: result.imported, color: 'var(--success)', bg: 'var(--success-subtle)' },
                  { label: 'Skipped', value: result.skipped, color: 'var(--warning)', bg: 'var(--warning-subtle)' },
                  { label: 'Errors', value: result.errors?.length || 0, color: 'var(--danger)', bg: 'var(--danger-subtle)' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ padding: '16px 12px', borderRadius: 12, background: bg, border: `1px solid ${color}33` }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>

              {result.errors && result.errors.length > 0 && (
                <div style={{ textAlign: 'left', maxWidth: 480, margin: '0 auto 24px', padding: '12px 16px', background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>Errors ({result.errors.length})</div>
                  {result.errors.slice(0, 5).map((err, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>• {err}</div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={reset}><Upload size={14} /> Import Another</button>
                <a href="/admin/products" className="btn-primary">View Products →</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
