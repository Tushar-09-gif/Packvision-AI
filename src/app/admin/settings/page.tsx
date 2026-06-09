'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const { theme, toggleTheme } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'PackVision AI Industries',
    managerName: 'Tushar Makwana',
    email: 'tushar@packvisionai.com',
    language: 'English',
    notifications: true,
    emailAlerts: true,
    scanAlerts: true,
    lowStockAlerts: true,
    autoScan: true,
    confidenceThreshold: 80,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Configure your workspace and preferences.</p>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '14px 20px', background: 'var(--success-subtle)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
          <Check size={18} /> Settings saved successfully!
        </motion.div>
      )}

      {/* Profile */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <User size={18} color="var(--accent-hover)" />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Profile</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="float-label"><label>Company Name</label><input className="input-field" value={settings.companyName} onChange={e => setSettings({ ...settings, companyName: e.target.value })} /></div>
          <div className="float-label"><label>Manager Name</label><input className="input-field" value={settings.managerName} onChange={e => setSettings({ ...settings, managerName: e.target.value })} /></div>
          <div className="float-label"><label>Email</label><input className="input-field" type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} /></div>
          <div className="float-label"><label>Language</label><select className="select-field" value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })}>
            <option>English</option><option>Hindi</option><option>Gujarati</option>
          </select></div>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Palette size={18} color="var(--accent-hover)" />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Appearance</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Dark Mode</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Switch between light and dark theme</div>
          </div>
          <button onClick={toggleTheme}
            style={{
              width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative',
              background: theme === 'dark' ? 'var(--accent)' : 'var(--surface-border)', transition: 'background 0.2s',
            }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3,
              left: theme === 'dark' ? 23 : 3, transition: 'left 0.2s',
            }} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Bell size={18} color="var(--accent-hover)" />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Notifications</h3>
        </div>
        {[
          { key: 'notifications', label: 'Push Notifications', sub: 'Receive in-app notifications' },
          { key: 'emailAlerts', label: 'Email Alerts', sub: 'Get email notifications for important events' },
          { key: 'scanAlerts', label: 'Scan Alerts', sub: 'Notify when unrecognized products are scanned' },
          { key: 'lowStockAlerts', label: 'Low Stock Alerts', sub: 'Alert when product quantity is below threshold' },
        ].map(n => (
          <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--surface-border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{n.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.sub}</div>
            </div>
            <button onClick={() => setSettings({ ...settings, [n.key]: !settings[n.key as keyof typeof settings] })}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                background: settings[n.key as keyof typeof settings] ? 'var(--accent)' : 'var(--surface-border)', transition: 'background 0.2s',
              }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3,
                left: settings[n.key as keyof typeof settings] ? 23 : 3, transition: 'left 0.2s',
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* AI Settings */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Shield size={18} color="var(--accent-hover)" />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>AI Recognition</h3>
        </div>
        <div className="float-label" style={{ marginBottom: 16 }}>
          <label>Confidence Threshold ({settings.confidenceThreshold}%)</label>
          <input type="range" min={50} max={99} value={settings.confidenceThreshold}
            onChange={e => setSettings({ ...settings, confidenceThreshold: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>50% (Lenient)</span><span>99% (Strict)</span>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} style={{ padding: '14px 32px', fontSize: 15 }}>
        <Save size={16} /> Save Settings
      </button>
    </div>
  );
}
