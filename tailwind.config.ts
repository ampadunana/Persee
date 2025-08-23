import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.mdx",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "#10B981",
          blue: "#2563EB",
          glow1: "#00E5A8",
          glow2: "#1D4ED8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
      boxShadow: {
        glass: "0 4px 24px rgba(0,0,0,0.20)",
      },
      backgroundImage: {
        "grid-dark":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "grid-light":
          "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
