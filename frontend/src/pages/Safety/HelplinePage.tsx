import React from 'react';
import { Phone, AlertTriangle, Heart, Shield, MessageCircle, Info } from 'lucide-react';

interface Helpline {
  number: string;
  name: string;
  description: string;
  available: string;
  category: 'emergency' | 'women' | 'mental_health' | 'child' | 'cyber';
}

const HELPLINES: Helpline[] = [
  { number: '112', name: 'National Emergency Number', description: 'Police, fire, medical — unified emergency response across India.', available: '24/7', category: 'emergency' },
  { number: '181', name: 'Women Helpline', description: 'Distressed women in difficult situations can call for immediate support, counselling and referral.', available: '24/7', category: 'women' },
  { number: '+91 7827170170', name: 'NCW WhatsApp Helpline', description: 'National Commission for Women — file complaints via WhatsApp for harassment, domestic violence, and more.', available: '24/7', category: 'women' },
  { number: '1930', name: 'Cyber Crime Helpline', description: 'Report online fraud, digital harassment, deepfakes, and cyberstalking to the National Cybercrime Reporting Portal.', available: '24/7', category: 'cyber' },
  { number: '14416', name: 'Tele-MANAS (Mental Health)', description: 'Government of India free mental health helpline. Talk to trained counsellors and psychiatrists.', available: '24/7', category: 'mental_health' },
  { number: '1098', name: 'Childline India', description: 'Emergency outreach for children in need of care and protection — abuse, missing, trafficking.', available: '24/7', category: 'child' },
  { number: '100', name: 'Police Emergency', description: 'Direct line to nearest police station for immediate physical danger or criminal incidents.', available: '24/7', category: 'emergency' },
  { number: '1091', name: 'Women in Distress (Police)', description: 'Dedicated women helpline operated by police. Faster response for safety concerns.', available: '24/7', category: 'women' },
];

const categoryColors: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  emergency: { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', label: 'Emergency' },
  women: { bg: '#fdf4ff', border: '#d8b4fe', icon: '#7c3aed', label: 'Women Support' },
  mental_health: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', label: 'Mental Health' },
  child: { bg: '#fff7ed', border: '#fdba74', icon: '#ea580c', label: 'Child Safety' },
  cyber: { bg: '#eff6ff', border: '#93c5fd', icon: '#1d4ed8', label: 'Cyber Crime' },
};

const categoryIcons: Record<string, React.ReactNode> = {
  emergency: <AlertTriangle size={16} />,
  women: <Shield size={16} />,
  mental_health: <Heart size={16} />,
  child: <Heart size={16} />,
  cyber: <MessageCircle size={16} />,
};

export const HelplinePage: React.FC = () => {
  const emergency = HELPLINES.filter(h => h.category === 'emergency');
  const others = HELPLINES.filter(h => h.category !== 'emergency');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #dc2626, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Emergency Helplines & Support</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Immediate help is a call away. All numbers are free to call.</p>
          </div>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '14px', color: '#7f1d1d', lineHeight: 1.5 }}>
            <strong>In immediate danger?</strong> Call <strong>112</strong> (National Emergency) or <strong>181</strong> (Women Helpline) right now. These are free, 24/7, and cover all of India.
          </div>
        </div>
      </div>

      {/* Emergency Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} /> Priority Emergency Numbers
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {emergency.map(h => (
            <HelplineCard key={h.number} helpline={h} />
          ))}
        </div>
      </div>

      {/* Other Resources */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} /> Specialised Support Lines
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {others.map(h => (
            <HelplineCard key={h.number} helpline={h} />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
        <strong>Your privacy matters.</strong> Calls to these numbers are confidential. You are never required to share your identity. If you feel you are being watched, use the <strong>Quick Mask (2×Esc)</strong> button at the bottom-right to disguise this screen immediately.
      </div>
    </div>
  );
};

const HelplineCard: React.FC<{ helpline: Helpline }> = ({ helpline }) => {
  const style = categoryColors[helpline.category];
  return (
    <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <a
        href={`tel:${helpline.number}`}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minWidth: '90px', background: style.icon, color: 'white', borderRadius: '10px',
          padding: '10px 8px', textDecoration: 'none', textAlign: 'center',
        }}
        aria-label={`Call ${helpline.name}`}
      >
        <Phone size={16} style={{ marginBottom: '4px' }} />
        <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px' }}>{helpline.number}</span>
        <span style={{ fontSize: '10px', marginTop: '2px', opacity: 0.9 }}>Tap to Call</span>
      </a>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{helpline.name}</span>
          <span style={{ fontSize: '11px', background: style.border, color: style.icon, padding: '2px 8px', borderRadius: '99px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {categoryIcons[helpline.category]} {style.label}
          </span>
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>✓ {helpline.available}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>{helpline.description}</p>
      </div>
    </div>
  );
};
