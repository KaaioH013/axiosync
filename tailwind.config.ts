import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#121212',
        'brand-green': '#25D366',
        'brand-blue': '#006AFF',
      },
      fontFamily: {
        serif: ['var(--font-poppins)'],
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}
export default config