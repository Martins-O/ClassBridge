'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { buttonClasses } from '@/components/ui/Button';

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
    <AuthLayout
      title="Sign in"
      subtitle="Access your ClassBridge workspace."
      helper={
        <span>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-600 underline">
            Create one
          </Link>
        </span>
      }
      badge="Leadership access"
    >
      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-ink-600">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
            placeholder="name@school.edu"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-ink-600">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-brand-600">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={loading} className={buttonClasses({ variant: 'primary', size: 'lg', className: 'w-full justify-center' })}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
