/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0F1C',
        'bg-secondary': '#111827',
        'bg-tertiary': '#1F2937',
        'border-color': '#374151',
        'border-active': '#6366F1',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        'accent-indigo': '#6366F1',
        'accent-indigo-light': '#818CF8',
        'accent-emerald': '#10B981',
        'accent-red': '#EF4444',
        'accent-amber': '#F59E0B',
        'accent-blue': '#3B82F6',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
    },
  },
  plugins: [],
};
