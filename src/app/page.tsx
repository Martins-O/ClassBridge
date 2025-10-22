import Link from 'next/link';
import ClassBridgeLogo from '@/components/ClassBridgeLogo';
import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const metrics = [
  { label: 'Schools orchestrated', value: '180+', detail: 'from K-12 to vocational' },
  { label: 'Learners onboarded', value: '28k', detail: 'active student accounts' },
  { label: 'Time saved weekly', value: '12hrs', detail: 'per admin team' },
];

const pillars = [
  {
    title: 'Operational Control Centre',
    description:
      'Automate enrolment, attendance, and scheduling while keeping every stakeholder aligned with role-based workflows.',
    badge: 'Leadership dashboard',
  },
  {
    title: 'Instructional Excellence',
    description:
      'Design assessments, track mastery, and deliver targeted feedback with analytics that surface where support is needed most.',
    badge: 'Assessment intelligence',
  },
  {
    title: 'Connected Community',
    description:
      'Give mentors, students, and guardians a single hub for communication, resources, and progress updates in real time.',
    badge: 'Unified engagement',
  },
];

const initiatives = [
  {
    title: 'Launch in minutes, not months',
    copy: 'Structured onboarding templates, SIS importers, and guided configuration help your team switch with confidence.',
  },
  {
    title: 'Secure by design',
    copy: 'Enterprise-grade encryption, audit trails, and compliance tooling keep data protected and accountable.',
  },
  {
    title: 'Advisory partnership',
    copy: 'Dedicated success specialists and a growing playbook of best practices keep every rollout on track.',
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-base">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="animate-pulse-soft absolute -top-52 -left-32 h-96 w-96 rounded-full bg-accent-emerald/15 blur-3xl" />
        <div className="animate-float absolute top-1/4 right-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="animate-pulse-soft absolute bottom-[-18rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-700/15 blur-[140px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <ClassBridgeLogo size="md" />
        <nav className="flex items-center gap-4">
          <Link href="/login" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
            Sign in
          </Link>
          <Link href="/register" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Request demo
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-10 sm:pt-16">
        <section className="grid gap-12 lg:grid-cols-[1.3fr,1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink-400 shadow-soft">
              Operational clarity
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              Govern every programme, class, and outcome from a single command centre.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink-500">
              ClassBridge brings academic planning, competency tracking, and community communication into one secure workspace—so leadership can make timely decisions and teams can execute with confidence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-brand-900 bg-accent-coral px-6 py-3 text-lg font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-[#ff6946]"
              >
                Launch your workspace
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white px-6 py-3 text-lg font-semibold text-brand-700 shadow-soft transition-colors hover:border-brand-300 hover:text-brand-800"
              >
                Explore the platform
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-brand-200 bg-white px-5 py-4 shadow-soft">
                  <p className="text-3xl font-semibold text-brand-600">{metric.value}</p>
                  <p className="text-sm font-semibold text-ink-600">{metric.label}</p>
                  <p className="text-xs text-ink-400">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[22rem] rounded-3xl border border-brand-100 bg-white p-8 shadow-soft lg:block">
            <div className="absolute -top-8 right-10 h-16 w-16 rounded-full bg-accent-sky/20 blur-xl" aria-hidden />
            <div className="absolute bottom-6 left-4 h-24 w-24 rounded-full bg-brand-500/15 blur-[60px]" aria-hidden />
            <div className="space-y-6">
              <article className="rounded-2xl border border-brand-100 bg-white px-5 py-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Live overview</p>
                <p className="mt-2 text-sm text-ink-500">
                  Daily attendance is on track (98%). Two cohorts need additional mentor coverage this week.
                </p>
              </article>
              <article className="rounded-2xl border border-brand-100 bg-white px-5 py-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Action queue</p>
                <ul className="mt-2 space-y-2 text-sm text-ink-500">
                  <li>• Approve assessment blueprint for Year 10 Science</li>
                  <li>• Review mentor feedback for Leadership Workshop</li>
                  <li>• Publish family newsletter for Semester planning</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border border-brand-100 p-6 shadow-soft transition-all duration-300 hover:-translate-y-2">
              <span className="inline-flex items-center rounded-full bg-accent-emerald/15 px-3 py-1 text-xs font-semibold text-accent-emerald">
                {pillar.badge}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{pillar.description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-8 rounded-3xl border border-brand-100 bg-white p-8 shadow-soft lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-ink-900">Implementation without disruption</h2>
            <p className="mt-3 text-sm text-ink-500">
              ClassBridge adapts to your existing academic model. Our migration utilities, advisory services, and automation library ensure you stay focused on delivery—not spreadsheets.
            </p>
            <div className="mt-6 space-y-4">
              {initiatives.map((item) => (
                <div key={item.title} className="rounded-2xl border border-brand-100 bg-surface-elevated px-5 py-4 shadow-soft">
                  <h3 className="text-sm font-semibold text-ink-800">{item.title}</h3>
                  <p className="text-sm text-ink-500">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl border border-brand-100 bg-surface-elevated px-6 py-8 shadow-soft">
            <div className="absolute right-10 top-6 h-12 w-12 animate-float rounded-full bg-accent-emerald/20 blur-lg" aria-hidden />
            <h3 className="text-lg font-semibold text-ink-900">Governance snapshots</h3>
            <div className="mt-4 space-y-4 text-sm text-ink-500">
              <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft">
                <span>Compliance & safeguarding</span>
                <span className="rounded-full bg-accent-emerald px-3 py-1 text-xs font-semibold text-white">On track</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft">
                <span>Curriculum coverage</span>
                <span className="text-sm font-semibold text-brand-600">94%</span>
              </div>
              <div className="space-y-1 rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft">
                <p>Focus areas this week</p>
                <ul className="list-disc pl-4 text-xs text-ink-400">
                  <li>Confirm mentorship pairings for Cohort Delta</li>
                  <li>Publish assessment rubrics for Quarter 2</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-brand-100 bg-white px-6 py-10 text-center shadow-soft">
          <h2 className="text-2xl font-semibold text-ink-900">Ready to orchestrate a connected learning community?</h2>
          <p className="mt-3 text-sm text-ink-500">
            Schedule a strategy session with our onboarding specialists and see how quickly your team can move from reactive to proactive operations.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-brand-900 bg-accent-coral px-5 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-[#ff6946]"
            >
              Book a strategy call
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-soft transition-colors hover:border-brand-300 hover:text-brand-800"
            >
              Preview the console
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
