'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClassBridgeLogo from '@/components/ClassBridgeLogo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after registration
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        if (loginResponse.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-6 leading-tight">
                  Join educators using
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                    ClassBridge
                  </span>
                </h1>
                <p className="text-xl text-indigo-100 leading-relaxed mb-8">
                  Create your account and start connecting mentors with students through comprehensive educational management.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">Free to get started</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">No credit card required</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">Comprehensive class management</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-indigo-100">Student progress tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className={`w-full max-w-md transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="lg:hidden mb-6">
                  <Link href="/" className="inline-block group">
                    <ClassBridgeLogo size="lg" className="group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                </div>
                <div className={`transform transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Create Account</h1>
                  <p className="text-gray-600">Start your educational management journey</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`transform transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <label htmlFor="name" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'name' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Full Name
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
                  className={`relative w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                    focusedField === 'name'
                      ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'name' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`transform transition-all duration-500 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <label htmlFor="email" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'email' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Email Address
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
                  className={`relative w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                    focusedField === 'email'
                      ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === 'email' ? 'text-indigo-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`transform transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <label htmlFor="password" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${focusedField === 'password' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  required
                  className={`relative w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                    focusedField === 'password'
                      ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter your password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level
                            ? passwordStrength <= 2
                              ? 'bg-red-400'
                              : passwordStrength <= 3
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Password strength: {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div className={`transform transition-all duration-500 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  required
                  className={`relative w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 font-medium ${
                    focusedField === 'confirmPassword'
                      ? 'border-indigo-500 ring-2 ring-indigo-200 scale-[1.02] shadow-lg'
                      : formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 hover:border-red-400'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 hover:border-green-400'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs text-green-600">Passwords match</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-xs text-red-600">Passwords don&apos;t match</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className={`transform transition-all duration-500 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 active:translate-y-0 active:shadow-lg disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="animate-pulse">Creating Account...</span>
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className={`mt-8 text-center transform transition-all duration-500 delay-800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="relative text-indigo-600 hover:text-indigo-700 font-semibold transition-all duration-300 group"
              >
                <span className="relative z-10">Sign in here</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10 rounded"></span>
              </Link>
            </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}