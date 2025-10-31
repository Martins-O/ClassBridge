'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PublicHeader } from '@/components/PublicHeader';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-muted-900 dark:to-muted-950">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About ClassBridge
          </h1>
          <p className="text-xl text-gray-600 dark:text-muted-300 mb-8">
            Bridging the gap between mentors and students with innovative educational technology
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-muted-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-muted-300 mb-4">
                ClassBridge was founded with a simple yet powerful vision: to transform how educational 
                institutions manage their operations and connect with students.
              </p>
              <p className="text-lg text-gray-600 dark:text-muted-300 mb-4">
                We believe that technology should empower educators, not complicate their work. That&apos;s 
                why we&apos;ve built a comprehensive platform that brings together class management, student 
                assessments, grade tracking, and communication tools in one intuitive interface.
              </p>
              <p className="text-lg text-gray-600 dark:text-muted-300">
                Our mission is to help schools focus on what matters most: providing quality education 
                and fostering meaningful connections between mentors and students.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-muted-800 dark:to-muted-900 rounded-2xl p-12 text-center">
              <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">500+</div>
              <div className="text-xl text-gray-700 dark:text-muted-300 mb-8">Schools Trust ClassBridge</div>
              <div className="text-6xl font-bold text-secondary-600 dark:text-secondary-400 mb-4">50K+</div>
              <div className="text-xl text-gray-700 dark:text-muted-300">Active Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-muted-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 dark:text-muted-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-muted-900 rounded-2xl p-8 shadow-card">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Innovation</h3>
              <p className="text-gray-600 dark:text-muted-300">
                We continuously evolve our platform to meet the changing needs of modern education.
              </p>
            </div>

            <div className="bg-white dark:bg-muted-900 rounded-2xl p-8 shadow-card">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Community</h3>
              <p className="text-gray-600 dark:text-muted-300">
                We foster strong connections between educators, students, and administrators.
              </p>
            </div>

            <div className="bg-white dark:bg-muted-900 rounded-2xl p-8 shadow-card">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reliability</h3>
              <p className="text-gray-600 dark:text-muted-300">
                We provide a secure, stable platform that schools can depend on every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500 dark:bg-muted-900 dark:border-t dark:border-muted-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to join our community?
          </h2>
          <p className="text-xl text-primary-100 dark:text-muted-300 mb-8">
            Start transforming your school management today
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button 
                variant="ghost" 
                size="lg" 
                className="!bg-white !text-primary-600 !border-white hover:!bg-gray-50 hover:!text-primary-700 font-semibold shadow-lg"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="!border-2 !border-white !text-white hover:!bg-white hover:!text-primary-600 font-semibold"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-muted-950 dark:border-t dark:border-muted-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 ClassBridge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
