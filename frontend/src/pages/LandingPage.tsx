import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, ClipboardCheck, FileText, Smartphone, ArrowRight, Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

const stats = [
  { number: '500+', label: 'Schools' },
  { number: '50k+', label: 'Students' },
  { number: '8', label: 'User Roles' },
  { number: '18', label: 'Permissions' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Modern School Management
              <span className="text-primary"> Made Simple</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
            >
              Streamline governance, assessments, and academic records with our comprehensive platform. Built for schools of all sizes.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="group">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="h-6 w-6 animate-bounce text-text-muted" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-surface/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Powerful features designed to streamline every aspect of school management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className={`mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-text-secondary mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-secondary">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your School?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join hundreds of schools already using ClassBridge to streamline their operations
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-primary mb-4 md:mb-0">
              ClassBridge
            </div>
            <div className="flex gap-6 text-sm text-text-secondary">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
