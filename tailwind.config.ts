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
          50: '#F5F7FF',
          100: '#E8ECFF',
          200: '#CED7FF',
          300: '#A7BAFF',
          400: '#7E9AFF',
          500: '#5E7CE2',
          600: '#3F5EC7',
          700: '#2E45A5',
          800: '#253A86',
          900: '#1A1F36',
        },
        ink: {
          50: '#F7F9FC',
          100: '#EEF1F7',
          200: '#D9DEE9',
          300: '#B6C0D4',
          400: '#8893AE',
          500: '#5A647E',
          600: '#404963',
          700: '#2E3446',
          800: '#222838',
          900: '#1A1F2E',
        },
        surface: {
          base: '#F5F7FF',
          subtle: '#EEF1F7',
          elevated: '#FFFFFF',
          overlay: 'rgba(26, 31, 46, 0.65)',
        },
        accent: {
          sky: '#5E7CE2',
          midnight: '#1A1F36',
          coral: '#FF7B5C',
        },
        success: '#2E8E68',
        warning: '#FF7B5C',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px rgba(31, 41, 55, 0.12)',
        glass: '0 30px 60px rgba(31, 41, 55, 0.18)',
        inset: 'inset 0 2px 6px rgba(31, 41, 55, 0.08)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
        curved: '2.5rem',
      },
      backgroundImage: {
        'brand-gradient': 'radial-gradient(circle at 20% 20%, rgba(60, 77, 138, 0.14), transparent 55%), radial-gradient(circle at 80% 10%, rgba(46, 142, 104, 0.12), transparent 45%), radial-gradient(circle at 50% 80%, rgba(31, 41, 55, 0.12), transparent 55%)',
        'card-gradient': 'linear-gradient(130deg, rgba(60, 77, 138, 0.16), rgba(46, 142, 104, 0.08))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' },
        },
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
        float: 'float 12s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 14s ease-in-out infinite',
        fadeIn: 'fadeIn 0.8s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
