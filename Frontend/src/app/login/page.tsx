'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Unable to sign in');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left Side - Platform Info */}
      <div className="auth-split__left">
        <div className="auth-split__bg">
          <div className="auth-split__bg-gradient"></div>
          <div className="floating-elements">
            <div className="float-item float-item--1">📚</div>
            <div className="float-item float-item--2">🎓</div>
            <div className="float-item float-item--3">✨</div>
            <div className="float-item float-item--4">📊</div>
          </div>
        </div>

        <div className="auth-split__content">
          <Link href="/" className="auth-split__logo">
            <span>🎓</span>
            <span>ClassBridge</span>
          </Link>

          <h2 className="auth-split__title">
            Welcome Back to ClassBridge
          </h2>

          <p className="auth-split__subtitle">
            Access your school dashboard and continue managing classes, students, and assessments all in one place.
          </p>

          <div className="auth-split__features">
            <div className="feature-point">
              <div className="feature-point__icon">⚡</div>
              <div>
                <h3>Quick Access</h3>
                <p>Jump right back into your workflow</p>
              </div>
            </div>
            <div className="feature-point">
              <div className="feature-point__icon">🔒</div>
              <div>
                <h3>Secure Login</h3>
                <p>Your data is encrypted and protected</p>
              </div>
            </div>
            <div className="feature-point">
              <div className="feature-point__icon">📱</div>
              <div>
                <h3>Access Anywhere</h3>
                <p>Work from any device, anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-split__right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert--error">
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                required
                name="email"
                type="email"
                placeholder="you@school.edu"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                required
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button
              className="auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <p>
              Don't have an account?{' '}
              <Link href="/register">Create one now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
