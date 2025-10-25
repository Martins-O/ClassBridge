import Link from 'next/link';
import { DarkLayout } from '@/components/ui/DarkLayout';
import { Button } from '@/components/ui/Button';
import { Card, GlowCard } from '@/components/ui/Card';

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
    <DarkLayout
      header={
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6 text-background-primary">
                <defs>
                  <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#00FF88" />
                  </linearGradient>
                </defs>
                <path d="M4 22 Q12 15, 20 17 Q28 19, 36 22 L36 25 Q28 22, 20 20 Q12 18, 4 25 Z" fill="url(#bridgeGradient)" />
                <rect x="3" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
                <rect x="35" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
                <rect x="19" y="17" width="2" height="13" fill="url(#bridgeGradient)" rx="1" />
              </svg>
            </div>
            <span className="text-xl font-bold text-text-primary">
              <span className="text-accent-primary neon-text">ClassBridge</span>
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="primary" size="sm" glow asChild>
              <Link href="/register">Request demo</Link>
            </Button>
          </nav>
        </div>
      }
    >
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="animate-pulse-soft absolute -top-52 -left-32 h-96 w-96 rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="animate-float absolute top-1/4 right-16 h-72 w-72 rounded-full bg-accent-secondary/10 blur-3xl" />
        <div className="animate-pulse-soft absolute bottom-[-18rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-neon-green/10 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-10 sm:pt-16">
        <section className="grid gap-12 lg:grid-cols-[1.3fr,1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-primary font-mono">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-glow-pulse"></div>
              Operational clarity
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-text-primary sm:text-5xl lg:text-[3.4rem]">
              Govern every programme, class, and outcome from a single <span className="text-accent-primary neon-text">command centre</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-text-secondary font-mono">
              ClassBridge brings academic planning, competency tracking, and community communication into one secure workspace—so leadership can make timely decisions and teams can execute with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="primary" size="lg" glow asChild>
                <Link href="/register">Launch your workspace</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Explore the platform</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <GlowCard key={metric.label} neonBorder="cyan" className="px-5 py-4">
                  <p className="text-3xl font-bold text-accent-primary font-mono">{metric.value}</p>
                  <p className="text-sm font-semibold text-text-primary">{metric.label}</p>
                  <p className="text-xs text-text-muted font-mono">{metric.detail}</p>
                </GlowCard>
              ))}
            </div>
          </div>

          <GlowCard neonBorder="purple" className="relative hidden min-h-[22rem] p-8 lg:block">
            <div className="absolute -top-8 right-10 h-16 w-16 rounded-full bg-accent-secondary/20 blur-xl" aria-hidden />
            <div className="absolute bottom-6 left-4 h-24 w-24 rounded-full bg-accent-primary/15 blur-[60px]" aria-hidden />
            <div className="space-y-6">
              <Card className="px-5 py-4 bg-background-tertiary/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-primary font-mono">Live overview</p>
                <p className="mt-2 text-sm text-text-secondary font-mono">
                  Daily attendance is on track (98%). Two cohorts need additional mentor coverage this week.
                </p>
              </Card>
              <Card className="px-5 py-4 bg-background-tertiary/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-secondary font-mono">Action queue</p>
                <ul className="mt-2 space-y-2 text-sm text-text-secondary font-mono">
                  <li>• Approve assessment blueprint for Year 10 Science</li>
                  <li>• Review mentor feedback for Leadership Workshop</li>
                  <li>• Publish family newsletter for Semester planning</li>
                </ul>
              </Card>
            </div>
          </GlowCard>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const borderColors = ['cyan', 'purple', 'green'] as const;
            return (
              <GlowCard key={pillar.title} neonBorder={borderColors[index]} interactive className="p-6">
                <span className="inline-flex items-center rounded-full bg-neon-green/15 px-3 py-1 text-xs font-semibold text-neon-green font-mono">
                  {pillar.badge}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary font-mono">{pillar.description}</p>
              </GlowCard>
            );
          })}
        </section>

        <GlowCard neonBorder="green" className="grid gap-8 p-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Implementation without <span className="text-neon-green neon-text">disruption</span></h2>
            <p className="mt-3 text-sm text-text-secondary font-mono">
              ClassBridge adapts to your existing academic model. Our migration utilities, advisory services, and automation library ensure you stay focused on delivery—not spreadsheets.
            </p>
            <div className="mt-6 space-y-4">
              {initiatives.map((item) => (
                <Card key={item.title} className="px-5 py-4 bg-background-tertiary/50">
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                  <p className="text-sm text-text-secondary font-mono">{item.copy}</p>
                </Card>
              ))}
            </div>
          </div>
          <Card className="relative px-6 py-8 bg-background-tertiary/50">
            <div className="absolute right-10 top-6 h-12 w-12 animate-float rounded-full bg-neon-green/20 blur-lg" aria-hidden />
            <h3 className="text-lg font-semibold text-text-primary">Governance snapshots</h3>
            <div className="mt-4 space-y-4 text-sm text-text-secondary font-mono">
              <div className="flex items-center justify-between rounded-xl border border-border-primary bg-background-secondary px-4 py-3">
                <span>Compliance & safeguarding</span>
                <span className="rounded-full bg-neon-green px-3 py-1 text-xs font-semibold text-background-primary">On track</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border-primary bg-background-secondary px-4 py-3">
                <span>Curriculum coverage</span>
                <span className="text-sm font-semibold text-accent-primary">94%</span>
              </div>
              <div className="space-y-1 rounded-xl border border-border-primary bg-background-secondary px-4 py-3">
                <p>Focus areas this week</p>
                <ul className="list-disc pl-4 text-xs text-text-muted">
                  <li>Confirm mentorship pairings for Cohort Delta</li>
                  <li>Publish assessment rubrics for Quarter 2</li>
                </ul>
              </div>
            </div>
          </Card>
        </GlowCard>

        <GlowCard neonBorder="cyan" className="px-6 py-10 text-center">
          <h2 className="text-2xl font-semibold text-text-primary">Ready to orchestrate a connected <span className="text-accent-primary neon-text">learning community</span>?</h2>
          <p className="mt-3 text-sm text-text-secondary font-mono">
            Schedule a strategy session with our onboarding specialists and see how quickly your team can move from reactive to proactive operations.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" glow asChild>
              <Link href="/register">Book a strategy call</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Preview the console</Link>
            </Button>
          </div>
        </GlowCard>
      </main>
    </DarkLayout>
  );
}
