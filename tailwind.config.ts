import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "var(--navy)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        line: "var(--line)",
        surface: "var(--surface)",
        appBg: "var(--bg)",
        upay: {
          DEFAULT: "var(--green)",
          dark: "var(--green-dark)",
          soft: "var(--green-soft)",
          light: "var(--green-mid)",
        },
        risk: {
          critical: "var(--red)",
          criticalSoft: "var(--red-soft)",
          high: "var(--orange)",
          highSoft: "var(--orange-soft)",
          medium: "var(--amber)",
          mediumSoft: "var(--amber-soft)",
          low: "var(--green)",
          lowSoft: "var(--green-soft)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        drawer: "var(--shadow-lg)",
        subtle: "var(--shadow-md)",
      },
    },
  },
  plugins: [],
} satisfies Config;
