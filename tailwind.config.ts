import colors from 'tailwindcss/colors'
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
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1D2F6F',
          950: '#172554',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1D2F6F',
        },
        secondary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3C138C',
        },
        muted: colors.slate,
        background: {
          primary: '#FFFFFF',
          secondary: '#F8FAFC',
          tertiary: '#EEF2FF',
          muted: '#E2E8F0',
          overlay: 'rgba(15, 23, 42, 0.45)',
        },
        surface: {
          base: '#F8FAFC',
          raised: '#FFFFFF',
          subtle: '#F1F5F9',
          inverted: '#0F172A',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          inverse: '#FFFFFF',
        },
        border: {
          primary: '#E2E8F0',
          secondary: '#F1F5F9',
          muted: '#CBD5F5',
        },
        semantic: {
          primary: {
            DEFAULT: '#2563EB',
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#2563EB',
            600: '#1D4ED8',
            700: '#1E40AF',
            800: '#1E3A8A',
            900: '#172554',
            muted: 'rgba(37, 99, 235, 0.12)',
            hover: '#1D4ED8',
          },
          secondary: {
            DEFAULT: '#7C3AED',
            50: '#F5F3FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
            300: '#C4B5FD',
            400: '#A78BFA',
            500: '#7C3AED',
            600: '#6D28D9',
            700: '#5B21B6',
            800: '#4C1D95',
            900: '#3C138C',
            muted: 'rgba(124, 58, 237, 0.12)',
            hover: '#6D28D9',
          },
          success: {
            DEFAULT: '#22C55E',
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D',
            800: '#166534',
            900: '#14532D',
            muted: 'rgba(34, 197, 94, 0.1)',
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
            muted: 'rgba(245, 158, 11, 0.1)',
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
            muted: 'rgba(239, 68, 68, 0.1)',
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
            muted: 'rgba(59, 130, 246, 0.1)',
          }
        },
        // Course colors for the colorful cards
        courses: {
          orange: '#F97316',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          green: '#22C55E',
          pink: '#EC4899',
          yellow: '#F59E0B',
          red: '#EF4444',
          indigo: '#6366F1',
          emerald: '#10B981',
          cyan: '#06B6D4',
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
        'card': '0 20px 45px -30px rgba(15, 23, 42, 0.35)',
        'card-soft': '0 14px 35px -28px rgba(15, 23, 42, 0.45)',
        'card-hover': '0 25px 55px -25px rgba(37, 99, 235, 0.35)',
        'focus-ring': '0 0 0 3px rgba(37, 99, 235, 0.35)',
        'focus-ring-danger': '0 0 0 3px rgba(239, 68, 68, 0.35)',
        'focus-ring-success': '0 0 0 3px rgba(34, 197, 94, 0.35)',
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
