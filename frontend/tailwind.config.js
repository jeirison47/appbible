/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro con clase
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
        manah: {
          bg:     'rgb(var(--manah-bg) / <alpha-value>)',
          card:   'rgb(var(--manah-card) / <alpha-value>)',
          deep:   'rgb(var(--manah-deep) / <alpha-value>)',
          gold:   'rgb(var(--manah-gold) / <alpha-value>)',
          bronze: 'rgb(var(--manah-bronze) / <alpha-value>)',
          cream:  'rgb(var(--manah-cream) / <alpha-value>)',
          muted:  'rgb(var(--manah-muted) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}

