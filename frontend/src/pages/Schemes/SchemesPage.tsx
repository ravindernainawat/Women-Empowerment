import React, { useEffect, useState } from 'react';
import { Search, ExternalLink, IndianRupee, CheckCircle, Info, Sparkles } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Scheme {
  scheme_id: string;
  name: string;
  ministry: string;
  category: string;
  description: string;
  max_funding: string;
  eligibility: string[];
  application_url: string;
  tags: string[];
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Microfinance: { bg: '#fdf4ff', text: '#7c3aed' },
  'Business Loan': { bg: '#eff6ff', text: '#1d4ed8' },
  'E-Commerce': { bg: '#fff7ed', text: '#ea580c' },
  'Business Grant': { bg: '#f0fdf4', text: '#16a34a' },
  'Trade Finance': { bg: '#fefce8', text: '#ca8a04' },
};

export const SchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filtered, setFiltered] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await apiClient.get('/api/schemes');
        setSchemes(data.schemes || []);
        setFiltered(data.schemes || []);
      } catch {
        setError('Could not load government schemes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!keyword.trim()) { setFiltered(schemes); return; }
    const kw = keyword.toLowerCase();
    setFiltered(schemes.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.description.toLowerCase().includes(kw) ||
      s.tags.some(t => t.toLowerCase().includes(kw)) ||
      s.category.toLowerCase().includes(kw)
    ));
  }, [keyword, schemes]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Government Scheme Finder</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Eligibility-matched schemes for women entrepreneurs across India</p>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Sparkles size={16} style={{ color: '#16a34a' }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#14532d' }}>
            <strong>Schemes like PMMY (Mudra) and Stand-Up India</strong> provide collateral-free funding for women-led businesses. All listed schemes are verified government initiatives.
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
          placeholder="Search by scheme name, category, or keyword (e.g. mudra, textile, e-commerce)..."
          style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>Loading schemes...</div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '16px', color: '#dc2626', textAlign: 'center' }}>{error}</div>
      )}

      {/* Schemes Grid */}
      {!loading && !error && (
        <>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{filtered.length} scheme{filtered.length !== 1 ? 's' : ''} found</p>
          <div style={{ display: 'grid', gap: '16px' }}>
            {filtered.map(scheme => (
              <SchemeCard key={scheme.scheme_id} scheme={scheme} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
              <IndianRupee size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>No schemes match your search. Try different keywords.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SchemeCard: React.FC<{ scheme: Scheme }> = ({ scheme }) => {
  const [expanded, setExpanded] = useState(false);
  const catStyle = categoryColors[scheme.category] || { bg: '#f8fafc', text: '#374151' };

  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', margin: 0 }}>{scheme.name}</h3>
            <span style={{ fontSize: '11px', background: catStyle.bg, color: catStyle.text, padding: '2px 10px', borderRadius: '99px', fontWeight: 700 }}>
              {scheme.category}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{scheme.ministry}</p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Max Funding</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>{scheme.max_funding}</div>
        </div>
      </div>

      <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '12px' }}>{scheme.description}</p>

      <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', color: '#64748b', cursor: 'pointer', marginBottom: expanded ? '12px' : '0' }}>
        {expanded ? '▲ Hide Eligibility' : '▼ View Eligibility Criteria'}
      </button>

      {expanded && (
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Info size={14} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Eligibility Criteria</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            {scheme.eligibility.map((e, i) => (
              <li key={i} style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '6px', listStyle: 'none', padding: '2px 0' }}>
                <CheckCircle size={13} style={{ color: '#16a34a', flexShrink: 0, marginTop: '3px' }} />
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {scheme.tags.map(tag => (
            <span key={tag} style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '99px' }}>#{tag}</span>
          ))}
        </div>
        <a href={scheme.application_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
          Apply Now <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
