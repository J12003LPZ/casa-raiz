export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F3EBDD',
        paper: '#F8F2E8',
        burgundy: '#6E1E1D',
        wine: '#451512',
        terracotta: '#A34F37',
        charcoal: '#201C19',
        olive: '#69705A',
        gold: '#C79A4A',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(38, 21, 16, .10)',
      },
      opacity: {
        45: '.45',
        52: '.52',
        55: '.55',
        58: '.58',
        62: '.62',
        65: '.65',
        68: '.68',
        72: '.72',
        78: '.78',
        85: '.85',
      },
    },
  },
  plugins: [],
}
