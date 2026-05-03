import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Search, Home, Mail, ArrowRight, Frown, Map, Compass } from 'lucide-react';

const funnyMessages = [
  "Oops! This page took a sick day 🏖️",
  "Looks like this page is playing hooky 🎣",
  "This page went to the gym... and never came back 💪",
  "Houston, we have a problem... and it's a 404 🚀",
  "This page is currently binge-watching Netflix 📺",
];

export default function NotFoundPage() {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 text-8xl text-primary/5 font-bold select-none"
        >
          404
        </motion.div>
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 text-8xl text-accent/5 font-bold select-none"
        >
          404
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto relative z-10"
      >
        {/* Animated 404 Text */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8"
        >
          <motion.h1
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-none"
          >
            404
          </motion.h1>
        </motion.div>

        {/* Funny Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <p className="text-2xl md:text-3xl font-semibold text-text mb-2 flex items-center justify-center gap-2">
            <Frown className="h-8 w-8 text-yellow-500" />
            {message}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-text-secondary mb-8"
        >
          Looks like this page is playing hooky. Don't worry, we'll find it... or not.
        </motion.p>

        {/* Search Bar with funny placeholder */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSearch}
          className="flex gap-2 max-w-md mx-auto mb-8"
        >
          <Input
            type="search"
            placeholder="What were you looking for? (no guarantees)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </motion.form>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <Link to="/" className={cn(buttonVariants({ size: 'lg' }))}>
            <Home className="mr-2 h-4 w-4" />
            Take Me Home
          </Link>
          <Link to="/login" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Sign In
          </Link>
          <Link to="/register" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Register
          </Link>
        </motion.div>

        {/* Popular Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <p className="text-sm text-text-muted mb-3">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Login', 'Register', 'Features', 'Contact'].map((link) => (
              <Link
                key={link}
                to={link === 'Features' ? '/#features' : `/${link.toLowerCase()}`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                {link}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Report Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a href="mailto:support@classbridge.com" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            <Mail className="mr-2 h-3 w-3" />
            Report a broken link
          </a>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="mt-12 flex justify-center gap-8 text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span className="text-sm">Lost? Try the sitemap</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            <span className="text-sm">Or use the compass... oh wait</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
