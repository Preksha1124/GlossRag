/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1F3B",       // primary dark, headers & nav
        canvas: "#F7F5F0",    // page background
        slate: "#4A5160",     // body text
        amber: "#F2A93B",     // raw / detected signal
        mint: "#3FB8A6",      // corrected / confirmed output
        coral: "#E85D4C",     // live / recording indicator
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(27, 31, 59, 0.06)",
      },
    },
  },
  plugins: [],
};
