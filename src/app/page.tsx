import Link from "next/link";
import ClassBridgeLogo from "@/components/ClassBridgeLogo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto backdrop-blur-sm">
        <ClassBridgeLogo size="md" />
        <div className="flex items-center space-x-6">
          <Link
            href="/login"
            className="text-gray-600 hover:text-indigo-600 transition-colors font-medium hover:bg-white/50 px-4 py-2 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center">
          <div className="animate-fadeIn relative">
            {/* Floating Elements */}
            <div className="absolute -top-10 left-1/4 w-4 h-4 bg-indigo-300 rounded-full animate-bounce delay-300 opacity-60"></div>
            <div className="absolute -top-5 right-1/3 w-3 h-3 bg-purple-300 rounded-full animate-bounce delay-700 opacity-60"></div>
            <div className="absolute top-5 left-1/6 w-2 h-2 bg-cyan-300 rounded-full animate-bounce delay-1000 opacity-60"></div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
              <span className="text-gray-900 block mb-3">Transform Your</span>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Educational Ecosystem
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
              Empower educators, engage students, and streamline school operations with the most intuitive educational management platform built for the modern classroom.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm md:text-base">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-indigo-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">10,000+ Students Connected</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">500+ Schools Trust ClassBridge</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/register"
                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-3xl shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-lg">Get Started Free</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>

              <Link
                href="/login"
                className="group px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <span>Sign In</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Modern Education</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From enrollment to graduation, ClassBridge provides the tools educators need to create meaningful learning experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-blue-100/50">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Unified School Management</h3>
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                Centralize all school operations with intuitive dashboards for administrators, streamlined class organization, and comprehensive reporting.
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Save 15+ hours/week
                </span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-green-50/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-green-100/50">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Smart Student Onboarding</h3>
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                Automated invitation system with secure registration, instant class enrollment, and personalized welcome experiences for every student.
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  90% faster enrollment
                </span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-purple-100/50">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Real-Time Analytics</h3>
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                Track student progress with advanced analytics, generate detailed performance reports, and make data-driven educational decisions.
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Live insights
                </span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-orange-100/50">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Seamless Communication</h3>
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                Connect mentors, students, and administrators with built-in messaging, announcement systems, and collaborative workspaces.
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Instant connection
                </span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-indigo-100/50">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Enterprise Security</h3>
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                Bank-level security with role-based access control, data encryption, and compliance with educational privacy standards.
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  FERPA compliant
                </span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-teal-50/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-teal-100/50">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Lightning Fast Setup</h3>
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                Get your school running on ClassBridge in under 15 minutes with our guided setup wizard and migration tools.
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  Ready in 15 min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mt-32 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Educational Leaders Worldwide</h2>
            <p className="text-gray-600">Join thousands of schools already transforming education with ClassBridge</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
            <div className="flex items-center justify-center p-4 bg-white/50 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">500+</div>
                <div className="text-sm text-gray-500">Schools</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 bg-white/50 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">10,000+</div>
                <div className="text-sm text-gray-500">Students</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 bg-white/50 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">1,200+</div>
                <div className="text-sm text-gray-500">Mentors</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 bg-white/50 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">50+</div>
                <div className="text-sm text-gray-500">Countries</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Educational Experience?
                </span>
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Join the educational revolution. Start connecting mentors and students like never before.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center space-x-3 bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold hover:bg-gray-50 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Join ClassBridge Today</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  <span>Existing User? Sign In</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              </div>
              <div className="mt-8 text-sm opacity-75">
                <p>✨ Free 30-day trial • No credit card required • Setup in 15 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Company Info */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3 mb-6">
                    <ClassBridgeLogo size="lg" />
                  </div>
                  <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                    Transforming education through innovative technology that connects mentors and students,
                    creating meaningful learning experiences for the digital age.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.311-.623-.311-1.544c0-1.446.839-2.525 1.883-2.525.888 0 1.317.666 1.317 1.466 0 .893-.568 2.229-.861 3.467-.245 1.04.522 1.887 1.55 1.887 1.862 0 3.293-1.964 3.293-4.799 0-2.51-1.804-4.266-4.384-4.266-2.988 0-4.749 2.239-4.749 4.555 0 .901.347 1.869.78 2.392.086.103.097.194.072.299-.08.33-.256 1.056-.292 1.204-.047.193-.153.233-.354.14-1.315-.613-2.138-2.538-2.138-4.088 0-3.307 2.402-6.344 6.924-6.344 3.638 0 6.469 2.592 6.469 6.056 0 3.616-2.28 6.524-5.44 6.524-1.062 0-2.065-.552-2.407-1.211 0 0-.527 2.006-.656 2.497-.237.913-.878 2.058-1.307 2.754C9.003 23.677 10.463 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Product Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Security</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Integrations</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">API Docs</a></li>
                  </ul>
                </div>

                {/* Support Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Help Center</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Community</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact Us</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Status Page</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Training</a></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-200/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-500 text-sm mb-4 md:mb-0">
                  © 2024 ClassBridge. All rights reserved.
                </div>
                <div className="flex space-x-6 text-sm">
                  <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</a>
                  <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</a>
                  <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
