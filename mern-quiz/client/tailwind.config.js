/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#F59E0B',
          foreground: '#ffffff',
        },
        background: '#0F0F1A',
        foreground: '#F1F0FB',
        card: {
          DEFAULT: '#1A1A2E',
          foreground: '#F1F0FB',
        },
        muted: {
          DEFAULT: '#374151',
          foreground: '#9CA3AF',
        },
        border: '#2D2D44',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#ffffff',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139,92,246,0.6)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
