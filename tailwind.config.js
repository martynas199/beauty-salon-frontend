export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          100: "#e9edff",
          200: "#ccd7ff",
          300: "#a4b6ff",
          400: "#7a90ff",
          500: "#586dff",
          600: "#3f52e6",
          700: "#3443ba",
          800: "#2d3994",
          900: "#283275",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.25rem",
      },
    },
  },
  plugins: [],
}
