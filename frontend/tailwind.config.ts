import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        unasp: {
          orange: "#FF6B35",
          navy: "#003366",
          blue: {
            dark: "#003d7a",
            medium: "#004d94",
          },
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
