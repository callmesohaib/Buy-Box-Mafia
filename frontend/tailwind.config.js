/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        black: "#000000",
        mafiaRed: "#D72638",
        richGold: "#F7C844", 
        smokeGrey: "#2F2F2F",
        dealGreen: "#1DB954", 
        cloud: "#F2F2F2", 
      },
      animation: {
        in: "in 0.2s ease-out",
        "slide-in-from-bottom-4": "slide-in-from-bottom-4 0.3s ease-out",
      },
      keyframes: {
        in: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-from-bottom-4": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
