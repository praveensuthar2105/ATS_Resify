/** @type {import('tailwindcss').Config} */
/**
 * Tailwind v4 compat config.
 * Custom tokens (colors, fonts, shadows) are defined via @theme in index.css.
 * This file is kept for the safelist of dynamic classes used in AtsChecker / other components.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Dynamic score colors used in AtsChecker getScoreColor()
    'bg-neon-green', 'text-neon-green', 'border-neon-green',
    'bg-yellow-400', 'text-yellow-400', 'border-yellow-400',
    'bg-orange-400', 'text-orange-400', 'border-orange-400',
    'bg-red-500',    'text-red-500',    'border-red-500',
    // Opacity variants used throughout
    'bg-neon-green/10', 'bg-neon-green/5',
    'border-neon-green/30', 'border-neon-green/20',
    'bg-red-500/10', 'bg-red-500/5',
    'border-red-500/30',
    'bg-white/5', 'bg-white/10',
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
