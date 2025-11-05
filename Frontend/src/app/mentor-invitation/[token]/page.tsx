'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { buttonClasses } from '@/components/ui/Button';

interface InvitationData {
  _id: string;
  email: string;
  name: string;
  schoolName: string;
  inviterName: string;
  expiresAt: string;
  status: string;
}

export default function MentorInvitation() {
  const params = useParams();
  const router = useRouter();
  const { pushToast } = useToast();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    if (params.token) {
      void fetchInvitation(params.token as string);
    }
  }, [params.token]);

  const fetchInvitation = async (token: string) => {
    try {
      const response = await fetch(`/api/mentors/accept-invitation/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid or expired invitation');
        return;
      }
      const data = await response.json();
      setInvitation(data.invitation);
    } catch {
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setAccepting(true);
    try {
      const response = await fetch(`/api/mentors/accept-invitation/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to accept invitation');
        return;
      }

      pushToast({
        title: 'Welcome to ClassBridge!',
        description: 'Your mentor workspace is ready.',
        intent: 'success',
      });
      router.push('/login');
    } catch {
      setError('An error occurred while accepting the invitation');
      pushToast({ title: 'Failed to accept invitation', intent: 'danger' });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
          <p className="mt-4 text-sm text-ink-500">Loading invitation details…</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white p-10 text-center shadow-soft">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ink-900">Invitation unavailable</h1>
          <p className="mt-2 text-sm text-ink-500">{error}</p>
          <Link href="/" className={buttonClasses({ variant: 'primary', size: 'md' }) + ' mt-6 inline-flex'}>
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-white/40 bg-white p-10 shadow-glass">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-emerald/15 text-accent-emerald">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-ink-900">Welcome to ClassBridge</h1>
          <p className="mt-2 text-sm text-ink-500">Create your credentials to activate your mentor workspace.</p>
        </div>

        {invitation && (
          <div className="mt-8 rounded-2xl border border-white/40 bg-surface-subtle px-6 py-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Invitation details</h3>
            <dl className="mt-4 space-y-2 text-sm text-ink-600">
              <div className="flex justify-between">
                <dt>School</dt>
                <dd className="font-medium text-ink-800">{invitation.schoolName}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Invited by</dt>
                <dd className="font-medium text-ink-800">{invitation.inviterName}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Email</dt>
                <dd className="font-medium text-ink-800">{invitation.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Expires</dt>
                <dd className="font-medium text-ink-800">{new Date(invitation.expiresAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-600">Create password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-white/40 bg-white px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={formData.password}
              onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-600">Confirm password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-white/40 bg-white px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={formData.confirmPassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              required
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={accepting} className={buttonClasses({ variant: 'primary', size: 'lg', className: 'w-full justify-center' })}>
            {accepting ? 'Creating account…' : 'Accept invitation'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Need help? <Link href="/" className="text-brand-600 underline">Contact support</Link>
        </p>
      </div>
    </div>
  );
}
