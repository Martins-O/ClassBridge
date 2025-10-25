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
        neon: {
          cyan: '#00D9FF',    // Electric cyan
          purple: '#8B5CF6',  // Electric purple
          green: '#00FF88',   // Matrix green
          pink: '#FF0080',    // Hot pink
          yellow: '#FFE135',  // Warning yellow
          blue: '#0070F3',    // Bright blue
          orange: '#FF8C00',  // Electric orange
        },
        accent: {
          primary: '#00D9FF',   // Main brand color (cyan)
          secondary: '#8B5CF6', // Secondary (purple)
          success: '#00FF88',   // Success states
          warning: '#FFE135',   // Warning states
          danger: '#FF0080',    // Error states
          info: '#0070F3',      // Info states
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
          accent: '#00D9FF',    // Highlighted borders
          muted: '#484F58',     // Very subtle borders
        },
        text: {
          primary: '#F0F6FC',   // Main text
          secondary: '#C9D1D9', // Secondary text
          muted: '#7D8590',     // Muted text
          accent: '#00D9FF',    // Accent text
          inverse: '#0D1117',   // Text on light backgrounds
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'code': ['0.875rem', { lineHeight: '1.5', fontFamily: 'JetBrains Mono' }],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'dark-soft': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'dark-medium': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'dark-strong': '0 16px 40px rgba(0, 0, 0, 0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
          },
          '50%': {
            boxShadow: '0 0 30px rgba(0, 217, 255, 0.6)'
          },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'matrix-rain': 'matrix-rain 3s linear infinite',
      },
      backdropBlur: {
        'dark': '16px',
      },
    },
  },
  plugins: [],
}
export default config
