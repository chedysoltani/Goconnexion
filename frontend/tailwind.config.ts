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
        primary: '#1a3a5c',
        accent: '#4a90d9',
        'accent-light': '#e8f2fc',
        'gc-bg': '#f7f9fc',
        'gc-border': '#e2e8f0',
        surface: '#ffffff',
        foreground: '#1a2332',
        muted: '#6b7a8d',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card-hover': '0 24px 48px rgba(26, 58, 92, 0.12)',
      },
    },
  },
  plugins: [],
}
export default config
