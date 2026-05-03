import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ClipboardCheck, FileText, Smartphone, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: 'Institutional Governance',
    description: 'Comprehensive school management with fine-grained role-based access control. Support for 8 distinct roles including System Admin, School Admin, Office Staff, Admissions, Counselor, Mentor, Student, and Pending Admin.',
    details: [
      'Role-based permission system with 18 granular permissions',
      'Manage users, classes, courses, and assessments',
      'Approve school registrations and monitor activity',
    ],
    color: 'text-primary',
  },
  {
    icon: <ClipboardCheck className="h-8 w-8" />,
    title: '360° Assessments',
    description: 'Evaluate performance through peer, mentor, and self-assessment frameworks. Create custom assessments, track student progress, and generate detailed reports.',
    details: [
      'Multiple assessment types: quizzes, projects, presentations',
      'Real-time grading and feedback system',
      'Peer review and mentor evaluation tools',
    ],
    color: 'text-accent',
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Digital Transcripts',
    description: 'Instant generation of official academic records and verified transcripts. Students can view their own progress while staff can manage all academic records.',
    details: [
      'PDF and CSV export options',
      'Secure, verifiable academic credentials',
      'Course history with grades and credits',
    ],
    color: 'text-primary',
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    title: 'Mobile Ready',
    description: 'Access your data on any device - desktop, tablet, or mobile. Responsive design ensures seamless experience across all screen sizes.',
    details: [
      'Progressive Web App (PWA) support',
      'Offline mode for basic viewing',
      'Push notifications for important updates',
    ],
    color: 'text-accent',
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A comprehensive solution for modern educational institutions.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="card hover:shadow-lg transition-all h-full">
                  <div className={`mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-3">{feature.title}</h3>
                  <p className="text-text-secondary mb-4">{feature.description}</p>
                  {feature.details && (
                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-start text-sm text-text-secondary">
                          <ArrowRight className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
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
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-primary to-accent"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Ready to Transform Your School?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-white/80 mb-8"
          >
            Join hundreds of schools already using ClassBridge.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link to="/register" className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-surface-hover transition-colors">
              Start Free Trial
            </Link>
          </motion.div>
        </div>
      </motion.section>

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