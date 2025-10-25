import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark-first color system inspired by VS Code/GitHub
        dark: {
          900: '#0D1117', // GitHub dark bg
          800: '#161B22', // Darker panels
          700: '#21262D', // Panel bg
          600: '#30363D', // Borders
          500: '#484F58', // Muted elements
          400: '#656D76', // Secondary text
          300: '#7D8590', // Placeholder text
          200: '#C9D1D9', // Primary text
          100: '#F0F6FC', // Bright text
        },
        // Refined neon system (reduced intensity for better UX)
        neon: {
          cyan: '#00BFFF',      // Reduced from #00D9FF for better contrast
          purple: '#7C3AED',    // Reduced from #8B5CF6 for accessibility
          green: '#10B981',     // Reduced from #00FF88 for eye comfort
          pink: '#EC4899',      // Reduced from #FF0080 for readability
          yellow: '#F59E0B',    // Reduced from #FFE135 for better contrast
          blue: '#3B82F6',      // Reduced from #0070F3 for accessibility
          orange: '#F97316',    // Reduced from #FF8C00 for better balance
        },
        // Legacy accent system for backward compatibility
        accent: {
          primary: '#00BFFF',   // Main brand color (refined cyan)
          secondary: '#6B7280', // More subtle secondary color
          success: '#10B981',   // Success states (refined green)
          warning: '#F59E0B',   // Warning states (refined yellow)
          danger: '#EF4444',    // Error states (refined red)
          info: '#3B82F6',      // Info states (refined blue)
        },
        // New semantic color system for better UX
        semantic: {
          // Primary actions - use sparingly for CTAs
          primary: {
            DEFAULT: '#00BFFF',
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#7DD3FC',
            400: '#38BDF8',
            500: '#00BFFF',
            600: '#0284C7',
            700: '#0369A1',
            800: '#075985',
            900: '#0C4A6E',
            muted: 'rgba(0, 191, 255, 0.12)',
            hover: '#00D9FF',
          },
          // Secondary actions
          secondary: {
            DEFAULT: '#6B7280',
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
            muted: 'rgba(107, 114, 128, 0.12)',
            hover: '#9CA3AF',
          },
          // Status colors with improved contrast
          success: {
            DEFAULT: '#10B981',
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
            muted: 'rgba(16, 185, 129, 0.12)',
            bg: '#064E3B',
          },
          warning: {
            DEFAULT: '#F59E0B',
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
            muted: 'rgba(245, 158, 11, 0.12)',
            bg: '#451A03',
          },
          danger: {
            DEFAULT: '#EF4444',
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#EF4444',
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
            900: '#7F1D1D',
            muted: 'rgba(239, 68, 68, 0.12)',
            bg: '#7F1D1D',
          },
          info: {
            DEFAULT: '#3B82F6',
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A',
            muted: 'rgba(59, 130, 246, 0.12)',
            bg: '#1E3A8A',
          }
        },
        // Semantic color mapping for dark theme
        background: {
          primary: '#0D1117',   // Main background
          secondary: '#161B22', // Card backgrounds
          tertiary: '#21262D',  // Elevated surfaces
          overlay: 'rgba(0, 0, 0, 0.8)', // Modal overlays
        },
        border: {
          primary: '#30363D',   // Default borders
          secondary: '#21262D', // Subtle borders
          accent: '#00BFFF',    // Highlighted borders (refined)
          muted: '#484F58',     // Very subtle borders
        },
        text: {
          primary: '#F0F6FC',   // Main text (WCAG AA compliant)
          secondary: '#C9D1D9', // Secondary text
          muted: '#7D8590',     // Muted text
          accent: '#00BFFF',    // Accent text (refined)
          inverse: '#0D1117',   // Text on light backgrounds
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Improved typography scale for better hierarchy
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1' }],            // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],         // 60px
        'code': ['0.875rem', { lineHeight: '1.5', fontFamily: 'JetBrains Mono' }],
        // Display sizes for hero text
        'display-sm': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700', letterSpacing: '-0.025em' }],
        'display-md': ['2.875rem', { lineHeight: '3rem', fontWeight: '700', letterSpacing: '-0.025em' }],
        'display-lg': ['3.75rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.025em' }],
        'display-xl': ['4.5rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.025em' }],
      },
      boxShadow: {
        // Refined glow effects (reduced intensity)
        'glow-cyan': '0 0 15px rgba(0, 191, 255, 0.2)',
        'glow-purple': '0 0 15px rgba(124, 58, 237, 0.2)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.2)',
        'glow-pink': '0 0 15px rgba(236, 72, 153, 0.2)',
        'glow-yellow': '0 0 15px rgba(245, 158, 11, 0.2)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.2)',
        // Standard elevation shadows
        'dark-soft': '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.24)',
        'dark-medium': '0 4px 16px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.3)',
        'dark-strong': '0 8px 24px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.35)',
        'dark-xl': '0 16px 48px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.4)',
        // Focus and interaction shadows
        'focus-ring': '0 0 0 2px rgba(0, 191, 255, 0.5)',
        'focus-ring-danger': '0 0 0 2px rgba(239, 68, 68, 0.5)',
        'focus-ring-success': '0 0 0 2px rgba(16, 185, 129, 0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'inner-border': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'code': '0.375rem', // 6px for code blocks
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00D9FF 0%, #8B5CF6 100%)',
        'gradient-matrix': 'linear-gradient(135deg, #00FF88 0%, #00D9FF 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        // Subtle glow pulse (reduced intensity)
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(0, 191, 255, 0.15)'
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0, 191, 255, 0.25)'
          },
        },
        // Gentle fade for status indicators
        'status-pulse': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        // Smooth slide animations
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        // Spinner animation
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Reduced matrix animation for background
        'matrix-rain': {
          '0%': { transform: 'translateY(-50vh)', opacity: '0' },
          '10%': { opacity: '0.3' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(50vh)', opacity: '0' },
        },
      },
      animation: {
        // Optimized animations with better performance
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'status-pulse': 'status-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'spin-slow': 'spin-slow 2s linear infinite',
        'matrix-rain': 'matrix-rain 8s linear infinite',
      },
      backdropBlur: {
        'dark': '16px',
      },
    },
  },
  plugins: [],
}
export default config
