import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep void blacks
        void: {
          950: "#08090c",
          900: "#0d0f14",
          800: "#14171f",
          700: "#1c2029",
          600: "#252a36",
        },
        // Electric spark accent
        spark: {
          50: "#fef3f2",
          100: "#ffe4e1",
          200: "#ffcdc7",
          300: "#ffa89d",
          400: "#ff6b5b",
          500: "#f94432",
          600: "#e52a17",
          700: "#c21d0e",
          800: "#9f1c10",
          900: "#841d14",
        },
        // Cool mint secondary
        mint: {
          50: "#edfff8",
          100: "#d5fff0",
          200: "#aeffdf",
          300: "#70ffc8",
          400: "#2bfba8",
          500: "#00e890",
          600: "#00c074",
          700: "#009760",
          800: "#06764e",
          900: "#076142",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px 0 rgba(249, 68, 50, 0.3)" },
          "50%": { boxShadow: "0 0 30px 5px rgba(249, 68, 50, 0.5)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};

export default config;

