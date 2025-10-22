'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { buttonClasses } from '@/components/ui/Button';

interface InvitationDetails {
  email: string;
  name: string;
  school: {
    name: string;
    id: string;
  };
  class: {
    name: string;
    id: string;
    subject?: string;
    grade?: string;
  };
  inviter: {
    name: string;
    role: string;
  };
  expiresAt: string;
  createdAt: string;
}

export default function StudentInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { pushToast } = useToast();

  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await fetch(`/api/students/invitation/${token}`);
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load invitation details');
          return;
        }
        const data = await response.json();
        setInvitationDetails(data.invitation);
      } catch {
        setError('An error occurred while loading the invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [token]);

  const handleAcceptInvitation = async (event: React.FormEvent) => {
    event.preventDefault();
    setAcceptError('');

    if (password.length < 6) {
      setAcceptError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setAcceptError('Passwords do not match');
      return;
    }

    setIsAccepting(true);
    try {
      const response = await fetch('/api/students/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAcceptError(errorData.error || 'Failed to accept invitation');
        return;
      }

      pushToast({ title: 'Welcome aboard!', description: 'Your student account is ready.', intent: 'success' });
      router.push('/login');
    } catch {
      setAcceptError('An error occurred while accepting the invitation');
    } finally {
      setIsAccepting(false);
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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-brand-100 bg-white p-10 text-center shadow-soft">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-ink-900">Invitation unavailable</h2>
          <p className="mt-2 text-sm text-ink-500">{error}</p>
          <Link href="/" className={buttonClasses({ variant: 'primary', size: 'md' }) + ' mt-6 inline-flex'}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-brand-100 bg-white p-10 shadow-glass">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-emerald/15 text-accent-emerald">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 0v4m0-4h4m-4 0H8m-2 7h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 012-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-ink-900">Join your ClassBridge community</h1>
          <p className="mt-2 text-sm text-ink-500">Set a password to activate your student account and access course materials instantly.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-surface-subtle px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Invitation summary</h3>
          <dl className="mt-4 space-y-2 text-sm text-ink-600">
            <div className="flex justify-between">
              <dt>School</dt>
              <dd className="font-medium text-ink-800">{invitationDetails?.school.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Class</dt>
              <dd className="font-medium text-ink-800">{invitationDetails?.class.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Invited by</dt>
              <dd className="font-medium text-ink-800">{invitationDetails?.inviter.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Expires</dt>
              <dd className="font-medium text-ink-800">{new Date(invitationDetails?.expiresAt ?? '').toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleAcceptInvitation}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-600">Create password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-600">Confirm password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-700 shadow-inset focus:border-brand-300 focus:outline-none"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          {acceptError ? <p className="text-sm text-danger">{acceptError}</p> : null}
          <button type="submit" disabled={isAccepting} className={buttonClasses({ variant: 'primary', size: 'lg', className: 'w-full justify-center' })}>
            {isAccepting ? 'Creating account…' : 'Accept invitation'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Need support? <Link href="/" className="text-brand-600 underline">Contact the help desk</Link>
        </p>
      </div>
    </div>
  );
}
