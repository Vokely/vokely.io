/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      screens: {
        'xxs': '420px',
        'xs': '576px',
        'sm': '640px',
        'md': '768px',
        'lap': '890px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'sxl': '1180px',
      },
      colors: {
        primary: 'rgb(52,46,229)',
        hover: 'rgb(42,36,200)',
        secondary: '#3F65FF',
        primaryHex: '#342EE5',
        halfwhite: '#e6e6e6',
      },
      borderColor: {
        halfwhite: '#e6e6e6'
      },
      dropShadow: {
        customblue: '0 4px 6px rgba(49, 104, 246, .5)',
      },
      backgroundImage: {
        blue: 'linear-gradient(135deg, rgba(49,104,246,.1) 0%, rgba(49,104,246,.1) 100%)',
        colorful: 'linear-gradient(45deg, rgba(251, 74, 29, 1) 0%, rgba(244, 129, 100, 1) 22%, rgba(231, 67, 157, 0.5) 48%, rgba(102, 132, 255, 0.7) 69.5%, rgba(132, 59, 248, 1) 87%, rgba(160, 60, 248, 1) 100%)',
      },
      backgroundColor: {
        lightviolet: "#ebdfff",
        bgviolet: '#FCFAFF',
      },
      fontFamily: {
        caveat: "var(--font-caveat)",
        roboto: "var(--font-roboto)",
        sans: "var(--font-sans)",
        ur: ["var(--font-mr)"],
        mr: ["var(--font-in)"]
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        'slide-in-down': {
          '0%': { transform: 'translate(-50%, -100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        'slide-out-up': {
          '0%': { transform: 'translate(-50%, 0)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -100%)', opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translate(-50%, 100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        'slide-out-down': {
          '0%': { transform: 'translate(-50%, 0)', opacity: '1' },
          '100%': { transform: 'translate(-50%, 100%)', opacity: '0' },
        },
        'roll': {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" }
        },
        'float': {
          "0%,100%": { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-out-left': 'slide-out-left 0.3s ease-in',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'slide-out-up': 'slide-out-up 0.3s ease-in',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-out-down': 'slide-out-down 0.3s ease-in',
        'roll': "roll 24s linear infinite",
        'float': 'float 6s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
