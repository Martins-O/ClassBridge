'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DarkLayout } from '@/components/ui/DarkLayout';
import { Card, CardContent, CardHeader, GlowCard } from '@/components/ui/Card';
import { Button, LoadingButton } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to sign in. Please verify your credentials.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DarkLayout className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-auto p-6">
        <GlowCard neonBorder="cyan" className="p-8">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-background-primary">
                <defs>
                  <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="50%" stopColor="#8B5CF6" />
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
              Welcome back to <span className="text-accent-primary neon-text">ClassBridge</span>
            </h1>
            <p className="text-text-muted font-mono">Access your educational workspace.</p>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-accent-primary/10 border border-accent-primary/20 rounded-full">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-glow-pulse"></div>
              <span className="text-xs font-mono text-accent-primary">System Online</span>
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
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@school.edu"
                variant="neon"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-text-primary">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors font-mono"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  name="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
                {loading ? 'Signing in...' : 'Sign in'}
              </LoadingButton>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border-primary text-center">
              <p className="text-sm text-text-muted font-mono">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-accent-primary hover:text-accent-primary/80 transition-colors font-semibold"
                >
                  Create one →
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
            <code className="text-neon-cyan">support --contact</code>
          </div>
        </Card>
      </div>
    </DarkLayout>
  );
}
