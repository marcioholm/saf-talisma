import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2F6F4',
          100: '#E2EAE6',
          200: '#C4D5CD',
          300: '#9CB8AB',
          400: '#6F9584',
          500: '#3F7761',
          600: '#1F5C47',
          700: '#1A4C3A',
          800: '#163D30',
          900: '#0F2C23',
          950: '#0A2119',
        },
        accent: {
          50: '#F5F8EF',
          100: '#E9F0D8',
          200: '#D3E1AF',
          300: '#BCD286',
          400: '#A6C160',
          500: '#8FAE41',
          600: '#748F30',
          700: '#5A7026',
          800: '#465A1F',
          900: '#394818',
        },
        paper: '#F7F5F1',
        ink: '#12150F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
