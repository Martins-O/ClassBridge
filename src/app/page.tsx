import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const metrics = [
  { label: 'Schools assisted', value: '180+', detail: 'from K-12 to vocational' },
  { label: 'Success rate', value: '92%', detail: 'implementation success' },
  { label: 'Expert team', value: '26', detail: 'educational specialists' },
  { label: 'Years experience', value: '12', detail: 'in academic management' },
];

const features = [
  {
    title: 'Academic Planning & Scheduling',
    description: 'Streamline course management, timetabling, and resource allocation with intelligent automation.',
    icon: '📅',
  },
  {
    title: 'Assessment & Competency Tracking',
    description: 'Design assessments, track student progress, and monitor competency achievement across all programs.',
    icon: '📊',
  },
  {
    title: 'Community Communication Hub',
    description: 'Connect students, teachers, and parents through integrated messaging and progress sharing.',
    icon: '💬',
  },
];

const tools = [
  {
    title: 'Real-time Dashboard',
    description: 'Monitor school operations, attendance, and key metrics from a unified command center.',
  },
  {
    title: 'Assessment Builder',
    description: 'Create and deploy assessments with automatic grading and competency mapping.',
  },
  {
    title: 'Parent Portal',
    description: 'Give families access to student progress, assignments, and school communications.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-6 h-6 text-white">
                  <path d="M4 22 Q12 15, 20 17 Q28 19, 36 22 L36 25 Q28 22, 20 20 Q12 18, 4 25 Z" fill="currentColor" />
                  <rect x="3" y="22" width="2" height="8" fill="currentColor" rx="1" />
                  <rect x="35" y="22" width="2" height="8" fill="currentColor" rx="1" />
                  <rect x="19" y="17" width="2" height="13" fill="currentColor" rx="1" />
                </svg>
              </div>
              <span className="text-xl font-bold">ClassBridge</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-white hover:text-primary-100 transition-colors">Home</Link>
              <Link href="#" className="text-white hover:text-primary-100 transition-colors">Features</Link>
              <Link href="#" className="text-white hover:text-primary-100 transition-colors">About</Link>
              <Link href="#" className="text-white hover:text-primary-100 transition-colors">Contact</Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white border-white hover:bg-white hover:text-primary-500">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-white text-primary-500 hover:bg-primary-50">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                School management made simple
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Govern every programme, class, and outcome from a single{' '}
                <span className="text-primary-500">command centre</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                ClassBridge brings academic planning, competency tracking, and community communication into one secure workspace—so leadership can make timely decisions and teams can execute with confidence.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/register">
                  <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                    Launch your workspace
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="border-primary-500 text-primary-500 hover:bg-primary-50">
                    Watch how it works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl">🎓</span>
                  </div>
                  <p className="text-primary-700 font-medium">Your educational platform dashboard</p>
                </div>
              </div>
              {/* Floating notification cards */}
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-card border border-primary-200">
                <p className="text-xs font-medium text-gray-600">Student progress updated</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-card border border-primary-200">
                <p className="text-xs font-medium text-gray-600">Assessment completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Success</h2>
            <p className="text-lg text-gray-600">
              Trusted by educational institutions worldwide to streamline their operations
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-500 mb-2">{metric.value}</div>
                <div className="text-gray-900 font-medium mb-1">{metric.label}</div>
                <div className="text-sm text-gray-500">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All-In-One School Management</h2>
            <p className="text-lg text-gray-600">
              ClassBridge combines all the tools needed to run a successful educational institution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 bg-white shadow-card hover:shadow-card-hover transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What is <span className="text-primary-500">ClassBridge</span>?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ClassBridge is a comprehensive platform that allows educational institutions to manage all aspects
                of their operations—from student enrollment and academic planning to assessment delivery and
                community engagement—all in one secure, cloud-based system.
              </p>

              <div className="space-y-6">
                {tools.map((tool) => (
                  <div key={tool.title} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{tool.title}</h4>
                      <p className="text-gray-600">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-3xl">📱</span>
                </div>
                <p className="text-gray-700 font-medium">Interactive platform demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your school management?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of educational institutions already using ClassBridge to transform their operations
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-500 hover:bg-gray-50">
                Start free trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-500">
                Schedule demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-5 h-5 text-white">
                    <path d="M4 22 Q12 15, 20 17 Q28 19, 36 22 L36 25 Q28 22, 20 20 Q12 18, 4 25 Z" fill="currentColor" />
                    <rect x="3" y="22" width="2" height="8" fill="currentColor" rx="1" />
                    <rect x="35" y="22" width="2" height="8" fill="currentColor" rx="1" />
                    <rect x="19" y="17" width="2" height="13" fill="currentColor" rx="1" />
                  </svg>
                </div>
                <span className="text-lg font-bold">ClassBridge</span>
              </div>
              <p className="text-gray-400">
                Streamlining educational management for institutions worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClassBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}