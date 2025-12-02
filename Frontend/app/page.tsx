const features = [
  {
    title: 'Unified operations',
    description: 'Classes, mentors, and students live in one workspace so schools stop juggling spreadsheets.'
  },
  {
    title: 'Competency tracking',
    description: 'Assessments, grades, and transcripts connect automatically to show true learner progress.'
  },
  {
    title: 'Human-centered insights',
    description: 'Dashboards elevate what principals, mentors, and families need to act fast.'
  }
];

const steps = [
  'Invite your team and import schools or classes in minutes',
  'Assign mentors, share assessments, and capture rich grades',
  'Publish transcripts and share transparent progress with families'
];

const stats = [
  { label: 'Schools onboarded', value: '180+' },
  { label: 'Mentors empowered', value: '2.4k' },
  { label: 'Assessments delivered', value: '65k' }
];

export default function HomePage() {
  return (
    <main className="site">
      <header className="hero">
        <p className="hero__eyebrow">ClassBridge</p>
        <h1 className="hero__title">
          Orchestrate every class, assessment, and outcome from a single command centre
        </h1>
        <p className="hero__subtitle">
          ClassBridge is the operating system for modern learning institutions. We unify admin work, academic planning,
          and student care so leaders never have to stitch together disconnected tools again.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="/register">
            Launch your school workspace
          </a>
          <a className="btn btn--ghost" href="/login">
            Sign in
          </a>
        </div>
        <p className="hero__secondary">
          Just exploring? <a href="#story">Learn why districts trust ClassBridge</a> or <a href="#features">see the product pillars</a>.
        </p>
      </header>

      <section id="features" className="section">
        <div className="section__heading">
          <p className="eyebrow">Product pillars</p>
          <h2>Everything your school teams need to operate together</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <p className="feature-card__label">Feature</p>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="story" className="section section--panel">
        <div className="story">
          <p className="eyebrow">Why we built ClassBridge</p>
          <p className="story__lead">
            District leaders face constant pressure to show measurable progress, but their teams are buried in manual
            data entry and disjointed systems. ClassBridge replaces those brittle workflows with a shared source of
            truth, live context for every learner, and communication tools that keep students, mentors, and families
            aligned.
          </p>
          <ul className="story__steps">
            {steps.map((step, index) => (
              <li key={step}>
                <span className="story__step-index">0{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="proof">
          <p className="eyebrow">Proof</p>
          <h2>Teams trust ClassBridge to make learning visible</h2>
          <p className="proof__lead">
            From first cohort planning to graduation, every stakeholder can see progress, act on insights, and focus on
            coaching—not clerical work.
          </p>
          <div className="proof__stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="proof__value">{stat.value}</p>
                <p className="proof__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
