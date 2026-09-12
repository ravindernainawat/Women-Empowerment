import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <PageTitle
        title="My User Profile"
        description="Manage your platform identity, contact preferences, and public bio settings."
      />

      {isSaved && (
        <div
          role="status"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bbf7d0',
            marginBottom: 'var(--space-4)',
          }}
        >
          ✓ Profile settings saved successfully!
        </div>
      )}

      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-gray-200)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-500)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 'var(--font-size-2xl)',
            }}
          >
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)' }}>
              {user.full_name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                {user.email}
              </span>
              <Badge variant={user.role === 'admin' ? 'accent' : 'primary'} size="sm">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Full Legal Name"
            value={user.full_name}
            disabled
            helperText="To change your legal name, contact administration."
          />

          <Input
            label="Email Address"
            value={user.email}
            disabled
            helperText="Primary email used for account access."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
            />
            <Input
              label="City / Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, India"
            />
          </div>

          {user.role === 'mentor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Input
                label="Mentorship Focus / Expertise"
                defaultValue="Data Science & Tech Leadership"
              />
              <Textarea
                label="Public Mentor Bio"
                rows={4}
                defaultValue="15+ years experience supporting women returning to tech careers."
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
