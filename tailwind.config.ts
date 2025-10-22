import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f5ff',
          100: '#e6e8ff',
          200: '#c7caff',
          300: '#a7abff',
          400: '#7f83ff',
          500: '#5c60ff',
          600: '#4749db',
          700: '#3838af',
          800: '#2e2c8a',
          900: '#25236f',
        },
        mint: {
          50: '#f2fbf7',
          100: '#d6f4e7',
          200: '#ade9cf',
          300: '#7cdbb5',
          400: '#52cc9d',
          500: '#3bb483',
          600: '#2e8e68',
          700: '#266f53',
          800: '#1f5743',
          900: '#1a4836',
        },
        ink: {
          50: '#f5f7fb',
          100: '#e4e9f3',
          200: '#cbd3e4',
          300: '#a7b2cf',
          400: '#7d8caf',
          500: '#5c6f96',
          600: '#44577d',
          700: '#354564',
          800: '#2c3953',
          900: '#252f45',
        },
        surface: {
          base: '#ffffff',
          subtle: '#f6f7fb',
          elevated: '#fdfdff',
          overlay: '#0c0f1b',
        },
        accent: {
          purple: '#8b5cf6',
          blue: '#4f46e5',
          pink: '#ec4899',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 15px 45px rgba(56, 80, 139, 0.15)',
        glass: '0 25px 60px rgba(76, 29, 149, 0.18)',
        inset: 'inset 0 2px 6px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
        curved: '2.5rem',
      },
      backgroundImage: {
        'brand-gradient': 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.4), transparent 55%), radial-gradient(circle at 80% 10%, rgba(236, 72, 153, 0.35), transparent 45%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.35), transparent 50%)',
        'card-gradient': 'linear-gradient(130deg, rgba(99, 102, 241, 0.18), rgba(139, 92, 246, 0.08))',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
