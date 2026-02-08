import type { Config } from "tailwindcss";

// Note: Tailwind v4 uses CSS-based config. Dark mode is configured in style.css
// using @custom-variant. This file is kept for IDE support and future compatibility.
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
