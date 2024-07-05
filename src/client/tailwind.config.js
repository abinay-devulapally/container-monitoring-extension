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
    },
  },
  plugins: [
    // Add any Tailwind CSS plugins here
    // Example:
    // require('@tailwindcss/forms'),
  ],
};
