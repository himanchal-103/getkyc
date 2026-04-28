/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0f172a",
          light: "#1e293b",
        },
        surface: "#f8fafc",
        accent: "#2563eb",
        success: "#16a34a",
        danger: "#dc2626",
        warn: "#d97706",
        muted: "#64748b",
      },
    },
  },
  plugins: [],
};
