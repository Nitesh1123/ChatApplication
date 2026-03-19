import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#5865f2",
        surface: "#2b2d31",
        "chat-bg": "#313338",
        "dark-base": "#1a1b1e",
        muted: "#949ba4",
        "text-primary": "#f2f3f5",
        "text-secondary": "#949ba4",
        border: "#3f4147",
      },
      animation: {
        border: "border 4s linear infinite",
      },
      keyframes: {
        border: {
          to: { "--border-angle": "360deg" },
        },
      },
    },
  },
  daisyui: {
    themes: ["dark", "light"],
  },
  plugins: [daisyui],
};
