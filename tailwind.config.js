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
          DEFAULT: '#f5f1e8',
          dim: '#a8a195',
          faint: '#5c574e',
        },
        bg: {
          DEFAULT: '#0e0d12',
          raised: '#17161d',
          line: '#26242e',
        },
        sun: '#ff8a4c',
        rain: '#6dd5ed',
        go: '#b8e07a',
        stop: '#ff5a78',
      },
    },
  },
  plugins: [],
};
