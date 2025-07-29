import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Learning Agency カラーパレット
        primary: {
          DEFAULT: "#00E5FF", // 知的なシアン
          dark: "#00B8CC",
          light: "#33EAFF",
        },
        background: {
          DEFAULT: "#0F0F0F", // 黒基調
          secondary: "#1A1A1A",
          tertiary: "#2A2A2A",
        },
        text: {
          DEFAULT: "#F5F5F5", // 白文字
          secondary: "#CCCCCC",
          muted: "#999999",
        },
        border: {
          DEFAULT: "#333333",
          light: "#444444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;