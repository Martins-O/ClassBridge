import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🏛️',
    title: 'Institutional Governance',
    description: 'Comprehensive school management with fine-grained role-based access control.',
  },
  {
    icon: '📊',
    title: '360° Assessments',
    description: 'Evaluate performance through peer, mentor, and self-assessment frameworks.',
  },
  {
    icon: '📜',
    title: 'Digital Transcripts',
    description: 'Instant generation of official academic records and verified transcripts.',
  },
  {
    icon: '📱',
    title: 'Mobile Ready',
    description: 'Access your data on any device - desktop, tablet, or mobile.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background shapes */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-xl font-bold text-text">ClassBridge</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-text-secondary hover:text-primary transition-colors">Features</a>
              <a href="#schools" className="text-text-secondary hover:text-primary transition-colors">Schools</a>
              <a href="#contact" className="text-text-secondary hover:text-primary transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
              Modern School Management{' '}
              <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary mb-8">
              ClassBridge helps educational institutions manage students, courses, grades, 
              and assessments all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-3">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A comprehensive solution for modern educational institutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools Section */}
      <section id="schools" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Trusted by Institutions
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Schools across the country trust ClassBridge for their management needs.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {['School A', 'School B', 'School C', 'School D', 'School E'].map((school) => (
              <div key={school} className="text-xl font-semibold text-text-secondary px-6 py-3 border border-border rounded-lg">
                {school}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join hundreds of schools already using ClassBridge.
          </p>
          <Link to="/register" className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-surface-hover transition-colors">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">CB</span>
              </div>
              <span className="font-semibold text-text">ClassBridge</span>
            </div>
            
            <p className="text-text-secondary text-sm">
              © 2026 ClassBridge. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-text-secondary hover:text-primary text-sm transition-colors">Privacy</a>
              <a href="#" className="text-text-secondary hover:text-primary text-sm transition-colors">Terms</a>
              <a href="#" className="text-text-secondary hover:text-primary text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;