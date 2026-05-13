/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1e',
        surface: '#111827',
        primary: '#00d4ff', // neon cyan
        secondary: '#f59e0b', // amber
        danger: '#ef4444', // red
        success: '#10b981', // green
        muted: '#4b5563',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
