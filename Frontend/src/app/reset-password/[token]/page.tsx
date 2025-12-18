'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordResetPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter();
    const [token, setToken] = useState<string>('');
    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
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

        const validateToken = async () => {
            try {
                const response = await fetch(`/api/auth/password-reset/${token}`);
                const data = await response.json();

                if (response.ok && data.valid) {
                    setIsValid(true);
                } else {
                    setError('This password reset link is invalid or has expired.');
                }
            } catch {
                setError('Failed to validate reset link. Please try again.');
            } finally {
                setValidating(false);
            }
        };

        validateToken();
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
            const response = await fetch(`/api/auth/password-reset/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setError(data.error || 'Failed to reset password. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (validating) {
        return (
            <main className="auth-shell">
                <div className="auth-card">
                    <p className="eyebrow">Password Reset</p>
                    <h1>Validating reset link…</h1>
                </div>
            </main>
        );
    }

    if (!isValid) {
        return (
            <main className="auth-shell">
                <div className="auth-card">
                    <p className="eyebrow">Password Reset</p>
                    <h1>Invalid or Expired Link</h1>
                    <p className="auth-card__error">{error}</p>
                    <p>This password reset link may have expired or already been used.</p>
                    <div className="form-actions">
                        <button className="btn btn--primary" onClick={() => router.push('/login')}>
                            Back to login
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
                    <p className="eyebrow">Password Reset</p>
                    <h1>Password Updated!</h1>
                    <p className="auth-card__success">
                        Your password has been successfully reset. Redirecting to login…
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="auth-shell">
            <div className="auth-card">
                <p className="eyebrow">Password Reset</p>
                <h1>Create New Password</h1>
                <p>Enter a new password for your ClassBridge account.</p>

                <form onSubmit={handleSubmit}>
                    {error && <p className="auth-card__error">{error}</p>}

                    <label className="field">
                        <span>New Password</span>
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
                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => router.push('/login')}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={submitting}>
                            {submitting ? 'Resetting…' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
