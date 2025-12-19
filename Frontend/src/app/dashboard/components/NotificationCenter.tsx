'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            if (response.ok) {
                setNotifications(data.notifications || []);
            }
        } catch {
            // Ignore fetch errors
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PATCH' });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch { }
    };

    const markRead = async (id: string, link?: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            if (link) {
                setIsOpen(false);
                router.push(link);
            }
        } catch { }
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button
                className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                🔔 {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown__header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="btn btn--link btn--sm" onClick={markAllRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="notification-dropdown__list">
                        {notifications.length === 0 ? (
                            <div className="notification-item notification-item--empty">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                    onClick={() => markRead(n._id, n.link)}
                                >
                                    <h4 className="notification-item__title">{n.title}</h4>
                                    <p className="notification-item__message">{n.message}</p>
                                    <span className="notification-item__time">
                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .notification-center {
                    position: relative;
                }
                .notification-trigger {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    position: relative;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background 0.2s;
                    color: var(--text);
                }
                .notification-trigger:hover {
                    background: var(--bg-accent);
                }
                .unread-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: var(--error);
                    color: white;
                    font-size: 0.7rem;
                    font-weight: bold;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--bg);
                }
                .notification-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 320px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    margin-top: 0.5rem;
                    overflow: hidden;
                }
                .notification-dropdown__header {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notification-dropdown__header h3 {
                    margin: 0;
                    font-size: 1rem;
                }
                .notification-dropdown__list {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .notification-item {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .notification-item:hover {
                    background: var(--bg-accent);
                }
                .notification-item.unread {
                    background: rgba(var(--primary-rgb), 0.05);
                    border-left: 3px solid var(--primary);
                }
                .notification-item--empty {
                    text-align: center;
                    color: var(--text-muted);
                    padding: 2rem 1rem;
                    cursor: default;
                }
                .notification-item__title {
                    margin: 0 0 0.25rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .notification-item__message {
                    margin: 0 0 0.5rem;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    line-height: 1.4;
                }
                .notification-item__time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .btn--link {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 0.8rem;
                    cursor: pointer;
                    padding: 0;
                }
                .btn--link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
