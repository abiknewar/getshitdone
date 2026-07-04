import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f12',
        surface: '#17171c',
        'surface-2': '#1f1f27',
        border: '#2a2a34',
        muted: '#8b8b98',
        text: '#f2f2f5',
        brand: {
          DEFAULT: '#7c5cff',
          soft: '#a78bfa',
        },
        good: '#34d399',
        warn: '#fbbf24',
        bad: '#f87171',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 0 4px rgba(124, 92, 255, 0.15)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
