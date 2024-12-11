/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { //adding personal customization
    
    extend: { //put in extend if you want to preserve the default
      colors:{
        "inputbox-Sign":"#D9D9D9",
        "Primary/Dark":"#05477E",
        "Primary/Target":"#0FA9BE",
        "Primary/Light":"#9CE1E7",
        "Background/Bottom":"#13191D",
        "Background/Middle":"#13191D",
        "Background/Above":"#36424D",
        "Accent/Dark":"0D442B",
        "Accent/Light":"BBF7D0",
        "Accent/Target":"22C55E",
      }
    },
  },
  plugins: [],
}

