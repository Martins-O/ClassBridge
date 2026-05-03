import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-primary"
          >
            ClassBridge
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#schools" className="text-sm font-medium hover:text-primary transition-colors">
            Schools
          </a>
          <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
