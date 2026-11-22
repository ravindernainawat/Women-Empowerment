import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceGuidanceButtonProps {
  textToRead: string;
  label?: string;
}

export const VoiceGuidanceButton: React.FC<VoiceGuidanceButtonProps> = ({
  textToRead,
  label = 'Read Aloud',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isPlaying ? 'Stop voice reading' : 'Listen to this section aloud'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isPlaying ? 'rgba(8, 127, 140, 0.15)' : 'rgba(0, 0, 0, 0.04)',
        border: '1px solid',
        borderColor: isPlaying ? 'var(--color-primary-500)' : 'var(--color-gray-200)',
        color: isPlaying ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {isPlaying ? <VolumeX size={13} style={{ color: 'var(--color-primary-600)' }} /> : <Volume2 size={13} />}
      <span>{isPlaying ? 'Stop Reading' : label}</span>
    </button>
  );
};
