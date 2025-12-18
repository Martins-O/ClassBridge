'use client';

import { useState, useEffect } from 'react';

interface Mentor {
    _id: string;
    name: string;
    email: string;
}

interface MentorAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classId: string;
    currentMentorIds: string[];
    schoolId: string;
}

export default function MentorAssignmentModal({
    isOpen,
    onClose,
    onSuccess,
    classId,
    currentMentorIds,
    schoolId,
}: MentorAssignmentModalProps) {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [selectedMentorIds, setSelectedMentorIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedMentorIds(new Set(currentMentorIds));
            fetchMentors();
        }
    }, [isOpen, currentMentorIds]);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/mentors?schoolId=${schoolId}`);
            const data = await response.json();
            if (response.ok) {
                setMentors(data.mentors || []);
            } else {
                setError('Failed to load mentors');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const toggleMentor = (mentorId: string) => {
        const newSelected = new Set(selectedMentorIds);
        if (newSelected.has(mentorId)) {
            newSelected.delete(mentorId);
        } else {
            newSelected.add(mentorId);
        }
        setSelectedMentorIds(newSelected);
    };

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);

        const currentSet = new Set(currentMentorIds);
        const selectedSet = new Set(selectedMentorIds);

        // Find mentors to add and remove
        const toAdd = Array.from(selectedSet).filter((id) => !currentSet.has(id));
        const toRemove = Array.from(currentSet).filter((id) => !selectedSet.has(id));

        try {
            // Process additions
            for (const mentorId of toAdd) {
                const response = await fetch('/api/mentors', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mentorId,
                        classIds: [classId],
                        action: 'assign',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to assign mentor');
                }
            }

            // Process removals
            for (const mentorId of toRemove) {
                const response = await fetch('/api/mentors', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mentorId,
                        classIds: [classId],
                        action: 'remove',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to remove mentor');
                }
            }

            onSuccess();
            onClose();
        } catch {
            setError('Failed to update mentor assignments');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>Assign Mentors</h2>
                    <button
                        className="modal__close"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="modal__body">
                    {error && <p className="auth-card__error">{error}</p>}

                    {loading ? (
                        <p>Loading mentors…</p>
                    ) : mentors.length === 0 ? (
                        <p className="dashboard__muted">No mentors available. Invite mentors first.</p>
                    ) : (
                        <div className="checkbox-list">
                            {mentors.map((mentor) => (
                                <label key={mentor._id} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedMentorIds.has(mentor._id)}
                                        onChange={() => toggleMentor(mentor._id)}
                                        disabled={submitting}
                                    />
                                    <div className="checkbox-item__content">
                                        <strong>{mentor.name}</strong>
                                        <small className="dashboard__muted">{mentor.email}</small>
                                    </div>
                                </label>
                            ))}
                        </div>
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
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleSubmit}
                        disabled={submitting || mentors.length === 0}
                    >
                        {submitting ? 'Saving...' : 'Save Assignments'}
                    </button>
                </div>
            </div>
        </div>
    );
}
