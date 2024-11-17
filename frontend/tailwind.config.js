/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': { 'min': '0px', 'max': '500px' },
      'sm': '500px',
      '2sm': '575px',
      'md': '640px',
      'lg': '766px',
      '2lg': '900px',
      'xl': '1024px',
      '2xl': '1280px',
    },
    extend: {
      //   :root {
      //     --color-primary: #a4e6ff;
      //     --color-secondary: #ddf6ff;
      //     --color-tertiary: #e3f7ff;
      //     --color-background-primary: #fff;
      //     --color-background-secondary: #fff;
      //     --color-background-gradient-alt: #f1fbff;
      //     --color-background-gradient-alt_2: hsla(0,0%,100%,.5);
      //     --color-text-primary: #000;
      //     --color-text-secondary: #172b4d;
      //     --color-text-tertiary: rgba(23,43,77,.6);
      //     --color-border: #a4e6ff;
      //     --color-accent: #e74c3c;
      //     --color-text-readability: #2a2e34;
      //     --color-mcq-bg: #edfaff;
      //     --color-box-shadow-primary: #e5efff;
      //     --color-external-widget-bg: #effbff;
      //     --border-radius-small: 4px;
      //     --border-radius-medium: 8px;
      //     --border-radius-large: 12px;
      //     --border-width: 1px;
      //     --shadow-sm: 0px 1px 2px rgba(0,0,0,.1);
      //     --shadow-md: 0px 3px 6px rgba(0,0,0,.15);
      //     --shadow-lg: 0px 8px 16px rgba(0,0,0,.2)
      // }


      colors: {
        //   [data-theme=dark] {
        //     --color-secondary: #2b384e;
        //     --color-background-primary: #161d29;
        //     --color-background-secondary: #2b384e;
        //     --color-background-gradient-alt: #161d29;
        //     --color-border: rgba(164,230,255,.4);
        //     --color-text-primary: hsla(0,0%,100%,.9);
        //     --color-text-secondary: hsla(0,0%,100%,.9);
        //     --color-text-tertiary: hsla(0,0%,100%,.7);
        //     --color-text-readability: hsla(0,0%,100%,.9);
        //     --color-mcq-bg: #2b384e;
        //     --color-box-shadow-primary: #000000db;
        //     --color-tertiary: #161d29;
        //     --color-background-gradient-alt_2: rgba(22,28,41,.5);
        //     --color-external-widget-bg: #1f2836;
        // }

        // 'primary': '#33F2D8',
        // 'primary2': '#1DE9B6',
        'background-primary': '#161d29', // main bg color dark
        'background-secondary': '#2b384e', // main bg 2 color dark-light
        'border': '#374151',
        'background': '#303030',
        'background-light': '#424242',
        'background-lighter': '#505050',
        'background-lightest': '#616161',
        'primary-text': '#ffffffcc',
        'primary-text2': '#ffffffa6',

        'primary': '#0078e1',
        'primaryBg': '#030014',
        'secondaryBg': '#0f172a',
        'secondaryDarkBg': '#020617',
        'secondary': '#fff',
        'dark': '#000',
        'dark-light': '#6a7280',
        'dark-lighter': '#D1D5DB',

      },
      keyframes: {
        right: {
          '0%': { transform: 'translateX(-140%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        right2: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        left: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        right: 'right .5s linear forwards',
        right2: 'right2 .5s ease-in-out forwards',
        left: 'left 0.3s linear forwards',
      },
    },
    plugins: [],
  }
}

// ## Themes ##
// teal:
//   # Main Stuff #
//   primary-color: "#1DE9B6" # Primary (most of the UI)
//   primary-background-color: "#303030" # Primary background colour (dialogs, e.t.c)
//   secondary-background-color: "#303030" # Secondary background colour (main UI background)
//   paper-card-background-color: "#424242" # Card background colour
//   paper-item-icon-color: "#1DE9B6" # Icon colour
//   primary-text-color: "#FFFFFF" # Primary text colour
//   secondary-text-color: "rgba(255, 255, 255, 0.7)" # Secondary text colour
//   disabled-text-color: "rgba(255, 255, 255, 0.5)" # Disabled text colour
//   divider-color: "rgba(255, 255, 255, 0.12)" # Divider colour
//   paper-card-header-color: "#FFFFFF" # Card header text colour

//   # Nav Menu #
//   paper-listbox-background-color: "#424242" # Listbox background colour
//   paper-listbox-color: "#FFFFFF" # Listbox text colour
//   paper-grey-200: "#616161" # Listbox selected item background colour

//   # Switches #
//   paper-toggle-button-checked-ink-color: "#1DE9B6"
//   paper-toggle-button-checked-button-color: "#1DE9B6"
//   paper-toggle-button-checked-bar-color: "#1DE9B6"

//   # Sliders #
//   paper-slider-knob-color: "#1DE9B6"
//   paper-slider-knob-start-color: "#1DE9B6"
//   paper-slider-pin-color: "#1DE9B6"
//   paper-slider-active-color: "#1DE9B6"
//   paper-slider-secondary-color: "#33F2D8"

//   table-row-alternative-background-color: "#303030"
//   paper-toggle-button-unchecked-bar-color: "#505050"