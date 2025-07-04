import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // God-Mode CropGenius Palette
        "crop-green": {
          50: "#e6f5f0",
          100: "#ccece2",
          500: "#00875A", 
          600: "#007048",
          700: "#005C3B",
        },
        "soil-brown": {
          50: "#f9f5f0",
          100: "#f2ebe2",
          500: "#A67C52", 
          600: "#8C6744",
          700: "#735536",
        },
        "sky-blue": {
          50: "#eef6fd",
          100: "#dcedfa",
          500: "#4A90E2", 
          600: "#2978D9",
          700: "#1A62B9",
        },
        "soft-cream": {
          50: "#FFFDF9",
          100: "#F9F7F2",
          200: "#F4F1E6", 
          300: "#EBE6D6",
          400: "#E2DBCB",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "god-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(16, 185, 129, 0.6)" },
        },
        "god-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "god-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "god-glow": "god-glow 3s ease-in-out infinite",
        "god-float": "god-float 4s ease-in-out infinite",
        "god-pulse": "god-pulse 2s ease-in-out infinite",
      },
      boxShadow: {
        'god': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(16, 185, 129, 0.1)',
        'god-sm': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 0 15px rgba(16, 185, 129, 0.05)',
        'god-lg': '0 35px 70px -15px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function({ addUtilities, addComponents }) {
      addUtilities({
        '.glass-god': {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        },
        '.neo-morph': {
          background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
          boxShadow: '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff',
        },
        '.god-gradient': {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)',
        },
      });
      
      addComponents({
        '.btn-god': {
          '@apply px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-2xl shadow-god transition-all duration-300 hover:shadow-god-lg hover:scale-105 active:scale-95': {},
        },
        '.card-god': {
          '@apply bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-god': {},
        },
        '.text-god': {
          '@apply bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent font-bold': {},
        },
      });
    }),
  ],
} satisfies Config;
