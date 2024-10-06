import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        "focus-yellow": "#eae80c",
        "error-red": "#ea1c0c",
      },
    },
  },
  plugins: [],
} satisfies Config;
