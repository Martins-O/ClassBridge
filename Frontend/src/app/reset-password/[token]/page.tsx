'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Input } from '@/components/ui/Input';
import { buttonClasses } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/password-reset/${token}`);
        if (!response.ok) {
          setTokenError('This reset link is invalid or has expired.');
        }
      } catch {
        setTokenError('Unable to verify reset link. Please request a new one.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    void verifyToken();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords must match.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const response = await fetch(`/api/auth/password-reset/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormError(payload.error ?? 'Unable to reset password.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create a new password"
      subtitle="Choose a strong password to secure your ClassBridge account."
      helper={
        <span>
          Remembered it?{' '}
          <button
            type="button"
            className="text-accent-primary underline decoration-accent-primary/50 hover:decoration-accent-primary"
            onClick={() => router.push('/login')}
          >
            Return to sign in
          </button>
        </span>
      }
      badge="Account recovery"
    >
      {loading ? (
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border-primary border-t-semantic-primary-500" />
        </div>
      ) : tokenError && !success ? (
        <div className="rounded-lg border border-semantic-danger-500/40 bg-semantic-danger-muted px-4 py-3 text-sm text-semantic-danger-500">
          {tokenError}
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            type="password"
            name="password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (formError) setFormError('');
            }}
            label="New password"
            placeholder="Minimum 6 characters"
            variant="neon"
          />

          <Input
            type="password"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (formError) setFormError('');
            }}
            label="Confirm new password"
            placeholder="Re-enter your new password"
            variant="neon"
          />

          {formError ? (
            <p className="rounded-lg border border-semantic-danger-500/40 bg-semantic-danger-muted px-4 py-3 text-sm text-semantic-danger-500">
              {formError}
            </p>
          ) : null}

          {success ? (
            <div className="rounded-lg border border-semantic-success-500/30 bg-semantic-success-muted px-4 py-3 text-sm text-semantic-success-DEFAULT">
              Password updated. Redirecting to sign in…
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || success}
            className={buttonClasses({ variant: 'primary', size: 'lg', glow: true, className: 'w-full justify-center' })}
          >
            {submitting ? 'Updating password…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
