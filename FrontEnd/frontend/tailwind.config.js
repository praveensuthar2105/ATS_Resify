/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Dynamic score colors used in AtsChecker
    'bg-emerald-500', 'text-emerald-500', 'border-emerald-500',
    'bg-yellow-400', 'text-yellow-400', 'border-yellow-400',
    'bg-orange-400', 'text-orange-400', 'border-orange-400',
    'bg-red-500',    'text-red-500',    'border-red-500',
    // Opacity variants
    'bg-emerald-500/10', 'bg-emerald-500/5',
    'border-emerald-500/30', 'border-emerald-500/20',
    'bg-red-500/10', 'bg-red-500/5',
    'border-red-500/30',
    'bg-white/5', 'bg-white/10',
    // Legacy compat
    'bg-neon-green', 'text-neon-green', 'border-neon-green',
    'bg-neon-green/10', 'bg-neon-green/5',
    'border-neon-green/30', 'border-neon-green/20',
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#2563EB', // remapped to blue for legacy compat
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
