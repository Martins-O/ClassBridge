'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { buttonClasses } from '@/components/ui/Button';

export default function RegisterSchoolPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        setError('Please sign in before registering a school.');
        setLoading(false);
        return;
      }
      const userData = await userResponse.json();

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, adminId: userData.user.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to register school.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Register your institution"
      subtitle="Provide school details so ClassBridge can tailor the experience to your programmes."
      helper={
        <span>
          Need to manage your account?{' '}
          <Link href="/dashboard" className="text-brand-600 underline">
            Return to dashboard
          </Link>
        </span>
      }
      badge="Institution onboarding"
    >
      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-ink-600">
              School name
            </label>
            <input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
              placeholder="Springfield Academy"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-ink-600">
              Contact email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
              placeholder="admin@school.edu"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-ink-600">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium text-ink-600">
              Website
            </label>
            <input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
              placeholder="https://school.edu"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium text-ink-600">
            Address
          </label>
          <input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
            placeholder="123 Learning Ave, Springfield"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-ink-600">
            About your institution
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-800 shadow-inset focus:border-brand-300 focus:outline-none"
            placeholder="Describe your programmes, cohorts, or strategic goals."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={buttonClasses({ variant: 'primary', size: 'lg', className: 'w-full justify-center' })}
        >
          {loading ? 'Submitting…' : 'Register school'}
        </button>
      </form>
    </AuthLayout>
  );
}
