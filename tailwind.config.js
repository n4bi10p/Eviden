/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Cyberpunk color palette (dark theme)
        'cyber': {
          'dark': '#0a0a0f',
          'darker': '#050508',
          'purple': '#8B5CF6',
          'cyan': '#00D4FF',
          'teal': '#14B8A6',
          'pink': '#EC4899',
          'blue': '#3B82F6',
          'green': '#10B981',
          'orange': '#F59E0B',
          'red': '#EF4444',
        },
        // MacOS color palette (light theme)
        'macos': {
          'blue': '#007AFF',
          'teal': '#5AC8FA',
          'green': '#34C759',
          'yellow': '#FFCC00',
          'orange': '#FF9500',
          'red': '#FF3B30',
          'pink': '#FF2D92',
          'purple': '#AF52DE',
          'gray': {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          }
        },
        // Glass effects
        'glass': {
          'dark': 'rgba(10, 10, 15, 0.8)',
          'medium': 'rgba(10, 10, 15, 0.6)',
          'light': 'rgba(10, 10, 15, 0.4)',
          'overlay': 'rgba(139, 92, 246, 0.1)',
          'white': 'rgba(255, 255, 255, 0.7)',
          'white-medium': 'rgba(255, 255, 255, 0.5)',
          'white-light': 'rgba(255, 255, 255, 0.3)',
        }
      },
      backgroundImage: {
        // Cyberpunk gradients (dark theme)
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #533483 75%, #8B5CF6 100%)',
        'cyber-radial': 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, rgba(10, 10, 15, 0.8) 70%)',
        'neon-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #00D4FF 100%)',
        'button-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #00D4FF 100%)',
        'glow-gradient': 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(0, 212, 255, 0.5) 100%)',
        
        // MacOS gradients (light theme)
        'macos-gradient': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'macos-blue-gradient': 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
        'macos-warm-gradient': 'linear-gradient(135deg, #FF9500 0%, #FF2D92 100%)',
      },
      fontFamily: {
        'cyber': ['Inter', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '20px',
        'heavy': '40px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.5)',
        'glow': '0 8px 32px rgba(139, 92, 246, 0.3)',
        'cyber': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'macos': '0 4px 20px rgba(0, 122, 255, 0.3)',
        'macos-glow': '0 8px 25px rgba(0, 122, 255, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-neon': 'pulseNeon 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
