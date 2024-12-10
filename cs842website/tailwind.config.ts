import type { Config } from "tailwindcss";
// default theme: https://github.com/tailwindlabs/tailwindcss/blob/main/stubs/config.full.js
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  plugins: [],
    theme: {
        extend: {
            colors: {
            },
        },
    },
} satisfies Config;
