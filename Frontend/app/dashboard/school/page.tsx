'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type SchoolProfile = {
  id: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  description?: string | null;
  subscriptionType?: string | null;
};

type UserResponse = {
  user: {
    role: string;
    school: SchoolProfile | null;
  };
};

const EMPTY_PROFILE: Required<Omit<SchoolProfile, 'id'>> = {
  name: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  description: '',
  subscriptionType: '',
};

const subscriptionOptions = ['trial', 'standard', 'enterprise'];

export default function SchoolProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch('/api/auth/me', { signal: controller.signal });
        if (!response.ok) {
          setError('You must be signed in as a school admin to edit the profile.');
          return;
        }
        const data: UserResponse = await response.json();
        if (data.user.role !== 'school_admin') {
          setError('Only school administrators can manage this profile.');
          return;
        }
        if (!data.user.school || !data.user.school.id) {
          setError('No school is linked to this account yet. Please contact support.');
          return;
        }
        setSchoolId(data.user.school.id);
        setProfile({
          name: data.user.school.name ?? '',
          email: data.user.school.email ?? '',
          phone: data.user.school.phone ?? '',
          address: data.user.school.address ?? '',
          website: data.user.school.website ?? '',
          description: data.user.school.description ?? '',
          subscriptionType: data.user.school.subscriptionType ?? '',
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load school profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!schoolId) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Unable to update school profile.');
        return;
      }
      setSuccess('School profile updated successfully.');
    } catch {
      setError('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-shell">
        <div className="profile-card">Loading school profile…</div>
      </main>
    );
  }

  if (error || !schoolId) {
    return (
      <main className="profile-shell">
        <div className="profile-card">
          <p>{error || 'School profile unavailable.'}</p>
          <button className="btn btn--primary" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-shell">
      <form className="profile-card" onSubmit={handleSubmit}>
        <p className="eyebrow">School profile</p>
        <h1>Set up your school</h1>
        <p className="dashboard__muted">
          Families and mentors will see this information on invites and transcripts.
        </p>

        {success ? <p className="alert alert--success">{success}</p> : null}
        {error ? <p className="alert alert--error">{error}</p> : null}

        <div className="form-grid">
          <label className="field">
            <span>School name</span>
            <input name="name" required value={profile.name} onChange={handleChange} placeholder="ClassBridge Academy" />
          </label>
          <label className="field">
            <span>School email</span>
            <input name="email" type="email" required value={profile.email} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input name="phone" value={profile.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" />
          </label>
          <label className="field">
            <span>Website</span>
            <input name="website" value={profile.website} onChange={handleChange} placeholder="https://" />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>Address</span>
            <input name="address" value={profile.address} onChange={handleChange} placeholder="123 Learning Way" />
          </label>
          <label className="field">
            <span>Subscription</span>
            <select name="subscriptionType" value={profile.subscriptionType} onChange={handleChange}>
              <option value="">Select plan</option>
              {subscriptionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>About your school</span>
          <textarea
            name="description"
            rows={4}
            value={profile.description}
            onChange={handleChange}
            placeholder="Share your mission, programs, or notes for families."
          />
        </label>

        <div className="form-actions">
          <button className="btn btn--ghost" type="button" onClick={() => router.push('/dashboard')}>
            Cancel
          </button>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </main>
  );
}
