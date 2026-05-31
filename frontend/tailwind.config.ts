import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css,js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f1f3d',
        'primary-mid': '#1a3a5c',
        accent: '#3b82f6',
        'accent-hover': '#2563eb',
        'accent-light': '#eff6ff',
        'gc-bg': '#f8fafc',
        'gc-border': '#e2e8f0',
        surface: '#ffffff',
        'surface-2': '#f1f5f9',
        foreground: '#0f172a',
        'foreground-2': '#334155',
        muted: '#64748b',
        'muted-2': '#94a3b8',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'xs':     '0 1px 2px rgba(15, 23, 42, 0.04)',
        'sm':     '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'md':     '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
        'lg':     '0 12px 32px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(15, 23, 42, 0.06)',
        'xl':     '0 24px 56px rgba(15, 23, 42, 0.12), 0 8px 24px rgba(15, 23, 42, 0.08)',
        'accent': '0 8px 24px rgba(59, 130, 246, 0.25)',
        'card':   '0 4px 16px rgba(15, 23, 42, 0.07)',
        'card-hover': '0 12px 36px rgba(15, 23, 42, 0.11)',
      },
      animation: {
        'shimmer': 'shimmer 1.6s infinite',
        'float': 'floatY 4.5s ease-in-out infinite',
        'blob-morph': 'blobMorph 9s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'gradient': 'gradientShift 10s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
export default config
