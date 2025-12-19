'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Class {
    _id: string;
    name: string;
    description?: string;
    subject?: string;
    grade?: string;
    academicYear: string;
    semester?: string;
    cohort?: string;
    duration?: string;
    mentors: Array<{ _id: string; name: string; email: string }>;
    students: Array<{ _id: string; name: string; email: string; studentId: string }>;
    maxStudents?: number;
    isActive?: boolean;
}

export default function ClassesPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes');
            const data = await response.json();

            if (response.ok) {
                setClasses(data.classes || []);
                setFilteredClasses(data.classes || []);
            } else {
                setError(data.error || 'Failed to load classes');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredClasses(classes);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredClasses(
                classes.filter(cls =>
                    cls.name.toLowerCase().includes(query) ||
                    cls.subject?.toLowerCase().includes(query) ||
                    cls.academicYear.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, classes]);


    return (
        <main className="dashboard">
            <section className="dashboard__hero">
                <div>
                    <p className="eyebrow">Class Management</p>
                    <h1>Classes</h1>
                    <p className="dashboard__muted">Manage your school's classes and cohorts</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    <Link href="/dashboard/classes/create" className="btn btn--primary">
                        Create Class
                    </Link>
                </div>
            </section>

            {loading ? (
                <div className="dashboard__card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <p className="eyebrow">Syncing cohorts...</p>
                    <h2>Loading classes...</h2>
                </div>
            ) : error ? (
                <div className="dashboard__card">
                    <p className="alert alert--error">{error}</p>
                    <button className="btn btn--primary u-margin-top-md" onClick={fetchClasses}>
                        Retry loading
                    </button>
                </div>
            ) : (
                <>

                    {classes.length > 0 && (
                        <section className="dashboard__search">
                            <div className="search-bar">
                                <span className="search-bar__icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search classes by name, subject, or year..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </section>
                    )}

                    <section className="dashboard__grid">
                        {classes.length === 0 ? (
                            <div className="dashboard__card">
                                <p className="eyebrow">No classes yet</p>
                                <h2>Get started by creating your first class</h2>
                                <p>Classes help you organize students and mentors into cohorts for the academic year.</p>
                                <Link href="/dashboard/classes/create" className="btn btn--primary">
                                    Create your first class
                                </Link>
                            </div>
                        ) : (
                            <div className="dashboard__card">
                                <div className="table">
                                    <div className="table__head">
                                        <span>Class Name</span>
                                        <span>Academic Year</span>
                                        <span>Students</span>
                                        <span>Mentors</span>
                                        <span>Actions</span>
                                    </div>
                                    {filteredClasses.length === 0 ? (
                                        <div className="table__empty">
                                            <p>No classes match your search.</p>
                                        </div>
                                    ) : (
                                        filteredClasses.map((cls) => (
                                            <div key={cls._id} className="table__row">
                                                <span>
                                                    <strong>{cls.name}</strong>
                                                    {cls.subject && <small className="dashboard__muted">{cls.subject}</small>}
                                                </span>
                                                <span>
                                                    {cls.academicYear}
                                                    {cls.semester && ` • ${cls.semester}`}
                                                </span>
                                                <span>
                                                    {cls.students.length}
                                                    {cls.maxStudents && ` / ${cls.maxStudents}`}
                                                </span>
                                                <span>{cls.mentors.length}</span>
                                                <span>
                                                    <Link
                                                        href={`/dashboard/classes/${cls._id}`}
                                                        className="btn btn--ghost btn--sm"
                                                    >
                                                        View
                                                    </Link>
                                                </span>
                                            </div>
                                        )))}
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            );
}
