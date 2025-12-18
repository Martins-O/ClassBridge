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
                    <h1>{user?.name}</h1>
                    <p className="dashboard__muted">{user?.email}</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    {!editing && (
                        <button className="btn btn--primary" onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card">
                    {success && <p className="auth-card__success">{success}</p>}
                    {error && <p className="auth-card__error">{error}</p>}

                    {editing ? (
                        <form onSubmit={handleSubmit}>
                            <p className="form-section-title">Edit Profile</p>

                            <label className="field">
                                <span>Name *</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                            </label>

                            <label className="field">
                                <span>Email</span>
                                <input type="email" value={user?.email} disabled />
                                <small className="dashboard__muted">Email cannot be changed</small>
                            </label>

                            <label className="field">
                                <span>Phone</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Optional"
                                    disabled={submitting}
                                />
                            </label>

                            <label className="field">
                                <span>Bio</span>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself (max 500 characters)"
                                    rows={4}
                                    maxLength={500}
                                    disabled={submitting}
                                />
                                <small className="dashboard__muted">{bio.length}/500 characters</small>
                            </label>

                            <label className="field">
                                <span>Profile Image URL</span>
                                <input
                                    type="url"
                                    value={profileImage}
                                    onChange={(e) => setProfileImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
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
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-item__label">Name</span>
                                <strong>{user?.name}</strong>
                            </div>

                            <div className="info-item">
                                <span className="info-item__label">Email</span>
                                <strong>{user?.email}</strong>
                            </div>

                            <div className="info-item">
                                <span className="info-item__label">Role</span>
                                <strong>{user?.role.replace('_', ' ').toUpperCase()}</strong>
                            </div>

                            {user?.phone && (
                                <div className="info-item">
                                    <span className="info-item__label">Phone</span>
                                    <strong>{user.phone}</strong>
                                </div>
                            )}

                            {user?.bio && (
                                <div className="info-item">
                                    <span className="info-item__label">Bio</span>
                                    <p>{user.bio}</p>
                                </div>
                            )}

                            {user?.schoolId && (
                                <div className="info-item">
                                    <span className="info-item__label">School</span>
                                    <strong>{user.schoolId.name}</strong>
                                </div>
                            )}

                            {user?.studentId && (
                                <div className="info-item">
                                    <span className="info-item__label">Student ID</span>
                                    <strong>{user.studentId}</strong>
                                </div>
                            )}

                            <div className="info-item">
                                <span className="info-item__label">Status</span>
                                <span className={`badge badge--${user?.isActive ? 'active' : 'inactive'}`}>
                                    {user?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
