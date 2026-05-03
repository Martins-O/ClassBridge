import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { Check, X, Mail, Clock } from 'lucide-react';

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { id: 'special', label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter your full name';
    }
    
    if (!formData.email.trim()) {
      return 'Please enter your email address';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    if (!formData.schoolName.trim()) {
      return 'Please enter your school name';
    }
    
    const allRequirementsMet = passwordRequirements.every(req => req.test(formData.password));
    if (!allRequirementsMet) {
      return 'Please meet all password requirements';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data } = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        schoolName: formData.schoolName.trim(),
      });
      
      if (data.success) {
        setSuccess(true);
      } else {
        const errorCode = data.errorCode;
        
        switch (errorCode) {
          case 'EMAIL_ALREADY_EXISTS':
          case 'EMAIL_IN_USE':
            setError('An account with this email already exists. Try signing in instead.');
            break;
          case 'SCHOOL_NAME_TAKEN':
            setError('A school with this name already exists.');
            break;
          case 'WEAK_PASSWORD':
            setError('Password is too weak. Please meet all requirements.');
            break;
          case 'INVALID_EMAIL':
            setError('Please enter a valid email address.');
            break;
          case 'VALIDATION_ERROR':
            setError(data.error || 'Please check your information and try again.');
            break;
          default:
            setError(data.error || 'Unable to create account. Please try again later.');
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string; errorCode?: string } } };
        const errorCode = axiosErr.response?.data?.errorCode;
        const errorMessage = axiosErr.response?.data?.error;
        
        switch (errorCode) {
          case 'EMAIL_ALREADY_EXISTS':
          case 'EMAIL_IN_USE':
            setError('An account with this email already exists. Try signing in instead.');
            break;
          case 'SCHOOL_NAME_TAKEN':
            setError('A school with this name already exists.');
            break;
          case 'WEAK_PASSWORD':
            setError('Password is too weak. Please meet all requirements.');
            break;
          case 'INVALID_EMAIL':
            setError('Please enter a valid email address.');
            break;
          case 'VALIDATION_ERROR':
            setError(errorMessage || 'Please check your information and try again.');
            break;
          default:
            setError(errorMessage || 'Unable to create account. Please try again later.');
        }
      } else if (err instanceof Error) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors">
          <span>←</span>
          <span>Back to Home</span>
        </Link>
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CB</span>
            </div>
            <span className="text-2xl font-bold text-text">ClassBridge</span>
          </Link>
          {success ? (
            <h1 className="text-2xl font-bold text-text">Registration Submitted</h1>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text">Create your account</h1>
              <p className="text-text-secondary mt-2">Get started with ClassBridge</p>
            </>
          )}
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your school registration for <strong>{formData.schoolName}</strong> has been submitted.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">What happens next?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your registration is pending approval from our team. You will receive an email at{' '}
                      <strong>{formData.email}</strong> once your school has been approved.
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      This typically takes 1-2 business days. After approval, you can sign in with your credentials.
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/login">
                <Button type="button" className="w-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@school.edu"
                  autoComplete="email"
                  required
                />
                
                <Input
                  label="School Name"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="Your School"
                  required
                />
                
                <div>
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                  />
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req) => {
                        const met = req.test(formData.password);
                        return (
                          <div key={req.id} className="flex items-center gap-2 text-sm">
                            {met ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={met ? 'text-green-600' : 'text-gray-500'}>
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />
                  {formData.confirmPassword.length > 0 && (
                    <p className={`mt-1 text-sm flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordsMatch ? (
                        <>
                          <Check className="h-4 w-4" />
                          Passwords match
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
              
              <p className="text-center text-text-secondary text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
