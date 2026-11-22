import React, { useState, useEffect } from 'react';
import { EyeOff, Eye, BookOpen } from 'lucide-react';

/**
 * Stealth / Quick-Mask Emergency Disguise Mode
 * 
 * Pressing 'Escape' twice rapidly or clicking the "Quick Mask / Safe Exit" button
 * immediately transforms the browser view into a realistic, benign study note
 * ("Modern JavaScript Essentials") in < 50ms, protecting the user from onlookers.
 */
export const QuickMaskModal: React.FC = () => {
  const [isMasked, setIsMasked] = useState(false);
  const [lastEscTime, setLastEscTime] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscTime < 500) {
          // Double press Esc -> Toggle Mask
          setIsMasked((prev) => !prev);
        }
        setLastEscTime(now);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastEscTime]);

  if (!isMasked) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setIsMasked(true)}
          title="Emergency Quick-Mask: Press Esc twice or click to disguise this tab immediately"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            padding: '8px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.15s ease',
          }}
        >
          <EyeOff size={15} style={{ color: '#f87171' }} />
          <span>Quick Mask (2x Esc)</span>
        </button>
      </div>
    );
  }

  // --- BENIGN DISGUISE VIEW (Harmless Technical Study Notes) ---
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#ffffff',
        zIndex: 99999,
        overflowY: 'auto',
        color: '#1e293b',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Discreet unmask button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '18px' }}>
            <BookOpen size={20} style={{ color: '#2563eb' }} />
            <span>Developer Documentation & Reference Notes</span>
          </div>
          <button
            onClick={() => setIsMasked(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <Eye size={14} />
            <span>Restore Workspace</span>
          </button>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
          Understanding Asynchronous JavaScript & Event Loops
        </h1>

        <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '15px', marginBottom: '20px' }}>
          JavaScript has a runtime model based on an event loop, which is responsible for executing the code, collecting and processing events, and executing queued sub-tasks. This model is quite different from models in other languages like C and Java.
        </p>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontFamily: 'monospace', fontSize: '13px' }}>
          <div style={{ color: '#64748b', marginBottom: '8px' }}>// Example: Microtask vs Macrotask Queue Execution</div>
          <div style={{ color: '#0f172a' }}>console.log(&apos;Start script execution&apos;);</div>
          <div style={{ color: '#2563eb' }}>setTimeout(() =&gt; console.log(&apos;Timer callback executed&apos;), 0);</div>
          <div style={{ color: '#059669' }}>Promise.resolve().then(() =&gt; console.log(&apos;Promise microtask resolved&apos;));</div>
          <div style={{ color: '#0f172a' }}>console.log(&apos;End script synchronous pass&apos;);</div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
          Key Runtime Components
        </h2>
        <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: 1.8, fontSize: '14px' }}>
          <li><strong>Call Stack:</strong> Function calls form a stack of frames in single-threaded LIFO sequence.</li>
          <li><strong>Heap:</strong> Objects are allocated in a heap which is just a name to denote a large mostly unstructured memory region.</li>
          <li><strong>Queue:</strong> A JavaScript runtime contains a message queue, which is a list of messages to be processed.</li>
        </ul>
      </div>
    </div>
  );
};
