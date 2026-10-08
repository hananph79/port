import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    fontFamily: { editorial: ['Playfair Display', 'Georgia', 'serif'], heading: ['Syne', 'sans-serif'], body: ['Inter', 'sans-serif'], mono: ['DM Mono', 'monospace'] },
    colors: { gold: { DEFAULT: '#F59E0B', dark: '#B45309', light: '#FEF3C7' }, coral: '#F97316', ink: { DEFAULT: '#1A1209', deep: '#0F0A00', darkest: '#0A0700' }, cream: { DEFAULT: '#FAFAF7', warm: '#FEF3C7' }, warm: { gray: '#78716C', border: '#E8DCC8' } },
    animation: { float: 'float 5s ease-in-out infinite', 'fade-up': 'fadeUp .5s ease-out forwards' },
    keyframes: { float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }, fadeUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } } },
    backgroundImage: { 'gradient-brand': 'linear-gradient(135deg, #F59E0B, #F97316)', 'gradient-hero': 'linear-gradient(160deg, #FAFAF7 0%, #FEF3C7 60%, #FAFAF7 100%)', 'gradient-dark': 'linear-gradient(135deg, #1A1209, #292019)' },
    boxShadow: { warm: '0 20px 60px rgba(245,158,11,.15)', card: '0 4px 24px rgba(26,18,9,.08)', 'card-hover': '0 12px 40px rgba(26,18,9,.14)', ink: '0 8px 40px rgba(26,18,9,.18)' }
  } },
  plugins: [animate]
} satisfies Config;
