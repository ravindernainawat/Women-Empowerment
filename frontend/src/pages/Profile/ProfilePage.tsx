import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageTitle } from '../../components/common/PageTitle';
import { VoiceGuidanceButton } from '../../components/common/VoiceGuidanceButton';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Shield,
  Sparkles,
  Award,
  Save,
} from 'lucide-react';

import { usersApi } from '../../api/users';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await usersApi.updateProfile({ phone, location });
      updateUser(updated);
      setIsSaved(true);
      toast.success('Profile settings updated successfully!');
      setTimeout(() => setIsSaved(false), 3500);
    } catch {
      setSaveError('Failed to save profile changes. Please try again.');
      toast.error('Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <PageTitle
        title="Account Profile & Settings"
        description="Manage your platform identity, contact credentials, and personal inclusion preferences."
        action={
          <VoiceGuidanceButton
            textToRead="Account Profile and Settings. Manage your platform identity, contact credentials, and personal inclusion preferences aligned with UN Sustainable Development Goals."
            label="Audio Summary"
          />
        }
      />

      {isSaved && (
        <div
          role="status"
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #bbf7d0',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Profile settings successfully saved!</span>
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--color-error-light)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #fecaca',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Profile Identity Card */}
      <Card padding="lg" variant="glass" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-full)',
              background:
                user.role === 'admin'
                  ? 'var(--gradient-coral)'
                  : user.role === 'mentor'
                  ? 'var(--gradient-accent)'
                  : 'var(--gradient-primary)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 'var(--font-size-2xl)',
              boxShadow: 'var(--shadow-md)',
              fontFamily: "'Plus Jakarta Sans', var(--font-family)",
            }}
          >
            {user.full_name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
                {user.full_name}
              </h2>
              <Badge variant={user.role === 'admin' ? 'coral' : user.role === 'mentor' ? 'accent' : 'primary'} size="sm" hasDot>
                {user.role}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
              {user.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-gray-400)', marginTop: '4px' }}>
              <MapPin size={12} /> {location || 'Location not set'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <Input
              label="Full Name"
              value={user.full_name}
              disabled
              leftIcon={<User size={16} />}
              helperText="Verified name registered on account."
            />

            <Input
              label="Email Address"
              value={user.email}
              disabled
              leftIcon={<Mail size={16} />}
              helperText="Primary email used for system communication."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              leftIcon={<Phone size={16} />}
              helperText="Optional phone for mentorship coordination."
            />

            <Input
              label="City / Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyderabad, India"
              leftIcon={<MapPin size={16} />}
              helperText="Used to recommend localized opportunities."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              <Save size={16} /> Save Profile Updates
            </Button>
          </div>
        </form>
      </Card>

      {/* Social Impact & SDG Status Card */}
      <Card padding="md" variant="subtle">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <Award size={18} style={{ color: 'var(--color-primary-600)' }} />
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
            UN Sustainable Goals Alignment
          </h3>
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
          By engaging in skill benchmarking, mentorship, and safe reporting, your participation directly supports <strong>UN SDG 5 (Gender Equality)</strong> and <strong>UN SDG 8 (Decent Work & Economic Growth)</strong>.
        </p>
      </Card>
    </div>
  );
};
