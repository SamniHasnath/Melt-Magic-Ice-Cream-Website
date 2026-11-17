/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#231A15',
        cream: '#F3E7D3',
        paper: '#FBF5EA',
        butter: '#F6D46B',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
        mint: '#1FA67F',
        danger: '#C62F4F',
      },
      fontFamily: {
        // "serif" is kept as the class name so every existing font-serif heading picks up the display face
        serif: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
        mono: ['"Courier Prime"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        soft: '0 30px 60px -30px rgba(35,26,21,.35)',
        card: '0 10px 30px -18px rgba(35,26,21,.35)',
      },
      keyframes: {
        marquee: { to: { transform: 'translateX(-50%)' } },
        bob: { '50%': { transform: 'translateY(5px)' } },
        shake: { '20%,60%': { transform: 'translateX(-8px)' }, '40%,80%': { transform: 'translateX(8px)' } },
        fall: { to: { transform: 'translateY(110vh) rotate(720deg)' } },
        jelly: { '0%,100%': { transform: 'scale(1,1)' }, '25%': { transform: 'scale(1.06,.92)' }, '45%': { transform: 'scale(.95,1.06)' }, '65%': { transform: 'scale(1.03,.97)' }, '82%': { transform: 'scale(.99,1.01)' } },
        ping2: { '0%': { transform: 'scale(.4)', opacity: '.4' }, '100%': { transform: 'scale(1.4)', opacity: '0' } },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        bob: 'bob 1.6s ease-in-out infinite',
        shake: 'shake .4s',
        fall: 'fall 1.8s cubic-bezier(.2,.6,.4,1) forwards',
        ping2: 'ping2 2s infinite',
        jelly: 'jelly .8s ease',
      },
    },
  },
  plugins: [],
};