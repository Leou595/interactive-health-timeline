/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        clinical: {
          ink: '#172033',
          muted: '#5f6f89',
          line: '#d9e2ef',
          panel: '#f7f9fc',
          blue: '#2563eb',
          teal: '#0f766e',
          amber: '#b45309',
          red: '#b91c1c',
          green: '#15803d'
        }
      },
      boxShadow: {
        soft: '0 12px 28px rgba(16, 24, 40, 0.08)'
      }
    }
  },
  plugins: []
};
