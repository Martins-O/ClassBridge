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
          // No school linked, allow creation
          setSchoolId(null);
          setLoading(false);
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
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const authMeResponse = await fetch('/api/auth/me');
      const authMeData = await authMeResponse.json();

      if (!authMeResponse.ok || !authMeData.user?._id) {
        setError('Failed to identity user session.');
        setSaving(false);
        return;
      }

      const method = schoolId ? 'PUT' : 'POST';
      const url = schoolId ? `/api/schools/${schoolId}` : '/api/schools';

      // If POST, we need to include adminId
      const payload = schoolId ? profile : { ...profile, adminId: authMeData.user._id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Unable to save school profile.');
        return;
      }

      const result = await response.json();
      if (!schoolId && result.school?.id) {
        setSchoolId(result.school.id);
        setSuccess('School created successfully!');
      } else {
        setSuccess('School profile updated successfully.');
      }
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

  if (error && !schoolId) {
    return (
      <main className="dashboard">
        <section className="dashboard__hero">
          <div>
            <p className="eyebrow">School Management</p>
            <h1>Authorization Required</h1>
          </div>
        </section>
        <section className="dashboard__grid">
          <div className="dashboard__card dashboard__card--full">
            <p className="alert alert--error u-margin-bottom-md">{error}</p>
            <button className="btn btn--primary" onClick={() => router.push('/dashboard')}>
              Back to dashboard
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <section className="dashboard__hero">
        <div>
          <p className="eyebrow">School Management</p>
          <h1>{schoolId ? 'Institution Profile' : 'Setup Your School'}</h1>
          <p className="dashboard__muted">
            {schoolId
              ? 'Configure your school settings and public information.'
              : 'Welcome! Let\'s set up your new school profile to get started.'}
          </p>
        </div>
        <div className="dashboard__hero-actions">
          <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </section>

      <section className="dashboard__grid">
        <form className="dashboard__card dashboard__card--full" onSubmit={handleSubmit}>
          <h2 className="form-section-title">Essential Information</h2>
          <p className="dashboard__muted u-margin-bottom-md">
            This information will be visible to students, families, and mentors on all official communications.
          </p>

          {success && <p className="alert alert--success u-margin-bottom-md">{success}</p>}
          {error && <p className="alert alert--error u-margin-bottom-md">{error}</p>}

          <div className="info-grid">
            <label className="field">
              <span>Institution Name *</span>
              <input name="name" required value={profile.name ?? ''} onChange={handleChange} placeholder="e.g., ClassBridge High" />
            </label>
            <label className="field">
              <span>Contact Email *</span>
              <input name="email" type="email" required value={profile.email ?? ''} onChange={handleChange} placeholder="admin@school.edu" />
            </label>
            <label className="field">
              <span>Phone Number</span>
              <input name="phone" value={profile.phone ?? ''} onChange={handleChange} placeholder="+1 (555) 000-0000" />
            </label>
            <label className="field">
              <span>Official Website</span>
              <input name="website" value={profile.website ?? ''} onChange={handleChange} placeholder="https://www.school.edu" />
            </label>
            <label className="field" style={{ gridColumn: 'span 2' }}>
              <span>Physical Address</span>
              <input name="address" value={profile.address ?? ''} onChange={handleChange} placeholder="123 Education St, City, State" />
            </label>
            <label className="field">
              <span>Service Tier</span>
              <select name="subscriptionType" value={profile.subscriptionType ?? ''} onChange={handleChange}>
                <option value="">Select a plan</option>
                {subscriptionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field u-margin-top-md">
            <span>About the Institution</span>
            <textarea
              name="description"
              rows={4}
              value={profile.description ?? ''}
              onChange={handleChange}
              placeholder="Share your school's mission statement or a brief introduction."
            />
          </label>

          <div className="form-actions">
            <button className="btn btn--ghost" type="button" onClick={() => router.push('/dashboard')}>
              Discard Changes
            </button>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving
                ? (schoolId ? 'Updating...' : 'Creating...')
                : (schoolId ? 'Save Profile' : 'Create School')}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
