/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./report.html", "./site.js"],
  theme: {
    fontFamily: {
      mono: ['"JetBrains Mono"', "ui-monospace", '"SF Mono"', "Menlo", "Consolas", "monospace"],
    },
    extend: {},
  },
  plugins: [],
};
