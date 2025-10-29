'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Input } from '@/components/ui/Input';
import { buttonClasses } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error ?? 'Unable to start password reset.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your ClassBridge account. We'll send a secure link to create a new password."
      helper={
        <span>
          Remembered it?{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-accent-primary underline decoration-accent-primary/50 hover:decoration-accent-primary"
          >
            Return to sign in
          </button>
        </span>
      }
      badge="Account recovery"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          label="Work email"
          placeholder="you@institution.edu"
          variant="neon"
        />

        {error ? (
          <p className="rounded-lg border border-semantic-danger-500/40 bg-semantic-danger-muted px-4 py-3 text-sm text-semantic-danger-500">
            {error}
          </p>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-semantic-success-500/30 bg-semantic-success-muted px-4 py-3 text-sm text-semantic-success-DEFAULT">
            If an account exists for <strong>{email}</strong>, you&apos;ll receive an email with further instructions.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={buttonClasses({ variant: 'primary', size: 'lg', glow: true, className: 'w-full justify-center' })}
        >
          {loading ? 'Sending reset link…' : 'Send reset link'}
        </button>
      </form>

      <div className="rounded-xl border border-border-primary bg-background-primary/60 px-4 py-4 text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">Security tip</p>
        <p className="mt-1">
          Reset links expire after one hour. If you do not receive an email, check your spam folder or contact your administrator.
        </p>
      </div>
    </AuthLayout>
  );
}
