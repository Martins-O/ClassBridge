'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DarkLayout } from '@/components/ui/DarkLayout';
import { Card, CardContent, CardHeader, GlowCard } from '@/components/ui/Card';
import { LoadingButton } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords must match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to create account');
        return;
      }

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      router.push(loginResponse.ok ? '/dashboard' : '/login');
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DarkLayout className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-auto p-6">
        <GlowCard neonBorder="purple" className="p-8">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-accent-secondary to-accent-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-background-primary">
                <defs>
                  <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#00FF88" />
                  </linearGradient>
                </defs>
                <path d="M4 22 Q12 15, 20 17 Q28 19, 36 22 L36 25 Q28 22, 20 20 Q12 18, 4 25 Z" fill="url(#bridgeGradient)" />
                <rect x="3" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
                <rect x="35" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
                <rect x="19" y="17" width="2" height="13" fill="url(#bridgeGradient)" rx="1" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Join <span className="text-accent-secondary neon-text">ClassBridge</span>
            </h1>
            <p className="text-text-muted font-mono">Set up your educational workspace.</p>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-accent-secondary/10 border border-accent-secondary/20 rounded-full">
              <div className="w-2 h-2 bg-accent-secondary rounded-full animate-glow-pulse"></div>
              <span className="text-xs font-mono text-accent-secondary">Start Collaborating</span>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Card className="mb-6 p-4 bg-accent-danger/5 border-accent-danger/20">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-accent-danger font-mono">{error}</span>
                </div>
              </Card>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Full name"
                type="text"
                name="name"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jordan Garcia"
                variant="neon"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                label="Work email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@institution.edu"
                variant="neon"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordInput
                  label="Password"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  variant="neon"
                  helperText="At least 6 characters"
                />
                <PasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  variant="neon"
                />
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                variant="primary"
                size="lg"
                glow
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </LoadingButton>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border-primary text-center">
              <p className="text-sm text-text-muted font-mono">
                Already joined?{' '}
                <Link
                  href="/login"
                  className="text-accent-secondary hover:text-accent-secondary/80 transition-colors font-semibold"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </CardContent>
        </GlowCard>

        {/* Terminal-style help */}
        <Card variant="terminal" className="mt-6 p-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neon-green">$</span>
            <span className="text-neon-green/80">Need help? Run:</span>
            <code className="text-neon-cyan">support --register</code>
          </div>
        </Card>
      </div>
    </DarkLayout>
  );
}
