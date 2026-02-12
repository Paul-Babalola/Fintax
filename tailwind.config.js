const animate = require("tailwindcss-animate");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  safelist: ["dark"],
  prefix: "",

  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      screens: {
        windows: { max: "1440px" },
        "ultra-wide": "3200px", // For ultra-wide screens like 3456x2234
        "5xl": "2560px", // Intermediate ultra-wide
        "6xl": "3200px", // Large ultra-wide
        "7xl": "3456px", // Target resolution
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        roobert: ["Roobert", "Inter", "sans-serif"],
        rebond: ["Rebond Grotesque", "Syne", "Space Grotesk", "sans-serif"],
        "rebond-grotesque": [
          "Rebond Grotesque",
          "Syne",
          "Space Grotesk",
          "sans-serif",
        ],
        "roobert-font": ["Roobert", "Inter", "sans-serif"],
      },
      fontSize: {
        xxs: "0.4rem",
        sm: "0.8rem",
        base: "1rem",
        xl: "1.25rem",
        "2xl": "1.563rem",
        "3xl": "1.953rem",
        "4xl": "2.441rem",
        "5xl": "3.052rem",
        "6xl": "3.815rem",
        "7xl": "4.768rem",
        "8xl": "5.960rem",
        "9xl": "7.450rem",
      },
      fontWeight: {
        thin: "50",
        hairline: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      colors: {
        "design-bg": "#F1F4F9",
        "engineering-bg": "#070F2B",
        "grays-300": "#D1D5DB",
        "grays-600": "#4B5563",
        "primary-green-700": "#15803D",
        "primary-green-600": "#16A34A",
        "primary-green-200": "#BBF7D0",
        "primary-indigo-800": "#3730A3",
        "primary-indigo-100": "#E0E7FF",
        "neutral-bg": "#F9FAFB",
        
        // Dark mode color palette
        dark: {
          50: "#0a0a0a",
          100: "#1a1a1a",
          200: "#2d2d2d",
          300: "#404040",
          400: "#525252",
          500: "#737373",
          600: "#a3a3a3",
          700: "#d4d4d4",
          800: "#e5e5e5",
          900: "#f5f5f5",
        },
        indigo: {
          50: "#F4F0F7",
          100: "#DACCE0",
          200: "#B499C2",
          400: "#693385",
          500: "#440066",
          600: "#360052",
          700: "#29003D",
          800: "#1B0029",
        },

        gray: {
          50: "#F4F3F5",
          100: "#E6E7EC",
          150: "#EBE9EC",
          200: "#CDD0D8",
          250: "#FCFCFD",
          300: "#B3B8C5",
          400: "#9AA1B1",
          500: "#776D7D",
          600: "#676E7E",
          700: "#3E3841",
          800: "#34373F",
          900: "#0F0E10",
          950: "#384047",
        },

        green: {
          600: "#33662E",
          700: "#4D9944",
        },
        success: {
          50: "#00A09B",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        none: "none",
        "gradient-to-t": "linear-gradient(to top, var(--tw-gradient-stops))",
        "gradient-to-tr":
          "linear-gradient(to top right, var(--tw-gradient-stops))",
        "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
        "gradient-to-br":
          "linear-gradient(to bottom right, var(--tw-gradient-stops))",
        "gradient-to-b": "linear-gradient(to bottom, var(--tw-gradient-stops))",
        "gradient-to-bl":
          "linear-gradient(to bottom left, var(--tw-gradient-stops))",
        "gradient-to-l": "linear-gradient(to left, var(--tw-gradient-stops))",
        "gradient-to-tl":
          "linear-gradient(to top left, var(--tw-gradient-stops))",
        "gradient-166": "linear-gradient(24deg, var(--tw-gradient-stops))",
        "gradient-94": "linear-gradient(94deg, var(--tw-gradient-stops))",
        "gradient-180": "linear-gradient(180deg, var(--tw-gradient-stops))",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        rebond: ["Rebond Grotesque", "Space Grotesk", "sans-serif"],
        roobert: ["Roobert", "Inter", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "collapsible-down": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-in-out",
        "collapsible-up": "collapsible-up 0.2s ease-in-out",
      },
    },
  },
  plugins: [animate],
};
