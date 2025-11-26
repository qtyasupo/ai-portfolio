import type { Config } from "tailwindcss";

const config: Config = {
  // 关键修改在这里：去掉 src/，直接指向 app 和 components
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A", 
        surface: "#171717",    
        highlight: "#262626",  
        primary: "#7C3AED",    
        secondary: "#DB2777",  
        txt: {
          main: "#EDEDED",     
          dim: "#A1A1AA",      
        }
      },
    },
  },
  plugins: [],
};
export default config;