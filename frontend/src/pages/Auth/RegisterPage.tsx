import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { RoleEnum } from '../../types';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('Registration failed. Please try again with valid information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            color: 'var(--color-gray-900)',
            fontFamily: "'Plus Jakarta Sans', var(--font-family)",
            letterSpacing: '-0.025em',
            marginBottom: 'var(--space-1)',
          }}
        >
          Create Your Account
        </h2>
        <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)' }}>
          Join the WEIS community for personalized growth, mentorship, and inclusion.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-error-light)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #fecaca',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection Toggle Cards */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <label
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-gray-700)',
            display: 'block',
            marginBottom: 'var(--space-2)',
          }}
        >
          I am joining as a:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={() => setRole('mentee')}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${role === 'mentee' ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
              backgroundColor: role === 'mentee' ? 'var(--color-primary-50)' : 'var(--color-white)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              textAlign: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            <GraduationCap
              size={22}
              style={{ color: role === 'mentee' ? 'var(--color-primary-600)' : 'var(--color-gray-400)' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Mentee / Learner
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', lineHeight: 1.2 }}>
              Upskill & find mentors
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('mentor')}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${role === 'mentor' ? 'var(--color-accent-500)' : 'var(--color-gray-200)'}`,
              backgroundColor: role === 'mentor' ? 'var(--color-accent-50)' : 'var(--color-white)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              textAlign: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            <HeartHandshake
              size={22}
              style={{ color: role === 'mentor' ? 'var(--color-accent-600)' : 'var(--color-gray-400)' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Industry Mentor
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', lineHeight: 1.2 }}>
              Guide women in tech
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Full Name *"
          placeholder="e.g. Amina Rao"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User size={18} />}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. amina@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={18} />}
          required
        />

        <Input
          label="Password *"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={18} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-gray-400)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          helperText="Minimum 6 characters. Passwords are encrypted with bcrypt."
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone size={16} />}
          />

          <Input
            label="City / Region"
            placeholder="e.g. Hyderabad"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin size={16} />}
          />
        </div>

        {/* Mentor Specific Onboarding Fields */}
        {role === 'mentor' && (
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-accent-50)',
              border: '1px solid var(--color-accent-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--color-accent-600)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent-700)' }}>
                Mentor Profile Credentials
              </span>
            </div>

            <Input
              label="Primary Expertise Area *"
              placeholder="e.g. Full Stack Engineering, AI, Product Leadership"
              value={expertiseArea}
              onChange={(e) => setExpertiseArea(e.target.value)}
              leftIcon={<Briefcase size={16} />}
              required={role === 'mentor'}
            />

            <Textarea
              label="Professional Bio & Mentorship Philosophy"
              placeholder="Describe your background and how you aim to support mentees..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          isLoading={isLoading}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          Complete Registration →
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
        <span style={{ color: 'var(--color-gray-500)' }}>Already have an account? </span>
        <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};
