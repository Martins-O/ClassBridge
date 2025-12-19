'use client';

import { useState, useEffect } from 'react';

interface Class {
    _id: string;
    name: string;
    academicYear: string;
    semester?: string;
}

interface StudentInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function StudentInviteModal({ isOpen, onClose, onSuccess }: StudentInviteModalProps) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [mode, setMode] = useState<'single' | 'bulk'>('single');

    // Single mode state
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');

    // Bulk mode state
    const [bulkData, setBulkData] = useState('');

    const [classId, setClassId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchClasses();
        }
    }, [isOpen]);

    const fetchClasses = async () => {
        setLoadingClasses(true);
        try {
            const response = await fetch('/api/classes');
            const data = await response.json();
            if (response.ok) {
                setClasses(data.classes || []);
            }
        } catch {
            setError('Failed to load classes');
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (mode === 'single' && (!studentName || !studentEmail || !classId)) {
            setError('All fields are required');
            return;
        }

        if (mode === 'bulk' && (!bulkData || !classId)) {
            setError('Bulk data and class are required');
            return;
        }

        setSubmitting(true);

        try {
            let response;
            if (mode === 'single') {
                response = await fetch('/api/students/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentName, studentEmail, classId }),
                });
            } else {
                // Parse bulk data: "Name, Email"
                const lines = bulkData.split('\n').filter(line => line.trim().includes(','));
                const students = lines.map(line => {
                    const [name, email] = line.split(',').map(s => s.trim());
                    return { name, email };
                });

                if (students.length === 0) {
                    setError('No valid "Name, Email" pairs found (use comma to separate)');
                    setSubmitting(false);
                    return;
                }

                response = await fetch('/api/students/bulk-invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ students, classId }),
                });
            }

            const data = await response.json();

            if (response.ok) {
                if (mode === 'single') {
                    setSuccess(`Invitation sent to ${studentEmail}!`);
                } else {
                    setSuccess(`Bulk processing complete! Success: ${data.results?.success?.length || 0}, Failed: ${data.results?.failed?.length || 0}`);
                }

                resetForm();
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2500);
            } else {
                setError(data.error || 'Failed to send invitation');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setStudentName('');
        setStudentEmail('');
        setBulkData('');
        setClassId('');
    };

    const handleClose = () => {
        if (!submitting) {
            resetForm();
            setError('');
            setSuccess('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>Invite Students</h2>
                    <button
                        className="modal__close"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="modal__tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                    <button
                        className={`tab-btn ${mode === 'single' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '0.75rem', border: 'none', background: mode === 'single' ? 'var(--bg-accent)' : 'transparent', cursor: 'pointer', color: 'var(--text)' }}
                        onClick={() => setMode('single')}
                    >
                        Single Invite
                    </button>
                    <button
                        className={`tab-btn ${mode === 'bulk' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '0.75rem', border: 'none', background: mode === 'bulk' ? 'var(--bg-accent)' : 'transparent', cursor: 'pointer', color: 'var(--text)' }}
                        onClick={() => setMode('bulk')}
                    >
                        Bulk Invite
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal__body">
                        {error && <p className="auth-card__error">{error}</p>}
                        {success && <p className="auth-card__success">{success}</p>}

                        <label className="field">
                            <span>Target Class</span>
                            {loadingClasses ? (
                                <p>Loading classes...</p>
                            ) : (
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    required
                                    disabled={submitting}
                                >
                                    <option value="">Select a class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name} ({cls.academicYear})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </label>

                        {mode === 'single' ? (
                            <>
                                <label className="field">
                                    <span>Student Name</span>
                                    <input
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        placeholder="John Doe"
                                        required={mode === 'single'}
                                        disabled={submitting}
                                    />
                                </label>

                                <label className="field">
                                    <span>Student Email</span>
                                    <input
                                        type="email"
                                        value={studentEmail}
                                        onChange={(e) => setStudentEmail(e.target.value)}
                                        placeholder="student@example.com"
                                        required={mode === 'single'}
                                        disabled={submitting}
                                    />
                                </label>
                            </>
                        ) : (
                            <label className="field">
                                <span>Student List (Name, Email - one per line)</span>
                                <textarea
                                    value={bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                    placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com"
                                    rows={6}
                                    required={mode === 'bulk'}
                                    disabled={submitting}
                                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                />
                                <small style={{ display: 'block', marginTop: '4px', opacity: 0.7 }}>
                                    Format: Full Name, Email Address
                                </small>
                            </label>
                        )}
                    </div>

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={submitting}>
                            {submitting ? 'Processing...' : (mode === 'single' ? 'Send Invitation' : 'Send Bulk Invitations')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
