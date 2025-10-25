import Link from 'next/link';
import ClassBridgeLogo from '@/components/ClassBridgeLogo';
import { buttonClasses } from './Button';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  helper?: React.ReactNode;
  badge?: string;
}

export function AuthLayout({ title, subtitle, children, helper, badge }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-stretch bg-background-primary">
      {/* Left sidebar with brand information */}
      <aside className="hidden w-full max-w-xl flex-col justify-between border-r border-border-primary bg-background-secondary px-12 py-12 shadow-dark-medium lg:flex">
        <div className="space-y-8">
          <ClassBridgeLogo size="md" />
          {badge ? (
            <span className="inline-flex items-center rounded-full bg-semantic-success-muted px-3 py-1 text-xs font-semibold text-semantic-success-DEFAULT">
              {badge}
            </span>
          ) : null}
          <h1 className="text-heading-2 text-text-primary">
            Orchestrate every learning journey with <span className="text-accent-primary neon-text">confidence</span>.
          </h1>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            ClassBridge centralises enrolment, assessment, and community communication so leaders stay proactive and every mentor knows their next action.
          </p>
          <ul className="space-y-3 text-body-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent-primary mt-1">•</span>
              <span>Governance dashboards spanning cohorts, classes, and assessments.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-primary mt-1">•</span>
              <span>Secure onboarding for mentors, students, and guardians.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-primary mt-1">•</span>
              <span>Advisor-led implementation and migration support.</span>
            </li>
          </ul>
        </div>
        <div className="space-y-4 text-body-sm text-text-muted">
          <p>
            Need assistance?{' '}
            <Link
              href="/"
              className="text-accent-primary hover:text-semantic-primary-hover transition-colors underline decoration-accent-primary/50 hover:decoration-semantic-primary-hover"
            >
              Contact support
            </Link>
          </p>
          <p className="text-text-muted font-mono text-xs">
            &copy; {new Date().getFullYear()} ClassBridge. All rights reserved.
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-background-primary">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile header */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <ClassBridgeLogo size="sm" />
            <Link href="/register" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
              Request demo
            </Link>
          </div>

          {/* Auth form card */}
          <div className="rounded-2xl border border-border-primary bg-background-secondary p-8 shadow-dark-soft backdrop-blur-sm">
            <h2 className="text-heading-3 text-text-primary">{title}</h2>
            <p className="mt-2 text-body-sm text-text-secondary">{subtitle}</p>
            <div className="mt-6 space-y-6">{children}</div>
          </div>

          {/* Helper text */}
          {helper && (
            <div className="mt-6 text-center text-body-sm text-text-secondary">
              {helper}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
