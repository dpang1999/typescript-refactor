import type { Config } from "tailwindcss";

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
                "white": "[#FFFFFF]",
                "black": "[#000000]",
                "garbage2": "garbage1"
            },
        },
    },
} satisfies Config;
