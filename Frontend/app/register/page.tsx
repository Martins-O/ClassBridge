'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">School workspace</p>
        <h1>Launch your school</h1>
        <p className="auth-card__hint">
          We will help you create the first administrator profile so you can invite mentors, build classes, and share
          assessments.
        </p>

        {error ? <p className="auth-card__error">{error}</p> : null}

        <label className="field">
          <span>Full name</span>
          <input
            required
            name="name"
            type="text"
            placeholder="Jordan Garcia"
            value={form.name}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          <span>Work email</span>
          <input
            required
            name="email"
            type="email"
            placeholder="you@district.edu"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            required
            minLength={6}
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={handleChange}
          />
        </label>

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-card__footer">
          Already registered? <a href="/login">Sign in</a>
        </p>
      </form>
    </main>
  );
}
