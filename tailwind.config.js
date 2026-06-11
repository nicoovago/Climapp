/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#1c1815',
          dim: '#6b6155',
          faint: '#a39a8b',
        },
        bg: {
          DEFAULT: '#f7f3ea',
          raised: '#ffffff',
          line: '#e5ddc9',
        },
        sun: '#e6580e',
        rain: '#0891b2',
        go: '#4d9221',
        stop: '#dc2626',
      },
    },
  },
  plugins: [],
};
