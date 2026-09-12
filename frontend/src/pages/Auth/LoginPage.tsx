import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill for testing different user journeys
  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError(null);
  };

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
        Welcome back
      </h2>
      <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
        Sign in to your WEIS account to continue your career journey.
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
          label="Email address"
          type="email"
          placeholder="e.g. amina@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" isLoading={isLoading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
          Sign In
        </Button>
      </form>

      {/* Demo Quick Fill buttons */}
      <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px dashed var(--color-gray-200)' }}>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
          Quick Demo Accounts:
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
          <Button size="sm" variant="outline" onClick={() => handleQuickFill('amina@example.com')}>
            Mentee
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleQuickFill('sunita.sharma@example.com')}>
            Mentor
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleQuickFill('admin@weis.org')}>
            Admin
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
        Don't have an account yet?{' '}
        <Link to="/register" style={{ fontWeight: 'bold' }}>
          Create an account
        </Link>
      </div>
    </div>
  );
};
