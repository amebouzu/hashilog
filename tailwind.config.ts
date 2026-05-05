import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        racing: {
          red: "#e10600",
          black: "#0a0a0a",
          gray: "#1a1a1a"
        }
      }
    }
  },
  plugins: []
};

export default config;
