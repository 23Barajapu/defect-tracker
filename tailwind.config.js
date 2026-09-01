/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f172a',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#0a0f1d',
        },
        status: {
          open: '#3b82f6',
          retesting: '#a855f7',
          reopen: '#ef4444',
          close: '#10b981',
        },
        sev: {
          blocker: '#dc2626',
          high: '#f97316',
          medium: '#eab308',
          low: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(37, 99, 235, 0.4)',
        'glow-success': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.4)',
      }
    },
  },
  plugins: [],
}
