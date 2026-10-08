/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
          500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
        ink: { 950: '#0b1220', 900: '#0f172a', 800: '#1e293b', 700: '#334155', 600: '#475569', 500: '#64748b', 400: '#94a3b8' },
      },
      boxShadow: { card: '0 1px 2px rgba(15,23,42,.05), 0 1px 3px rgba(15,23,42,.04)' },
    },
  },
  plugins: [],
}
