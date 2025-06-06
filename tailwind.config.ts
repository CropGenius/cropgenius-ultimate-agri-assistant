import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Africa-inspired color palette
        'crop-green': {
          50: '#e6f5f0',
          100: '#ccece2',
          500: '#00875A', // Deep Green - represents fertile crops & trust
          600: '#007048',
          700: '#005C3B',
        },
        'soil-brown': {
          50: '#f9f5f0',
          100: '#f2ebe2',
          500: '#A67C52', // Warm Brown - represents soil & hard work
          600: '#8C6744',
          700: '#735536',
        },
        'sky-blue': {
          50: '#eef6fd',
          100: '#dcedfa',
          500: '#4A90E2', // Sky Blue - represents rain & growth
          600: '#2978D9',
          700: '#1A62B9',
        },
        'soft-cream': {
          50: '#FFFDF9',
          100: '#F9F7F2',
          200: '#F4F1E6', // Soft Cream - clean, easy-to-read background
          300: '#EBE6D6',
          400: '#E2DBCB',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      fontSize: {
        'xl-large': '1.375rem', // Large readable text for farmers
        '2xl-large': '1.625rem', // Extra large headers for readability
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
