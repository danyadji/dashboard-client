/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF9F7',
        surface: '#FFFFFF',
        'surface-muted': '#F3F0EC',
        border: '#E7E2DC',
        'text-primary': '#1F1D1B',
        'text-secondary': '#6B645E',
        'text-tertiary': '#A39B94',
        primary: {
          DEFAULT: '#A9795A',
          dark: '#8C6247',
          soft: '#D2B8A6',
          tint: '#F4ECE5',
          50: '#faf5f2',
          100: '#f3e8e0',
          500: '#a4744f',
          600: '#8a5e42',
          700: '#714a33',
        },
        success: {
          DEFAULT: '#2F9E5B',
          tint: '#E6F5EC',
        },
        warning: {
          DEFAULT: '#D98E04',
          tint: '#FDF3DC',
        },
        danger: {
          DEFAULT: '#E5484D',
          tint: '#FCE9EA',
        },
        whatsapp: '#25D366',
        'chat-bg': '#EFE7DD',
        'chat-bubble': '#E7F5D8',
      },
      borderRadius: {
        card: '20px',
        hero: '24px',
        input: '14px',
        button: '14px',
        sheet: '28px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(31, 29, 27, 0.05)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

