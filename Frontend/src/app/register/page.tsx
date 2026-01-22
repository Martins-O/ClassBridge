'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Unable to create account');
        return;
      }

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      router.push(loginResponse.ok ? '/dashboard' : '/login');
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
            Start Your Journey with ClassBridge
          </h2>

          <p className="auth-split__subtitle">
            Join hundreds of schools using ClassBridge to streamline operations, track student progress, and improve educational outcomes.
          </p>

          <div className="auth-split__features">
            <div className="feature-point">
              <div className="feature-point__icon">🚀</div>
              <div>
                <h3>Quick Setup</h3>
                <p>Get started in minutes, not hours</p>
              </div>
            </div>
            <div className="feature-point">
              <div className="feature-point__icon">👥</div>
              <div>
                <h3>Team Collaboration</h3>
                <p>Invite mentors and staff easily</p>
              </div>
            </div>
            <div className="feature-point">
              <div className="feature-point__icon">📈</div>
              <div>
                <h3>Track Progress</h3>
                <p>Monitor student performance in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-split__right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Create Account</h1>
            <p>Start managing your school with ClassBridge</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert--error">
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                required
                name="name"
                type="text"
                placeholder="John Smith"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Work Email</label>
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
                minLength={6}
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <p>
              Already have an account?{' '}
              <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
