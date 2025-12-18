'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MentorInvitationDetails {
    _id: string;
    email: string;
    name: string;
    schoolName: string;
    inviterName: string;
    expiresAt: string;
    status: string;
}

export default function MentorInvitationPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter();
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<MentorInvitationDetails | null>(null);
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
                const response = await fetch(`/api/mentors/accept-invitation/${token}`);
                const data = await response.json();

                if (response.ok && data.invitation) {
                    setInvitation(data.invitation);
                } else {
                    setError(data.error || 'Invalid or expired invitation.');
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
            const response = await fetch(`/api/mentors/accept-invitation/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 2500);
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
                    <p className="eyebrow">Mentor Invitation</p>
                    <h1>Loading invitation…</h1>
                </div>
            </main>
        );
    }

    if (error && !invitation) {
        return (
            <main className="auth-shell">
                <div className="auth-card">
                    <p className="eyebrow">Mentor Invitation</p>
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
                    <h1>Mentor Account Created</h1>
                    <p className="auth-card__success">
                        Your mentor account has been created successfully. Redirecting to login…
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
                <p className="eyebrow">Mentor Invitation</p>
                <h1>Join {invitation?.schoolName} as a Mentor</h1>
                <p>You've been invited to become a mentor on ClassBridge!</p>

                {invitation && (
                    <div className="invitation-details">
                        <div className="invitation-details__item">
                            <span className="invitation-details__label">School</span>
                            <strong>{invitation.schoolName}</strong>
                        </div>
                        <div className="invitation-details__item">
                            <span className="invitation-details__label">Role</span>
                            <strong>Mentor</strong>
                        </div>
                        <div className="invitation-details__item">
                            <span className="invitation-details__label">Invited by</span>
                            <strong>{invitation.inviterName}</strong>
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

                <div className="mentor-benefits">
                    <p className="form-section-title">As a mentor, you'll be able to:</p>
                    <ul>
                        <li>Guide and support students in their learning journey</li>
                        <li>Manage classes and track student progress</li>
                        <li>Create and share educational resources</li>
                        <li>Collaborate with other mentors and administrators</li>
                    </ul>
                </div>

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
                            {submitting ? 'Creating account…' : 'Accept Invitation & Become a Mentor'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
