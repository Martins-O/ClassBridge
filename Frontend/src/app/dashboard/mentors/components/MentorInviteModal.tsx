'use client';

import { useState, useEffect } from 'react';

interface MentorInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    schoolId: string;
}

export default function MentorInviteModal({ isOpen, onClose, onSuccess, schoolId }: MentorInviteModalProps) {
    const [mentorName, setMentorName] = useState('');
    const [mentorEmail, setMentorEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!mentorName || !mentorEmail) {
            setError('All fields are required');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/mentors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: mentorName,
                    email: mentorEmail,
                    schoolId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isExistingUser) {
                    setSuccess(`${mentorEmail} added as mentor!`);
                } else {
                    setSuccess(`Invitation sent to ${mentorEmail}!`);
                }
                setMentorName('');
                setMentorEmail('');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                setError(data.error || 'Failed to invite mentor');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setMentorName('');
            setMentorEmail('');
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
                    <h2>Invite Mentor</h2>
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
                            <span>Mentor Name</span>
                            <input
                                type="text"
                                value={mentorName}
                                onChange={(e) => setMentorName(e.target.value)}
                                placeholder="Jane Smith"
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span>Mentor Email</span>
                            <input
                                type="email"
                                value={mentorEmail}
                                onChange={(e) => setMentorEmail(e.target.value)}
                                placeholder="mentor@example.com"
                                required
                                disabled={submitting}
                            />
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
