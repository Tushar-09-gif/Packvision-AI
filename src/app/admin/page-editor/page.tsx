'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, LayoutTemplate, Type, Quote, Hash } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function PageEditor() {
  const { landingContent, updateLandingContent, loginContent, updateLoginContent } = useAppStore();
  const [saving, setSaving] = useState(false);
  
  // Local state for editing
  const [content, setContent] = useState(landingContent || {
    heroTagline: "Enterprise Product Intelligence Platform",
    heroTitle: "Intelligent Product\\nRecognition & Management",
    heroSubtitle: "Built to simplify operations, train teams faster, and eliminate manual confusion. AI-powered recognition meets enterprise workflow.",
    stats: [
      { val: '16+', label: 'Products Tracked' },
      { val: '97%', label: 'AI Accuracy' },
      { val: '4x', label: 'Faster Training' },
      { val: '24/7', label: 'Always On' },
    ],
    founderQuote: "This system transformed how our team identifies and handles products. What used to take 10 minutes of explanation now takes 2 seconds.",
    founderName: "Tushar Makwana",
    founderTitle: "Founder & Product Lead · PackVision AI"
  });

  const [loginContentState, setLoginContentState] = useState(loginContent || {
    title: 'Welcome Back',
    subtitle: 'Sign in to access your workspace.',
    adminTabLabel: 'Admin Login',
    workerTabLabel: 'Worker Access',
  });

  useEffect(() => {
    if (landingContent) setContent(landingContent);
    if (loginContent) setLoginContentState(loginContent);
  }, [landingContent, loginContent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginContentState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStatChange = (index: number, field: 'val' | 'label', value: string) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setContent(prev => ({ ...prev, stats: newStats }));
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      updateLandingContent(content),
      updateLoginContent(loginContentState)
    ]);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Page Content Editor</h1>
        <p className="page-subtitle">Customize the text shown on the public landing page and login page.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* HERO SECTION */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--accent)', fontWeight: 600 }}>
            <LayoutTemplate size={18} /> Hero Section
          </div>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Tagline (Above Title)</label>
              <input name="heroTagline" value={content.heroTagline} onChange={handleChange} className="form-input" placeholder="e.g. Enterprise Product Intelligence..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Main Title (Use \\n for line breaks)</label>
              <textarea name="heroTitle" value={content.heroTitle} onChange={handleChange} className="form-input" rows={2} placeholder="Main Heading..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Subtitle / Description</label>
              <textarea name="heroSubtitle" value={content.heroSubtitle} onChange={handleChange} className="form-input" rows={3} placeholder="Subheading text..." />
            </div>
          </div>
        </motion.div>

        {/* STATS SECTION */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--success)', fontWeight: 600 }}>
            <Hash size={18} /> Impact Statistics
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {content.stats.map((stat, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: 'var(--text-muted)' }}>Stat Value</label>
                  <input value={stat.val} onChange={(e) => handleStatChange(i, 'val', e.target.value)} className="form-input" style={{ fontSize: 20, fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: 'var(--text-muted)' }}>Stat Label</label>
                  <input value={stat.label} onChange={(e) => handleStatChange(i, 'label', e.target.value)} className="form-input" style={{ fontSize: 13 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TESTIMONIAL SECTION */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--warning)', fontWeight: 600 }}>
            <Quote size={18} /> Testimonial / Founder Quote
          </div>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>The Quote</label>
              <textarea name="founderQuote" value={content.founderQuote} onChange={handleChange} className="form-input" rows={3} placeholder="Quote text..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Name</label>
                <input name="founderName" value={content.founderName} onChange={handleChange} className="form-input" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Title / Role</label>
                <input name="founderTitle" value={content.founderTitle} onChange={handleChange} className="form-input" placeholder="e.g. CEO at Company" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* LOGIN PAGE SECTION */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--brand)', fontWeight: 600 }}>
            <Type size={18} /> Login Page Text
          </div>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Login Title</label>
                <input name="title" value={loginContentState.title} onChange={handleLoginChange} className="form-input" placeholder="Welcome back" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Login Subtitle</label>
                <input name="subtitle" value={loginContentState.subtitle} onChange={handleLoginChange} className="form-input" placeholder="Sign in..." />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Admin Tab Label</label>
                <input name="adminTabLabel" value={loginContentState.adminTabLabel} onChange={handleLoginChange} className="form-input" placeholder="Admin Login" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Worker Tab Label</label>
                <input name="workerTabLabel" value={loginContentState.workerTabLabel} onChange={handleLoginChange} className="form-input" placeholder="Worker Access" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* SAVE BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '12px 32px', fontSize: 15 }}>
            {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
