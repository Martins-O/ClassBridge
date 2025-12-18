'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function StudentInvitationPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter();
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const unwrapParams = async () => {
            const unwrapped = await params;
            setToken(unwrapped.token);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!token) return;

        const fetchInvitation = async () => {
            try {
                const response = await fetch(`/api/students/invitation/${token}`);
                const data = await response.json();

                if (response.ok && data.invitation) {
                    setInvitation(data.invitation);
                } else if (response.status === 410) {
                    setError('This invitation has expired or has already been accepted.');
                } else {
                    setError(data.error || 'Invalid invitation link.');
                }
            } catch {
                setError('Failed to load invitation. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/students/accept-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Auto-login after account creation
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: invitation?.email,
                        password,
                    }),
                });

                if (loginResponse.ok) {
                    setTimeout(() => router.push('/dashboard'), 1500);
                } else {
                    setTimeout(() => router.push('/login'), 2000);
                }
            } else {
                setError(data.error || 'Failed to accept invitation. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="auth-shell">
                <div className="auth-card">
                    <p className="eyebrow">Student Invitation</p>
                    <h1>Loading invitation…</h1>
                </div>
            </main>
        );
    }

    if (error && !invitation) {
        return (
            <main className="auth-shell">
                <div className="auth-card">
                    <p className="eyebrow">Student Invitation</p>
                    <h1>Invalid Invitation</h1>
                    <p className="auth-card__error">{error}</p>
                    <p>This invitation link may have expired, been used, or is invalid.</p>
                    <div className="form-actions">
                        <button className="btn btn--primary" onClick={() => router.push('/')}>
                            Go to home
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (success) {
        return (
            <main className="auth-shell">
                <div className="auth-card">
                    <p className="eyebrow">Welcome to ClassBridge!</p>
                    <h1>Account Created Successfully</h1>
                    <p className="auth-card__success">
                        Your student account has been created. Logging you in…
                    </p>
                </div>
            </main>
        );
    }

    const expiresAt = invitation ? new Date(invitation.expiresAt) : null;
    const isExpiringSoon = expiresAt && expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;

    return (
        <main className="auth-shell">
            <div className="auth-card">
                <p className="eyebrow">Student Invitation</p>
                <h1>Join {invitation?.school.name}</h1>
                <p>You've been invited to join ClassBridge as a student!</p>

                {invitation && (
                    <div className="invitation-details">
                        <div className="invitation-details__item">
                            <span className="invitation-details__label">School</span>
                            <strong>{invitation.school.name}</strong>
                        </div>
                        <div className="invitation-details__item">
                            <span className="invitation-details__label">Class</span>
                            <strong>
                                {invitation.class.name}
                                {invitation.class.subject && ` • ${invitation.class.subject}`}
                                {invitation.class.grade && ` • Grade ${invitation.class.grade}`}
                            </strong>
                        </div>
                        <div className="invitation-details__item">
                            <span className="invitation-details__label">Invited by</span>
                            <strong>{invitation.inviter.name}</strong>
                        </div>
                        <div className="invitation-details__item">
                            <span className="invitation-details__label">Your email</span>
                            <strong>{invitation.email}</strong>
                        </div>
                        {isExpiringSoon && (
                            <p className="invitation-details__warning">
                                ⚠️ This invitation expires on {expiresAt?.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {error && <p className="auth-card__error">{error}</p>}

                    <p className="form-section-title">Create your password</p>

                    <label className="field">
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                            disabled={submitting}
                        />
                    </label>

                    <label className="field">
                        <span>Confirm Password</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            minLength={6}
                            disabled={submitting}
                        />
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="btn btn--primary" disabled={submitting}>
                            {submitting ? 'Creating account…' : 'Accept Invitation & Join Class'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
