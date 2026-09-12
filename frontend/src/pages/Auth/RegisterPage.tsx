import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { RoleEnum } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleEnum>('mentee');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [expertiseArea, setExpertiseArea] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        phone: phone || undefined,
        location: location || undefined,
        expertise_area: role === 'mentor' ? expertiseArea : undefined,
        bio: role === 'mentor' ? bio : undefined,
      });
      navigate('/dashboard');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
        Join WEIS
      </h2>
      <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
        Create your profile to start assessing skills, learning, or mentoring.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-error-light)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Full Name *"
          placeholder="e.g. Amina Rao"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. amina@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password *"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Select
          label="I want to join as: *"
          value={role}
          onChange={(e) => setRole(e.target.value as RoleEnum)}
          options={[
            { value: 'mentee', label: 'Mentee (Looking to upskill and find mentors)' },
            { value: 'mentor', label: 'Mentor (Experienced leader wanting to guide others)' },
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Input
            label="Phone (Optional)"
            placeholder="+91..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Location (Optional)"
            placeholder="e.g. Bengaluru, India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Conditional fields if registering as Mentor */}
        {role === 'mentor' && (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
              MENTOR PROFILE DETAILS
            </span>
            <Input
              label="Area of Expertise *"
              placeholder="e.g. Data Science & Career Transition"
              value={expertiseArea}
              onChange={(e) => setExpertiseArea(e.target.value)}
              required
            />
            <Textarea
              label="Short Bio / Professional Background *"
              placeholder="Briefly describe your experience and mentoring philosophy..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
            <p style={{ fontSize: '11px', color: 'var(--color-gray-600)' }}>
              Note: Mentor profiles undergo a quick verification review by our team before public listing.
            </p>
          </div>
        )}

        <Button type="submit" variant="primary" isLoading={isLoading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
          Create Account
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 'bold' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};
