'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const features = [
  {
    title: 'Unified Operations',
    description: 'One workspace for classes, mentors, and students. No more spreadsheet chaos.',
    icon: '🎯'
  },
  {
    title: 'Competency Tracking',
    description: 'Automatic connections between assessments, grades, and transcripts.',
    icon: '📊'
  },
  {
    title: 'Smart Insights',
    description: 'Real-time dashboards that help everyone make better decisions.',
    icon: '💡'
  }
];

const stats = [
  { label: 'Schools', value: '180+' },
  { label: 'Mentors', value: '2.4k' },
  { label: 'Assessments', value: '65k' }
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="landing">
      {/* Animated Background */}
      <div className="landing__bg">
        <div className="landing__bg-gradient"></div>
        <div className="landing__bg-orbs">
          <div className="orb orb--1"></div>
          <div className="orb orb--2"></div>
          <div className="orb orb--3"></div>
        </div>
      </div>

      {/* Hero Section */}
      <section className={`landing__hero ${mounted ? 'mounted' : ''}`}>
        <div className="landing__container">
          <div className="landing__hero-content">
            <div className="landing__badge">
              <span>🎓</span>
              <span>ClassBridge</span>
            </div>

            <h1 className="landing__title">
              Transform Your School
              <br />
              <span className="landing__title-accent">Management</span>
            </h1>

            <p className="landing__subtitle">
              The modern platform that brings together classes, mentors, and students.
              <br />Say goodbye to spreadsheets. Hello seamless operations.
            </p>

            <div className="landing__actions">
              <Link href="/register" className="landing__btn landing__btn--primary">
                <span>Get Started Free</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/login" className="landing__btn landing__btn--secondary">
                Sign In
              </Link>
            </div>

            <div className="landing__stats">
              {stats.map((stat, i) => (
                <div key={stat.label} className="stat" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="stat__value">{stat.value}</div>
                  <div className="stat__label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing__features">
        <div className="landing__container">
          <div className="landing__section-header">
            <span className="landing__eyebrow">Features</span>
            <h2 className="landing__section-title">Everything You Need</h2>
          </div>

          <div className="landing__feature-grid">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="feature-card"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="feature-card__icon">{feature.icon}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing__cta">
        <div className="landing__container">
          <div className="cta-box">
            <h2 className="cta-box__title">Ready to Transform Your School?</h2>
            <p className="cta-box__text">Join hundreds of schools already using ClassBridge</p>
            <Link href="/register" className="landing__btn landing__btn--primary landing__btn--large">
              <span>Start Your Free Trial</span>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
