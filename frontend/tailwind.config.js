/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        ink:   { DEFAULT: '#0F1117', light: '#1E2130' },
        slate: { 750: '#1E2130', 850: '#131720' },
        indigo: {
          450: '#6771F5',
          500: '#5865F2',
          600: '#4752C4',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
        },
        amber: { 400: '#FBBF24' },
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease',
        'slide-up':  'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,80%,100%': { transform: 'scale(0)', opacity: 0.5 }, '40%': { transform: 'scale(1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
