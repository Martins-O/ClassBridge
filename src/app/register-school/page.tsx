'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SchoolRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current user ID (this would need to be implemented with proper auth)
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        setError('Please log in first');
        return;
      }

      const userData = await userResponse.json();
      const adminId = userData.user.id;

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          adminId
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to register school');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="min-h-screen flex relative z-10">
        {/* Left Side - Information */}
        <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden transform transition-all duration-1000 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
          {/* Information side background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="w-2 h-2 bg-white/20 rounded-full absolute top-20 left-20 animate-pulse"></div>
            <div className="w-1 h-1 bg-white/20 rounded-full absolute top-32 left-32 animate-pulse delay-500"></div>
            <div className="w-3 h-3 bg-white/20 rounded-full absolute top-40 left-16 animate-pulse delay-1000"></div>
            <div className="w-2 h-2 bg-white/20 rounded-full absolute bottom-32 right-20 animate-pulse delay-300"></div>
            <div className="w-1 h-1 bg-white/20 rounded-full absolute bottom-20 right-32 animate-pulse delay-700"></div>
          </div>

          <div className="relative flex flex-col justify-center items-start p-16 text-white">
            <div className={`transform transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-6 leading-tight">
                  Transform Your School with
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                    SurveyPro Education
                  </span>
                </h1>
                <p className="text-xl text-indigo-100 leading-relaxed mb-8">
                  Register your educational institution and unlock powerful tools for managing classes, conducting assessments, and tracking student progress.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">Comprehensive class management</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">Advanced assessment tools</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">Real-time analytics & reporting</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">Secure student data management</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className={`w-full max-w-2xl transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 lg:p-10 hover:shadow-3xl transition-all duration-500 h-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="lg:hidden mb-6">
                  <Link href="/" className="inline-flex items-center space-x-2 group">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                      SurveyPro
                    </span>
                  </Link>
                </div>
                <div className={`transform transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Register Your School</h1>
                  <p className="text-gray-600">Create your institution profile and start building the future of education</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/90 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* School Name */}
                <div className={`transform transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label htmlFor="name" className={`block text-base font-semibold mb-4 transition-colors duration-300 ${focusedField === 'name' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    School Name *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`relative w-full px-6 py-4 pr-14 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium text-lg ${
                        focusedField === 'name'
                          ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="e.g., Springfield Elementary School"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'name' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">The official name of your educational institution</p>
                </div>

                {/* Email */}
                <div className={`transform transition-all duration-500 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label htmlFor="email" className={`block text-base font-semibold mb-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    Official School Email *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`relative w-full px-6 py-4 pr-14 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium text-lg ${
                        focusedField === 'email'
                          ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="admin@springfield-elementary.edu"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'email' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Primary email for administrative communications</p>
                </div>

                {/* Phone */}
                <div className={`transform transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label htmlFor="phone" className={`block text-base font-semibold mb-4 transition-colors duration-300 ${focusedField === 'phone' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField('')}
                      className={`relative w-full px-6 py-4 pr-14 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium text-lg ${
                        focusedField === 'phone'
                          ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'phone' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Main contact number for your school</p>
                </div>

                {/* Address */}
                <div className={`transform transition-all duration-500 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label htmlFor="address" className={`block text-base font-semibold mb-4 transition-colors duration-300 ${focusedField === 'address' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    School Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('address')}
                      onBlur={() => setFocusedField('')}
                      className={`relative w-full px-6 py-4 pr-14 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium text-lg ${
                        focusedField === 'address'
                          ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="123 Education Ave, Springfield, ST 12345"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'address' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Physical location of your institution</p>
                </div>

                {/* Website */}
                <div className={`transform transition-all duration-500 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label htmlFor="website" className={`block text-base font-semibold mb-4 transition-colors duration-300 ${focusedField === 'website' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    School Website
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('website')}
                      onBlur={() => setFocusedField('')}
                      className={`relative w-full px-6 py-4 pr-14 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium text-lg ${
                        focusedField === 'website'
                          ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="https://www.springfield-elementary.edu"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'website' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Your school's official website (optional)</p>
                </div>

                {/* Description */}
                <div className={`transform transition-all duration-500 delay-800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <label htmlFor="description" className={`block text-base font-semibold mb-4 transition-colors duration-300 ${focusedField === 'description' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    School Description
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField('')}
                      rows={4}
                      className={`relative w-full px-6 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium text-lg resize-none ${
                        focusedField === 'description'
                          ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Tell us about your school's mission, values, and what makes it special..."
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Brief overview of your educational institution</p>
                </div>

                {/* Submit Button */}
                <div className={`transform transition-all duration-500 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-5 px-8 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 active:translate-y-0 active:shadow-lg disabled:transform-none text-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2 relative z-10">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="animate-pulse">Registering School...</span>
                      </div>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>Register School</span>
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>

                {/* Back to Dashboard */}
                <div className={`text-center transform transition-all duration-500 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <p className="text-gray-600 mb-2">
                    Already have a school registered?{' '}
                    <Link
                      href="/dashboard"
                      className="relative text-indigo-600 hover:text-indigo-700 font-semibold transition-all duration-300 group"
                    >
                      <span className="relative z-10">Go to Dashboard</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10 rounded"></span>
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}