import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Eye, Copy, CheckCircle, Search, AlertTriangle, Lock } from 'lucide-react';

const API = axios.create({ baseURL: 'http://localhost:8000' });

type Tab = 'submit' | 'track';

export const AnonymousReportPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('submit');

  // Submit form state
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ tracking_token: string; urgency: string; status: string } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);

  // Track form state
  const [trackToken, setTrackToken] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<{ tracking_token: string; incident_type: string; status: string; urgency: string; reported_at: string } | null>(null);
  const [trackError, setTrackError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const { data } = await API.post('/api/safety-reports/anonymous', { incident_type: incidentType, description });
      setSubmitResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Submission failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTracking(true);
    try {
      const { data } = await API.get(`/api/safety-reports/track/${trackToken.trim()}`);
      setTrackResult(data);
    } catch {
      setTrackError('Tracking token not found. Please check and try again.');
    } finally {
      setTracking(false);
    }
  };

  const copyToken = async () => {
    if (submitResult?.tracking_token) {
      await navigator.clipboard.writeText(submitResult.tracking_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const urgencyColor: Record<string, string> = { urgent: '#dc2626', high: '#ea580c', standard: '#16a34a' };
  const statusColor: Record<string, string> = { submitted: '#3b82f6', under_review: '#f59e0b', resolved: '#16a34a', dismissed: '#6b7280' };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={22} style={{ color: 'white' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Anonymous Sanctuary</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Zero login required. Fully confidential. Retaliation-proof.</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <ShieldCheck size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.5 }}>
          <strong>No account needed.</strong> Your report is logged without any identity — no IP, no name, no email. You receive a random tracking token to monitor progress privately.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '28px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        {(['submit', 'track'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '12px', background: tab === t ? '#7c3aed' : 'white', color: tab === t ? 'white' : '#64748b',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s',
          }}>
            {t === 'submit' ? '📝 Report Incident' : '🔍 Track Report'}
          </button>
        ))}
      </div>

      {/* Submit Tab */}
      {tab === 'submit' && !submitResult && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
              Incident Type *
            </label>
            <select
              value={incidentType} onChange={e => setIncidentType(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: 'white', color: '#0f172a' }}
            >
              <option value="">Select type...</option>
              {['Harassment', 'Domestic Violence', 'Workplace Discrimination', 'Stalking/Cyberstalking', 'Physical Threat', 'Sexual Assault', 'Financial Abuse', 'Child Safety', 'Other'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
              Describe the Incident * <span style={{ fontWeight: 400, color: '#9ca3af' }}>(min. 10 characters)</span>
            </label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} required minLength={10} rows={5}
              placeholder="Describe what happened. Do not include names or details that could identify you if that makes you uncomfortable..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          {submitError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertTriangle size={15} /> {submitError}
            </div>
          )}
          <button type="submit" disabled={submitting} style={{
            background: submitting ? '#a78bfa' : '#7c3aed', color: 'white', border: 'none', borderRadius: '10px',
            padding: '13px', fontWeight: 700, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer',
          }}>
            {submitting ? 'Submitting securely...' : '🔒 Submit Anonymously'}
          </button>
        </form>
      )}

      {/* Success State */}
      {tab === 'submit' && submitResult && (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={56} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
          <h2 style={{ fontWeight: 800, fontSize: '20px', color: '#0f172a' }}>Report Logged Anonymously</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Your report has been received with zero-identity logging under strict zero-retaliation protocols.</p>

          <div style={{ background: '#f8fafc', border: '2px dashed #7c3aed', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Your Tracking Token — Save This!</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
              <code style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed', letterSpacing: '2px' }}>{submitResult.tracking_token}</code>
              <button onClick={copyToken} style={{ background: copied ? '#16a34a' : '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                {copied ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>Use this token on the "Track Report" tab to check your case status.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', background: (urgencyColor[submitResult.urgency] || '#6b7280') + '15', color: urgencyColor[submitResult.urgency] || '#6b7280', padding: '4px 12px', borderRadius: '99px', fontWeight: 600 }}>
              Urgency: {submitResult.urgency}
            </span>
            <span style={{ fontSize: '13px', background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '99px', fontWeight: 600 }}>
              Status: {submitResult.status}
            </span>
          </div>

          <button onClick={() => { setSubmitResult(null); setIncidentType(''); setDescription(''); }} style={{ marginTop: '24px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', color: '#64748b', fontSize: '14px' }}>
            Submit Another Report
          </button>
        </div>
      )}

      {/* Track Tab */}
      {tab === 'track' && (
        <div>
          <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Tracking Token</label>
              <input
                type="text" value={trackToken} onChange={e => setTrackToken(e.target.value)} required
                placeholder="e.g. SAFE-A3F9BC-4821"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', letterSpacing: '1px', boxSizing: 'border-box' }}
              />
            </div>
            {trackError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={15} /> {trackError}
              </div>
            )}
            <button type="submit" disabled={tracking} style={{ background: tracking ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '13px', fontWeight: 700, fontSize: '15px', cursor: tracking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Search size={18} /> {tracking ? 'Looking up...' : 'Check Status'}
            </button>
          </form>

          {trackResult && (
            <div style={{ marginTop: '24px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Eye size={18} style={{ color: '#16a34a' }} />
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Case Status</span>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  ['Incident Type', trackResult.incident_type],
                  ['Status', trackResult.status],
                  ['Urgency', trackResult.urgency],
                  ['Reported At', new Date(trackResult.reported_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontWeight: 700, color: label === 'Status' ? (statusColor[value as string] || '#374151') : '#0f172a' }}>{value}</span>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '14px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                Your case is being handled under strict zero-retaliation protocols. WEIS team will not share your information.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
