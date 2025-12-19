'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '../components/SearchBar';

interface Assessment {
    _id: string;
    title: string;
    description: string;
    assessmentType: string;
    targetRole: string;
    assessorRole: string;
    isActive: boolean;
    createdAt: string;
    questions: unknown[];
}

export default function AssessmentsPage() {
    const router = useRouter();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const response = await fetch('/api/assessments');
            const data = await response.json();

            if (response.ok) {
                setAssessments(data.assessments || []);
            } else {
                setError(data.error || 'Failed to load assessments');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredAssessments = assessments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard__card">Loading assessments...</div>
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
                    <p className="eyebrow">Assessment Management</p>
                    <h1>Assessments</h1>
                    <p className="dashboard__muted">Create and manage competency assessments</p>
                </div>
                <div className="dashboard__hero-actions">
                    <button className="btn btn--ghost" onClick={() => router.push('/dashboard')}>
                        Back to dashboard
                    </button>
                    <Link href="/dashboard/assessments/create" className="btn btn--primary">
                        Create Assessment
                    </Link>
                </div>
            </section>

            {assessments.length > 0 && (
                <section className="dashboard__search">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search assessments..."
                    />
                </section>
            )}

            <section className="dashboard__grid">
                {assessments.length === 0 ? (
                    <div className="dashboard__card">
                        <p className="eyebrow">No assessments yet</p>
                        <h2>Get started by creating your first assessment</h2>
                        <p>Assessments help you measure student and mentor competencies.</p>
                        <Link href="/dashboard/assessments/create" className="btn btn--primary">
                            Create your first assessment
                        </Link>
                    </div>
                ) : (
                    <>
                        {filteredAssessments.length === 0 ? (
                            <div className="dashboard__card">
                                <p className="dashboard__muted">No assessments match your search.</p>
                            </div>
                        ) : (
                            <div className="dashboard__grid dashboard__grid--cards">
                                {filteredAssessments.map((assessment) => (
                                    <div key={assessment._id} className="assessment-card">
                                        <div className="assessment-card__header">
                                            <h3>{assessment.title}</h3>
                                            <span className={`badge badge--${assessment.isActive ? 'active' : 'inactive'}`}>
                                                {assessment.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="assessment-card__description">{assessment.description}</p>
                                        <div className="assessment-card__meta">
                                            <span className="badge badge--pending">{assessment.assessmentType.replace('_', ' ')}</span>
                                            <span className="dashboard__muted">{assessment.questions.length} questions</span>
                                        </div>
                                        <div className="assessment-card__actions">
                                            <Link
                                                href={`/dashboard/assessments/${assessment._id}`}
                                                className="btn btn--ghost btn--sm"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
