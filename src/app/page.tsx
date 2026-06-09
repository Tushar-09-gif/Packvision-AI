'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Scan, LayoutDashboard, Package, Shield, Zap, BarChart3, Camera, Users, ChevronRight, Star, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function LandingPage() {
  const { landingContent, user } = useAppStore();

  const c = landingContent || {
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
  };

  const formattedTitle = c.heroTitle.split('\\n').map((line, i) => (
    <span key={i}>
      {line}
      {i !== c.heroTitle.split('\\n').length - 1 && <br />}
    </span>
  ));

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* FLOATING EDIT BUTTON FOR ADMINS */}
      {user?.role === 'admin' && (
        <Link href="/admin/page-editor" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: 'var(--accent)', color: 'white', padding: '12px 24px',
          borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          textDecoration: 'none'
        }}>
          <Settings size={18} /> Edit This Page
        </Link>
      )}

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--surface-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white' }}>A</div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>PackVision AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ padding: '8px 16px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Sign In</Link>
            <Link href="/login" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14, borderRadius: 'var(--radius-full)' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 20px 60px' }}>
        <div className="orb orb-1" style={{ background: 'var(--accent)', opacity: 0.15, filter: 'blur(100px)' }} />
        <div className="orb orb-2" style={{ background: '#ec4899', opacity: 0.15, filter: 'blur(100px)' }} />
        <div className="orb orb-3" style={{ background: '#8b5cf6', opacity: 0.15, filter: 'blur(100px)' }} />
        <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ position: 'relative', zIndex: 1, maxWidth: 840 }}>
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--accent-subtle)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 32, fontSize: 14, fontWeight: 600, color: 'var(--accent-hover)' }}>
            <Zap size={16} /> {c.heroTagline}
          </motion.div>

          <motion.h1 variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }} style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 28, background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {formattedTitle}
          </motion.h1>

          <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} style={{ fontSize: 20, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 48, maxWidth: 640, margin: '0 auto 48px' }}>
            {c.heroSubtitle}
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-primary" style={{ padding: '16px 36px', fontSize: 16, borderRadius: 'var(--radius-full)', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}>
              Launch Dashboard <ArrowRight size={18} />
            </Link>
            <Link href="/login?role=worker" className="btn-secondary" style={{ padding: '16px 36px', fontSize: 16, borderRadius: 'var(--radius-full)', background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              Worker Access <Camera size={18} />
            </Link>
          </motion.div>

          {/* Trust Bar */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }} style={{ marginTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap', background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '32px 40px', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            {c.stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 36, fontWeight: 800, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 16px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} style={{ textAlign: 'center', marginBottom: 80 }}>
            <motion.div variants={fadeUp} style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-hover)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Core Capabilities</motion.div>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20 }}>Everything You Need</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>A complete system designed for manufacturing teams who demand precision, speed, and seamless management.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {[
              { icon: Camera, title: 'AI Camera Recognition', desc: 'Point, scan, and instantly identify any product with 97%+ accuracy using our advanced computer vision model.', color: '#6366f1' },
              { icon: LayoutDashboard, title: 'Admin Dashboard', desc: 'Full control panel to manage products, track activity, and monitor team performance in real-time.', color: '#8b5cf6' },
              { icon: Users, title: 'Worker Portal', desc: 'Simplified interface for junior staff — large buttons, camera-first workflow, zero confusion.', color: '#ec4899' },
              { icon: Package, title: 'Smart Catalog', desc: 'Visual product database with instant search, deep filtering by category, bottle type, and packaging.', color: '#10b981' },
              { icon: BarChart3, title: 'Live Analytics', desc: 'Beautiful dashboards showing scans, recognition rates, product popularity, and granular team activity.', color: '#f59e0b' },
              { icon: Shield, title: 'Role-Based Access', desc: 'Admins manage everything. Workers view and scan only. Secure, simple, and strictly controlled.', color: '#ef4444' },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.2 } }} className="glass-card" style={{ padding: 40, cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--surface-border)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: `0 8px 24px ${f.color}20` }}>
                  <f.icon size={28} color={f.color} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section style={{ padding: '100px 16px', background: 'var(--surface)', borderTop: '1px solid var(--surface-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} style={{ textAlign: 'center', marginBottom: 80 }}>
            <motion.div variants={fadeUp} style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-hover)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>How It Works</motion.div>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Three Steps. Zero Confusion.</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {[
              { step: '01', title: 'Scan the Product', desc: 'Worker opens the camera and points it at any bottle or package on the floor. No manual typing required.' },
              { step: '02', title: 'AI Identifies It', desc: 'Computer vision matches the product against the database in under 2 seconds, handling angles and glare.' },
              { step: '03', title: 'Get Full Details', desc: 'Product name, code, packaging info, and handling instructions — everything appears instantly.' },
            ].map((s) => (
              <motion.div key={s.step} variants={fadeUp} style={{ position: 'relative', padding: 40, background: 'var(--bg-primary)', borderRadius: 24, border: '1px solid var(--surface-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 80, fontWeight: 900, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: 0.15, position: 'absolute', top: 20, right: 30 }}>{s.step}</div>
                <div style={{ position: 'relative', paddingTop: 20 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>{s.title}</h3>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* TESTIMONIAL */}
      <section style={{ padding: '120px 16px', background: 'var(--bg-primary)', position: 'relative' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={24} fill="#f59e0b" color="#f59e0b" />)}
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 40, fontWeight: 500 }}>
              &ldquo;{c.founderQuote}&rdquo;
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: 'white', boxShadow: '0 10px 20px rgba(99,102,241,0.3)' }}>{c.founderName.charAt(0)}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{c.founderName}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{c.founderTitle}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 16px', position: 'relative', background: 'var(--surface)', borderTop: '1px solid var(--surface-border)' }}>
        <div className="orb" style={{ width: 600, height: 600, background: 'var(--accent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(150px)', opacity: 0.1, position: 'absolute' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 24 }}>Ready to Transform<br />Your Operations?</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 48, lineHeight: 1.6 }}>Start managing products smarter. Train teams faster. Eliminate manual confusion forever with PackVision AI.</motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Link href="/login" className="btn-primary" style={{ padding: '18px 48px', fontSize: 16, borderRadius: 'var(--radius-full)', boxShadow: '0 10px 30px rgba(99,102,241,0.3)' }}>
                Get Started Now <ChevronRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 32px 40px', background: 'var(--bg-primary)', borderTop: '1px solid var(--surface-border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'white' }}>A</div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>PackVision AI</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} PackVision AI by Tushar Makwana. Enterprise Product Intelligence.</p>
      </footer>
    </div>
  );
}
