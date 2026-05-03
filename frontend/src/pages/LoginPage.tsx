import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data } = await authService.login(email, password);
      
      if (data.success && data.accessToken && data.user) {
        login(data.user, data.accessToken, data.refreshToken || '');
        navigate('/dashboard');
      } else {
        const errorCode = data.errorCode;
        
        switch (errorCode) {
          case 'INVALID_CREDENTIALS':
          case 'INVALID_PASSWORD':
            setError('Incorrect password. Please try again or reset your password.');
            break;
          case 'USER_NOT_FOUND':
          case 'INVALID_EMAIL':
            setError('No account found with this email address.');
            break;
          case 'ACCOUNT_LOCKED':
            setError('Your account is locked. Please try again later or contact support.');
            break;
          case 'ACCOUNT_DISABLED':
            setError('Your account has been disabled. Please contact your administrator.');
            break;
          case 'PASSWORD_EXPIRED':
            navigate('/reset-password-expired');
            return;
          case 'EMAIL_NOT_VERIFIED':
            setError('Please verify your email address before signing in.');
            break;
          case 'SCHOOL_PENDING_APPROVAL':
            setError('Your school registration is pending approval. You will be notified once approved.');
            break;
          case 'SCHOOL_REJECTED':
            setError('Your school registration has been rejected. Please contact support.');
            break;
          default:
            setError(data.error || 'Unable to sign in. Please check your credentials and try again.');
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string; code?: string } } };
        const errorCode = axiosErr.response?.data?.code;
        const errorMessage = axiosErr.response?.data?.error;
        
        switch (errorCode) {
          case 'INVALID_CREDENTIALS':
          case 'INVALID_PASSWORD':
            setError('Incorrect password. Please try again or reset your password.');
            break;
          case 'USER_NOT_FOUND':
          case 'INVALID_EMAIL':
            setError('No account found with this email address.');
            break;
          case 'ACCOUNT_LOCKED':
            setError('Your account is locked. Please try again later or contact support.');
            break;
          case 'ACCOUNT_DISABLED':
            setError('Your account has been disabled. Please contact your administrator.');
            break;
          case 'PASSWORD_EXPIRED':
            navigate('/reset-password-expired');
            return;
          case 'EMAIL_NOT_VERIFIED':
            setError('Please verify your email address before signing in.');
            break;
          case 'SCHOOL_PENDING_APPROVAL':
            setError('Your school registration is pending approval. You will be notified once approved.');
            break;
          case 'SCHOOL_REJECTED':
            setError('Your school registration has been rejected. Please contact support.');
            break;
          default:
            setError(errorMessage || 'Unable to sign in. Please check your credentials and try again.');
        }
      } else if (err instanceof Error) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
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
        className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
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
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors">
          <motion.span whileHover={{ x: -5 }}>←</motion.span>
          <span>Back to Home</span>
        </Link>
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CB</span>
            </div>
            <span className="text-2xl font-bold text-text">ClassBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-text">Welcome back</h1>
          <p className="text-text-secondary mt-2">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              autoComplete="email"
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Resend Verification Email */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4 border-t"
            >
              <p className="text-sm text-text-secondary mb-3">
                Didn't receive verification email?
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex-1"
                  disabled={resendStatus === 'sending'}
                />
                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                >
                  {resendStatus === 'sending' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : resendStatus === 'sent' ? (
                    'Sent!'
                  ) : (
                    'Resend'
                  )}
                </Button>
              </div>
              {resendMessage && (
                <p className={`text-sm mt-2 ${resendStatus === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                  {resendMessage}
                </p>
              )}
            </motion.div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <p className="text-center text-text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
