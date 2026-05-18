import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F1ED",
        bone: "#FFFAF7",
        ink: "#1B1616",
        red: "#B61E33",
        signal: "#CF4458",
        stone: "#7C6666",
        line: "#E6D7D0",
        night: "#0D0A0B"
      },
      boxShadow: {
        soft: "0 10px 24px rgba(182, 30, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
