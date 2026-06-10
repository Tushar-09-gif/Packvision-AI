'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Search, Package, AlertCircle, CheckCircle, RotateCcw, Zap, Info, Box, Tag, FileText, WifiOff } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function ScanPage() {
  const { products, addRecognitionLog, user } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<typeof products[0] | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraError, setCameraError] = useState('');

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      let msg = 'Camera not available.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        msg = 'Camera is in use by another app. Close it and try again.';
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        msg = 'Camera requires HTTPS. Please open via https:// or use Manual Search below.';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const performScan = useCallback(async () => {
    if (products.length === 0) {
      setCameraError('No products in the database yet. Ask your admin to add products first.');
      return;
    }
    if (!videoRef.current || !cameraActive) {
      setCameraError('Camera is not active.');
      return;
    }

    setScanning(true);
    setResult(null);
    setNoMatch(false);
    setCameraError('');

    try {
      // 1. Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      // 2. Call our secure backend API route
      const response = await fetch('/api/recognition/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to scan product');
      }

      const aiResult = data.aiResult;

      const workerName = user?.name || 'Worker';

      if (aiResult.id && aiResult.confidence > 60) {
        const matchedProduct = products.find(p => p.id === aiResult.id);
        if (matchedProduct) {
          setResult(matchedProduct);
          setConfidence(aiResult.confidence);
          addRecognitionLog({
            id: `RL-${Date.now()}`, userId: user?.id || 'W-001', userName: workerName,
            productId: matchedProduct.id, productName: matchedProduct.name,
            confidence: aiResult.confidence, matched: true,
            timestamp: new Date().toISOString(), imageUrl: '',
          });
        } else {
          throw new Error("AI returned an invalid product ID");
        }
      } else {
        setNoMatch(true);
        setConfidence(aiResult.confidence || 0);
        addRecognitionLog({
          id: `RL-${Date.now()}`, userId: user?.id || 'W-001', userName: workerName,
          productId: null, productName: null,
          confidence: aiResult.confidence || 0, matched: false,
          timestamp: new Date().toISOString(), imageUrl: '',
        });
      }

    } catch (err: any) {
      console.error("Scan Error:", err);
      setCameraError(err.message || 'An error occurred during AI recognition.');
      
      // Fallback log
      addRecognitionLog({
        id: `RL-${Date.now()}`, userId: user?.id || 'W-001', userName: user?.name || 'Worker',
        productId: null, productName: null,
        confidence: 0, matched: false,
        timestamp: new Date().toISOString(), imageUrl: '',
      });
    } finally {
      setScanning(false);
    }
  }, [products, addRecognitionLog, user, cameraActive]);

  const searchResults = searchQuery.length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const reset = () => {
    setResult(null);
    setNoMatch(false);
    setSearchMode(false);
    setSearchQuery('');
    setCameraError('');
  };

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          <Camera size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          AI Product Scanner
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Point camera at product or search manually</p>
      </div>

      <AnimatePresence mode="wait">
        {/* RESULT VIEW */}
        {(result || noMatch) ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {result ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20, padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--success-subtle)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <CheckCircle size={32} color="var(--success)" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>Product Identified!</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Confidence: <span style={{ fontWeight: 700, color: 'var(--success)' }}>{confidence}%</span></div>
                  <div className="confidence-bar" style={{ maxWidth: 200, margin: '10px auto 0' }}>
                    <motion.div className="confidence-fill" initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 1 }} style={{ background: 'var(--success)' }} />
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    {result.image ? (
                      <img src={result.image} alt={result.name} style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '1px solid var(--surface-border)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={26} color="var(--accent-hover)" />
                      </div>
                    )}
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{result.name}</h2>
                      <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-hover)', background: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: 4 }}>{result.code}</code>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      { icon: Tag, label: 'Category', val: result.category },
                      { icon: Box, label: 'Bottle Type', val: result.bottleType || result.specifications?.['Bottle Type'] },
                      { icon: FileText, label: 'Label Size', val: result.labelSize || result.specifications?.['Label Size'] },
                      { icon: Package, label: 'Size', val: result.size ? `${result.size} ${result.unit || ''}` : result.specifications?.Size },
                    ].map(d => (
                      <div key={d.label} style={{ padding: 10, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                          <d.icon size={11} color="var(--text-muted)" />
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.label}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{d.val || '—'}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    {[{ label: 'Size', val: result.size }, { label: 'Color', val: result.color }, { label: 'Stock', val: result.stock }].map(({ label, val }) => (
                      <div key={label} style={{ flex: 1, padding: 10, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{val || '—'}</div>
                      </div>
                    ))}
                  </div>

                  {result.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.description}</p>}
                </div>

                {result.instructions && (
                  <div style={{ padding: 14, background: 'var(--info-subtle)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--info)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Info size={14} /> Worker Instructions
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.instructions}</div>
                  </div>
                )}
                {result.notes && (
                  <div style={{ padding: 14, background: 'var(--warning-subtle)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} /> Important Notes
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.notes}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, marginBottom: 16 }}>
                <AlertCircle size={48} color="var(--warning)" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Product Not Recognized</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Confidence too low ({confidence.toFixed(1)}%). Try again or search manually.</p>
                {products.slice(0, 3).map(p => (
                  <div key={p.id} onClick={() => { setResult(p); setNoMatch(false); setConfidence(75); }}
                    className="glass-card" style={{ padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <Package size={18} color="var(--accent-hover)" />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary" onClick={reset} style={{ width: '100%', padding: '14px 0', fontSize: 15 }}>
              <RotateCcw size={16} /> Scan Again
            </button>
          </motion.div>
        ) : (
          /* SCANNER VIEW */
          <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!searchMode ? (
              <>
                {/* Camera Error Banner */}
                {cameraError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'var(--warning-subtle)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13, color: 'var(--warning)' }}>
                    <WifiOff size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{cameraError}</span>
                  </motion.div>
                )}

                {/* Camera View */}
                <div className="camera-view" style={{ marginBottom: 20 }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {!cameraActive && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', gap: 8 }}>
                      <Camera size={44} color="rgba(255,255,255,0.3)" />
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Press Start Camera</p>
                    </div>
                  )}
                  {scanning && <div className="scanner-line" />}
                  {[{ top: 16, left: 16 }, { top: 16, right: 16 }, { bottom: 16, left: 16 }, { bottom: 16, right: 16 }].map((pos, i) => (
                    <div key={i} style={{
                      position: 'absolute', ...pos, width: 28, height: 28,
                      borderColor: scanning ? 'var(--accent)' : 'rgba(255,255,255,0.4)', borderWidth: 2, borderStyle: 'solid',
                      borderTop: i >= 2 ? 'none' : undefined, borderBottom: i < 2 ? 'none' : undefined,
                      borderLeft: i % 2 === 1 ? 'none' : undefined, borderRight: i % 2 === 0 ? 'none' : undefined,
                      borderRadius: 3, transition: 'border-color 0.3s',
                    }} />
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <button className={cameraActive ? 'btn-secondary' : 'btn-primary'} onClick={cameraActive ? stopCamera : startCamera}
                    style={{ padding: '14px 0', fontSize: 14 }}>
                    <Camera size={16} /> {cameraActive ? 'Stop Camera' : 'Start Camera'}
                  </button>
                  <button className="btn-primary" onClick={performScan} disabled={scanning || !cameraActive}
                    style={{ padding: '14px 0', fontSize: 14, opacity: (scanning || !cameraActive) ? 0.5 : 1 }}>
                    {scanning ? (
                      <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Scanning...</>
                    ) : (
                      <><Zap size={16} /> Scan Now</>
                    )}
                  </button>
                </div>

                <button className="btn-secondary" onClick={() => setSearchMode(true)} style={{ width: '100%', padding: '12px 0', fontSize: 14 }}>
                  <Search size={16} /> Manual Search
                </button>
              </>
            ) : (
              /* MANUAL SEARCH */
              <>
                <div style={{ marginBottom: 14 }}>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input className="input-field" placeholder="Type product name or code..."
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                      style={{ paddingLeft: 42, fontSize: 16, padding: '14px 14px 14px 42px' }} />
                  </div>
                </div>

                {searchResults.map(p => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => { setResult(p); setConfidence(100); setSearchMode(false); setSearchQuery(''); }}
                    className="glass-card" style={{ padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={20} color="var(--accent-hover)" />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.code} · {p.bottleType} · {p.size}</div>
                    </div>
                  </motion.div>
                ))}

                {searchQuery.length > 1 && searchResults.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Package size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No products found</p>
                  </div>
                )}

                {searchQuery.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    Start typing to search products...
                  </div>
                )}

                <button className="btn-secondary" onClick={() => setSearchMode(false)} style={{ width: '100%', padding: '12px 0', fontSize: 14, marginTop: 12 }}>
                  <Camera size={16} /> Back to Camera
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
