import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Crisp black-and-white base with an electric-blue accent (pixel theme).
        bg: '#F6F7F9',
        surface: '#FFFFFF',
        'surface-2': '#EDEFF5',
        border: '#DEE1EB',
        muted: '#6A6F7E',
        ink: '#0B0C10',
        text: '#0B0C10',
        brand: {
          DEFAULT: '#3D5AFE', // cobalt / electric blue
          soft: '#6E86FF',
          deep: '#2A3FD0',
        },
        good: '#0F9D6E',
        warn: '#B7791F',
        bad: '#E02424',
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
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      boxShadow: {
        glow: '0 0 0 4px rgba(61, 90, 254, 0.15)',
        card: '0 1px 2px rgba(11, 12, 16, 0.06), 0 1px 3px rgba(11, 12, 16, 0.04)',
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
