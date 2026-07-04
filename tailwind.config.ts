import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial black & white.
        paper: '#FFFFFF',
        'paper-2': '#FAFAF9',
        ink: '#0E0E0E',
        'ink-2': '#2A2A2A',
        muted: '#6E6E6E',
        faint: '#9B9B9B',
        line: '#EAEAE8',
        'line-2': '#DCDCD9',
        // semantic (kept monochrome-friendly)
        good: '#0E0E0E',
        bad: '#0E0E0E',
      },
      fontFamily: {
        // clean UI body
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        // heavy display grotesque
        display: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        // pixel — reserved for the microphone
        pixel: ['PixelMic', 'monospace'],
      },
      keyframes: {
        pring: {
          '0%': { transform: 'scale(0.72)', opacity: '0.55' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        },
        eq: {
          '0%,100%': { height: '7px' },
          '50%': { height: '26px' },
        },
      },
      animation: {
        pring: 'pring 1.4s steps(6) infinite',
        eq: 'eq 0.6s steps(4) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
