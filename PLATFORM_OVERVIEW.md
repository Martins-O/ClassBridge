# Class Bridge Platform Overview

Class Bridge connects schools, mentors, and students through a blended assessment and communications platform. This document captures the goals, core features, and guiding principles that shape the product.

## Why Class Bridge exists

- **Simplify onboarding and collaboration:** Schools need a single space to invite mentors and students, assign roles, and manage access without complex tooling.
- **Measure progress through meaningful assessments:** Class Bridge emphasises structured assessments that highlight student strengths, growth areas, and mentor feedback loops.
- **Create accountability with transparent data:** Administrators can monitor classes, courses, and transcripts in real time while mentors and students track individual progress.

## What the platform delivers

### For school administrators
- **Organisation management:** Register a school, invite mentors and students, and manage cohorts and academic years.
- **Class & course orchestration:** Create classes, assign mentors, spin up courses, and monitor who is participating.
- **Insights & reporting:** Dashboards surface assessments, invitations, transcripts, and other operational metrics.

### For mentors
- **Assessment tooling:** Build assessments with multiple question types, target roles, time limits, and passing thresholds.
- **Course management:** Create courses, publish syllabi, and monitor enrolment or completion trends.
- **Communication flows:** Send invitations to students, accept mentor requests, and coordinate with school admins.

### For students
- **Guided onboarding:** Accept invitations securely, join classes, and view assigned courses.
- **Assessment participation:** Complete assessments, see results, and revisit transcripts to understand progress.
- **Profile visibility:** Maintain up-to-date profile details that mentors and administrators can reference.

## How it’s built

- **Frontend:** Next.js 15 (React 19) hosted under `Frontend/`. Uses the App Router, Tailwind CSS, and fetches the backend API via `/api/*` rewrites.
- **Backend:** Express + TypeScript hosted under `Backend/`. Reuses the original Next.js route logic, now exposed as REST endpoints with session-based authentication.
- **Database:** MongoDB via Mongoose models for users, assessments, courses, grades, transcripts, and invitations.
- **Email:** Integrates with Brevo (Sendinblue) for transactional emails (student/mentor invitations, password resets).

## Guiding principles

1. **Security-first sessions:** Cookies are signed using `SESSION_SECRET`, and every endpoint validates roles before executing business logic.
2. **Role-aware UX:** Each screen and API respects the capabilities of school admins, mentors, students, and super admins.
3. **Extendable foundation:** Shared validation, serialization, and models live in the backend to keep behaviour consistent across new features.
4. **Operational clarity:** Dashboards, transcripts, and stats endpoints ensure stakeholders can answer “who is doing what” at any time.

## High-level user journeys

1. **School onboarding:** A school admin registers, configures the organisation, and invites mentors/students.
2. **Mentor enablement:** A mentor accepts an invitation, sets a secure password, and begins creating classes, courses, and assessments.
3. **Student engagement:** A student accepts an invitation, joins classes, takes assessments, and views feedback or transcripts.
4. **Continuous monitoring:** Administrators review dashboards, update school details, and keep participant records up to date through the profile APIs.

## Next steps

- Expand the profile API with avatars or document uploads once storage is selected.
- Introduce notifications for assessment deadlines and class announcements.
- Offer export/import tooling so schools can integrate Class Bridge with external SIS or LMS systems.

---

For architectural, setup, and command references, see the main `README.md`.
