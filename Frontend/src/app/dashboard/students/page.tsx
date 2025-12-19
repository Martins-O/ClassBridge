'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentInviteModal from '../components/StudentInviteModal';
import SearchBar from '../components/SearchBar';

interface Student {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export default function StudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/users?role=student');
            const data = await response.json();

            if (response.ok) {
                setStudents(data.users || []);
            } else {
                setError(data.error || 'Failed to load students');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Student Management</p>
                    <h1>Students</h1>
                    <p className="dashboard__muted">Browse and manage enrolled students</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--primary" onClick={() => setShowInviteModal(true)}>
                        Invite Student
                    </button>
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                </div>
            </section>

            {loading ? (
                <div className="dashboard__card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <p className="eyebrow">Syncing data...</p>
                    <h2>Loading students...</h2>
                </div>
            ) : error ? (
                <div className="dashboard__card">
                    <p className="alert alert--error">{error}</p>
                    <button className="btn btn--primary u-margin-top-md" onClick={fetchStudents}>
                        Retry loading
                    </button>
                </div>
            ) : (
                <>
                    {students.length > 0 && (
                        <section className="dashboard__search">
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search students by name or email..."
                            />
                        </section>
                    )}

                    <section className="dashboard__grid">
                        <div className="dashboard__card">
                            {students.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="eyebrow">No students found</p>
                                    <h2>Get started by inviting your first student</h2>
                                    <p className="u-margin-top-sm u-margin-bottom-md">
                                        Invite students to join your classes via email.
                                    </p>
                                    <button className="btn btn--primary" onClick={() => setShowInviteModal(true)}>
                                        Invite Student
                                    </button>
                                </div>
                            ) : (
                                <div className="table">
                                    <div className="table__head">
                                        <span>Name</span>
                                        <span>Email</span>
                                        <span>Joined</span>
                                        <span>Status</span>
                                        <span>Actions</span>
                                    </div>
                                    {filteredStudents.length === 0 ? (
                                        <div className="table__empty">
                                            <p>No students match your search.</p>
                                        </div>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <div key={student._id} className="table__row">
                                                <span><strong>{student.name}</strong></span>
                                                <span>{student.email}</span>
                                                <span>{new Date(student.createdAt).toLocaleDateString()}</span>
                                                <span>
                                                    <span className={`badge badge--${student.isActive ? 'active' : 'inactive'}`}>
                                                        {student.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </span>
                                                <span>
                                                    <button
                                                        className="btn btn--ghost btn--sm"
                                                        onClick={() => router.push(`/dashboard/students/${student._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

            <StudentInviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onSuccess={fetchStudents}
            />
        </main>
    );
}
