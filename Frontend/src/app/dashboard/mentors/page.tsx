'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MentorInviteModal from './components/MentorInviteModal';
import SearchBar from '../components/SearchBar';

interface Mentor {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    assignedClasses: Array<{ _id: string; name: string }>;
}

export default function MentorsPage() {
    const router = useRouter();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [schoolId, setSchoolId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUserAndMentors();
    }, []);

    const fetchUserAndMentors = async () => {
        try {
            // Get user's school ID
            const userResponse = await fetch('/api/auth/me');
            const userData = await userResponse.json();

            if (!userResponse.ok || !userData.user?.schoolId) {
                setError('Unable to determine your school');
                setLoading(false);
                return;
            }

            setSchoolId(userData.user.schoolId);

            // Fetch mentors
            const response = await fetch(`/api/mentors?schoolId=${userData.user.schoolId}`);
            const data = await response.json();

            if (response.ok) {
                setMentors(data.mentors || []);
            } else {
                setError(data.error || 'Failed to load mentors');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredMentors = mentors.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading mentors…</div>
            </main>
        );
    }

    if (error) {
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
                    <p className="eyebrow">Mentor Management</p>
                    <h1>Mentors</h1>
                    <p className="dashboard__muted">Manage your school's teaching staff</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    <button className="btn btn--primary" onClick={() => setShowInviteModal(true)}>
                        Invite Mentor
                    </button>
                </div>
            </section>

            {mentors.length > 0 && (
                <section className="dashboard__search">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search mentors by name or email..."
                    />
                </section>
            )}

            <section className="dashboard__grid">
                {mentors.length === 0 ? (
                    <div className="dashboard__card">
                        <p className="eyebrow">No mentors yet</p>
                        <h2>Get started by inviting your first mentor</h2>
                        <p>Mentors guide students and manage classes in your school.</p>
                        <button className="btn btn--primary" onClick={() => setShowInviteModal(true)}>
                            Invite your first mentor
                        </button>
                    </div>
                ) : (
                    <div className="dashboard__card">
                        <div className="table">
                            <div className="table__head">
                                <span>Name</span>
                                <span>Email</span>
                                <span>Assigned Classes</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            {filteredMentors.length === 0 ? (
                                <div className="table__empty">
                                    <p>No mentors match your search.</p>
                                </div>
                            ) : (
                                filteredMentors.map((mentor) => (
                                    <div key={mentor._id} className="table__row">
                                        <span><strong>{mentor.name}</strong></span>
                                        <span>{mentor.email}</span>
                                        <span>
                                            {mentor.assignedClasses.length === 0 ? (
                                                <span className="dashboard__muted">No classes</span>
                                            ) : (
                                                <span>{mentor.assignedClasses.length} classes</span>
                                            )}
                                        </span>
                                        <span>
                                            <span className={`badge badge--${mentor.isActive ? 'active' : 'inactive'}`}>
                                                {mentor.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </span>
                                        <span>
                                            <button
                                                className="btn btn--ghost btn--sm"
                                                onClick={() => router.push(`/dashboard/mentors/${mentor._id}`)}
                                            >
                                                View
                                            </button>
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </section>

            <MentorInviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onSuccess={fetchUserAndMentors}
                schoolId={schoolId}
            />
        </main>
    );
}
