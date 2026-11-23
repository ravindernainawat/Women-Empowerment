import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Clipboard, ChevronRight } from 'lucide-react';
import { apiClient } from '../../api/client';

interface ExtractResult {
  matched_skills: Record<string, string[]>;
  skill_count: number;
  coverage_pct: number;
  all_found_keywords: string[];
  recommendation: string;
}

const categoryEmoji: Record<string, string> = {
  'Data & Analytics': '📊',
  'Software Development': '💻',
  'Business & Finance': '💼',
  'Communication & Writing': '✍️',
  'Project Management': '📋',
  'Sales & Marketing': '📈',
  'Design & Creative': '🎨',
  'Legal & Compliance': '⚖️',
  'Healthcare & Wellness': '🏥',
  'Education & Training': '🎓',
  'Textile & Crafts': '🧵',
  'Agriculture & Rural': '🌾',
};

export const SkillExtractorPage: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (text.trim().length < 20) { setError('Please paste at least 20 characters of experience or resume text.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/api/skills/extract', { text });
      setResult(data);
    } catch {
      setError('Could not process text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setText(t);
    } catch {
      setError('Could not read clipboard. Please paste manually (Ctrl+V).');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={22} style={{ color: 'white' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Semantic Skill Extractor</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Paste your resume or experience → AI maps it to your skill profile</p>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
        <strong>How it works:</strong> Paste any free-form text — your resume, LinkedIn bio, project descriptions, or work history. Our AI finds skills from 12 professional categories and maps them to your WEIS skill profile.
      </div>

      {/* Input */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>Your Experience Text</label>
          <button onClick={pasteFromClipboard} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
            <Clipboard size={13} /> Paste from Clipboard
          </button>
        </div>
        <textarea
          value={text} onChange={e => setText(e.target.value)} rows={10}
          placeholder="Paste your resume, CV, LinkedIn summary, or any professional experience here...

Example: 'I have 5 years experience in Python development and data analysis using pandas and sklearn. I managed a team of 4 engineers using Agile methodology and Jira. I also handled client communication and financial reporting for our startup...'"
          style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{text.length} characters</span>
          <span style={{ fontSize: '12px', color: text.length >= 20 ? '#16a34a' : '#9ca3af' }}>{text.length >= 20 ? '✓ Ready to extract' : 'Need 20+ characters'}</span>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <button onClick={handleExtract} disabled={loading} style={{ width: '100%', background: loading ? '#a78bfa' : '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
        <Sparkles size={18} /> {loading ? 'Analysing your experience...' : 'Extract My Skills →'}
      </button>

      {/* Results */}
      {result && (
        <div>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Skills Found', value: result.skill_count, color: '#7c3aed' },
              { label: 'Categories Covered', value: Object.keys(result.matched_skills).length, color: '#2563eb' },
              { label: 'Profile Coverage', value: `${result.coverage_pct}%`, color: '#16a34a' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '14px', color: '#14532d', lineHeight: 1.5 }}>{result.recommendation}</p>
          </div>

          {/* Skill Categories */}
          <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', marginBottom: '14px' }}>Skills by Category</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(result.matched_skills).map(([category, skills]) => (
              <div key={category} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{categoryEmoji[category] || '🔧'}</span>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{category}</span>
                  <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '1px 8px', borderRadius: '99px', marginLeft: 'auto', fontWeight: 600 }}>{skills.length} skills</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skills.map(skill => (
                    <span key={skill} style={{ fontSize: '12px', background: '#f1f5f9', color: '#374151', padding: '3px 10px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ChevronRight size={11} style={{ color: '#7c3aed' }} /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
