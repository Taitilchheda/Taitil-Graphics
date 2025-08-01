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
          50: '#f0f9f4',
          100: '#dcf4e3',
          200: '#bce8ca',
          300: '#8dd5a3',
          400: '#5abb75',
          500: '#167450', // Your custom green
          600: '#125d42',
          700: '#0f4a35',
          800: '#0d3c2b',
          900: '#0b3124',
        },
        secondary: {
          50: '#FFEDE9', // Your custom orange
          100: '#ffe4dd',
          200: '#ffc9bb',
          300: '#ffa389',
          400: '#ff7a56',
          500: '#ff5722',
          600: '#e64100',
          700: '#bf360c',
          800: '#9a2c08',
          900: '#7f2410',
        },
        teal: {
          50: '#f0f9f4',
          100: '#dcf4e3',
          200: '#bce8ca',
          300: '#8dd5a3',
          400: '#5abb75',
          500: '#167450', // Using your green here too
          600: '#125d42',
          700: '#0f4a35',
          800: '#0d3c2b',
          900: '#0b3124',
        },
        orange: {
          50: '#FFEDE9', // Your custom orange
          100: '#ffe4dd',
          200: '#ffc9bb',
          300: '#ffa389',
          400: '#ff7a56',
          500: '#ff5722',
          600: '#e64100',
          700: '#bf360c',
          800: '#9a2c08',
          900: '#7f2410',
        },
        // Custom brand colors
        brand: {
          green: '#167450',
          orange: '#FFEDE9',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
