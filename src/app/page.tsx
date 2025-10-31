'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PublicHeader } from '@/components/PublicHeader';

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
    <div className="min-h-screen bg-white dark:bg-muted-950">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white dark:from-muted-900 dark:to-muted-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                School management made simple
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Govern every programme, class, and outcome from a single{' '}
                <span className="text-primary-500 dark:text-primary-400">command centre</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-muted-300 mb-8 leading-relaxed">
                ClassBridge brings academic planning, competency tracking, and community communication into one secure workspace—so leaders can make timely decisions and teams can execute with confidence.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/register">
                  <Button size="lg" glow className="shadow-xl">
                    Start free trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Schedule demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-muted-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-muted-800 dark:to-muted-900 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-muted-950 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">📊</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-muted-400">Dashboard Overview</div>
                      <div className="font-semibold text-gray-900 dark:text-white">Real-time Analytics</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-muted-300">Active Students</span>
                      <span className="font-semibold text-gray-900 dark:text-white">1,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-muted-300">Completion Rate</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-muted-300">Active Classes</span>
                      <span className="font-semibold text-gray-900 dark:text-white">42</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 bg-white dark:bg-muted-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Success</h2>
            <p className="text-lg text-gray-600 dark:text-muted-300">
              Trusted by educational institutions worldwide to streamline their operations
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">{metric.value}</div>
                <div className="text-gray-900 dark:text-white font-medium mb-1">{metric.label}</div>
                <div className="text-sm text-gray-500 dark:text-muted-400">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50 dark:bg-muted-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">All-In-One School Management</h2>
            <p className="text-lg text-gray-600 dark:text-muted-300">
              ClassBridge combines all the tools needed to run a successful educational institution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 bg-white dark:bg-muted-900 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-muted-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-white dark:bg-muted-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Powerful tools for modern education
              </h2>
              <p className="text-lg text-gray-600 dark:text-muted-300 mb-8">
                ClassBridge is a comprehensive platform that allows educational institutions to manage all aspects
                of their operations—from student enrollment and academic planning to assessment delivery and
                community engagement—all in one secure, cloud-based system.
              </p>

              <div className="space-y-6">
                {tools.map((tool) => (
                  <div key={tool.title} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary-500 dark:bg-primary-600 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{tool.title}</h4>
                      <p className="text-gray-600 dark:text-muted-300">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-muted-800 dark:to-muted-900 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-500 dark:bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-3xl">📱</span>
                </div>
                <p className="text-gray-700 dark:text-muted-300 font-medium">Interactive platform demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500 dark:bg-muted-900 dark:border-t dark:border-muted-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your school management?
          </h2>
          <p className="text-xl text-primary-100 dark:text-muted-300 mb-8">
            Join hundreds of educational institutions already using ClassBridge to transform their operations
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button 
                variant="ghost" 
                size="lg" 
                className="!bg-white !text-primary-600 !border-white hover:!bg-gray-50 hover:!text-primary-700 font-semibold shadow-lg dark:!bg-muted-800 dark:!text-white dark:hover:!bg-muted-700"
              >
                Start free trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="!border-2 !border-white !text-white hover:!bg-white hover:!text-primary-600 font-semibold dark:hover:!text-primary-500"
              >
                Schedule demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-muted-950 dark:border-t dark:border-muted-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-5 h-5 text-white">
                    <rect x="8" y="8" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <rect x="3" y="22" width="2" height="8" fill="currentColor" rx="1" />
                    <rect x="35" y="22" width="2" height="8" fill="currentColor" rx="1" />
                    <rect x="19" y="17" width="2" height="13" fill="currentColor" rx="1" />
                  </svg>
                </div>
                <span className="text-lg font-bold">ClassBridge</span>
              </div>
              <p className="text-gray-400 dark:text-muted-400">
                Streamlining educational management for institutions worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 dark:text-muted-400">
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 dark:text-muted-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/register-school" className="hover:text-white transition-colors">Register School</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 dark:text-muted-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-muted-800 mt-8 pt-8 text-center text-gray-400 dark:text-muted-400">
            <p>&copy; 2025 ClassBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
