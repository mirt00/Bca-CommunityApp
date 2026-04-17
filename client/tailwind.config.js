/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 — point to all JS/JSX/TS/TSX files in src
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './App.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand palette — customize to match your design
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        secondary: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        surface: '#f8fafc',
      },
      fontFamily: {
        // TODO: register custom fonts in app.json and load with expo-font
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
