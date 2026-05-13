/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colores extraídos del logo de Taekwondo Chul Hak San
        primary: '#E63946', // Rojo fuerte del borde del logo
        primaryDark: '#B91C1C',
        accent: '#F59E0B', // Amarillo/Naranja vibrante del triángulo central
        accentLight: '#FDE047', // Amarillo claro

        // Fondos ultra limpios (Estilo Minimalista Atlético)
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',

        // Texto de alto contraste
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',

        border: 'var(--color-border)',

        success: '#10B981',
        danger: '#EF4444',
      },

      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },

      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },

      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.03)',
        glow: '0 10px 25px -5px rgba(230, 57, 70, 0.3)', // Sombra con el tono rojo principal
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
};