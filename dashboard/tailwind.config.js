/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090A0F', // deep charcoal
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb', 
          900: '#1e293b',
        },
        panel: 'rgba(255, 255, 255, 0.03)', // glassmorphism
        panelBorder: 'rgba(255, 255, 255, 0.08)',
        success: '#10b981',
        warning: '#f59e0b',
        accent: '#8b5cf6', // neon purple
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-strong': '0 0 30px rgba(59, 130, 246, 0.6)',
        'success-glow': '0 0 15px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'slide': 'slide 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
