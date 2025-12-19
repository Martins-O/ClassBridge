'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
    schoolId?: {
        name: string;
        _id: string;
    };
    studentId?: string;
    isActive: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const meResponse = await fetch('/api/auth/me');
            const meData = await meResponse.json();

            if (!meResponse.ok || !meData.user?._id) {
                setError('Failed to load profile');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/users/${meData.user._id}`);
            const data = await response.json();

            if (response.ok && data.user) {
                setUser(data.user);
                setName(data.user.name || '');
                setPhone(data.user.phone || '');
                setBio(data.user.bio || '');
                setProfileImage(data.user.profileImage || '');
            } else {
                setError(data.error || 'Failed to load profile');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/users/${user!._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim() || undefined,
                    bio: bio.trim() || undefined,
                    profileImage: profileImage.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setSuccess('Profile updated successfully!');
                setEditing(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Failed to update profile');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setName(user?.name || '');
        setPhone(user?.phone || '');
        setBio(user?.bio || '');
        setProfileImage(user?.profileImage || '');
        setEditing(false);
        setError('');
    };

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading profile…</div>
            </main>
        );
    }

    if (error && !user) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">
                    <p className="auth-card__error">{error}</p>
                    <button className="btn btn--primary" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">User Profile</p>
                    <h1>{user?.name || 'My Profile'}</h1>
                    <p className="dashboard__muted">{user?.email}</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    {!editing && user && (
                        <button className="btn btn--primary" onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card dashboard__card--full">
                    {success && <p className="alert alert--success u-margin-bottom-md">{success}</p>}
                    {error && <p className="alert alert--error u-margin-bottom-md">{error}</p>}

                    {editing ? (
                        <form onSubmit={handleSubmit} className="u-max-width-md">
                            <h2 className="form-section-title">Update Your Information</h2>

                            <label className="field">
                                <span>Display Name *</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    disabled={submitting}
                                />
                            </label>

                            <label className="field">
                                <span>Email Address</span>
                                <input type="email" value={user?.email} disabled style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }} />
                                <small className="dashboard__muted">Contact support to change your primary email.</small>
                            </label>

                            <label className="field">
                                <span>Phone Number</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    disabled={submitting}
                                />
                            </label>

                            <label className="field">
                                <span>Work Bio</span>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself (max 500 characters)"
                                    rows={4}
                                    maxLength={500}
                                    disabled={submitting}
                                />
                                <small className="dashboard__muted" style={{ textAlign: 'right', display: 'block' }}>
                                    {bio.length}/500 characters
                                </small>
                            </label>

                            <label className="field">
                                <span>Profile Image URL</span>
                                <input
                                    type="url"
                                    value={profileImage}
                                    onChange={(e) => setProfileImage(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                    disabled={submitting}
                                />
                            </label>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn--ghost"
                                    onClick={handleCancel}
                                    disabled={submitting}
                                >
                                    Discard Changes
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-item__label">Full Name</span>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{user?.name}</p>
                            </div>

                            <div className="info-item">
                                <span className="info-item__label">Email Address</span>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{user?.email}</p>
                            </div>

                            <div className="info-item">
                                <span className="info-item__label">Access Level</span>
                                <span className="badge badge--active" style={{ width: 'fit-content', marginTop: '0.25rem' }}>
                                    {(user?.role || '').replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            {user?.phone && (
                                <div className="info-item">
                                    <span className="info-item__label">Phone Number</span>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{user.phone}</p>
                                </div>
                            )}

                            {user?.bio && (
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <span className="info-item__label">Biography</span>
                                    <p className="dashboard__muted" style={{ lineHeight: 1.6 }}>{user.bio}</p>
                                </div>
                            )}

                            {user?.schoolId && (
                                <div className="info-item">
                                    <span className="info-item__label">Institution</span>
                                    <strong style={{ display: 'block', marginTop: '0.25rem' }}>{user.schoolId.name}</strong>
                                </div>
                            )}

                            {user?.studentId && (
                                <div className="info-item">
                                    <span className="info-item__label">Academic ID</span>
                                    <strong style={{ display: 'block', marginTop: '0.25rem' }}>{user.studentId}</strong>
                                </div>
                            )}

                            <div className="info-item">
                                <span className="info-item__label">Account Status</span>
                                <span className={`badge badge--${user?.isActive ? 'active' : 'inactive'}`} style={{ width: 'fit-content', marginTop: '0.25rem' }}>
                                    {user?.isActive ? 'Active Member' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
