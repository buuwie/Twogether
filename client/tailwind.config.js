import daisyui from 'daisyui'
import daisyUIThemes from "daisyui/src/theming/themes";
const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('daisyui'),
    // require('flowbite/plugin'),
  ],
  daisyui: {
		themes: [
			"light",
			{
				black: {
					...daisyUIThemes["black"],
					primary: "rgb(29, 155, 240)",
					secondary: "rgb(24, 24, 24)",
				},
			},
		],
	},
}

