/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",
    "./**/*.jsx",
    // Add any other paths to your JSX or HTML files that contain Tailwind classes.
  ],
  theme: {
    extend: {
      // Optionally extend Tailwind's default theme here
      tooltip: {
        DEFAULT: {
          bg: "black",
          text: "white",
          borderRadius: "0.375rem",
          padding: "0.5rem",
        },
      },
      colors: {
        "tooltip-bg": "#000",
        "tooltip-text": "#fff",
      },
    },
  },
  plugins: [
    // Add any Tailwind CSS plugins here
    // Example:
    // require('@tailwindcss/forms'),
  ],
};
