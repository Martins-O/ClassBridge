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
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
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

        if (!studentName || !studentEmail || !classId) {
            setError('All fields are required');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/students/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName,
                    studentEmail,
                    classId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Invitation sent to ${studentEmail}!`);
                setStudentName('');
                setStudentEmail('');
                setClassId('');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                setError(data.error || 'Failed to send invitation');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setStudentName('');
            setStudentEmail('');
            setClassId('');
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
                    <h2>Invite Student</h2>
                    <button
                        className="modal__close"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal__body">
                        {error && <p className="auth-card__error">{error}</p>}
                        {success && <p className="auth-card__success">{success}</p>}

                        <label className="field">
                            <span>Student Name</span>
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="John Doe"
                                required
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
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Class</span>
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
                                            {cls.name} ({cls.academicYear}
                                            {cls.semester ? ` - ${cls.semester}` : ''})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </label>
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
                            {submitting ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
