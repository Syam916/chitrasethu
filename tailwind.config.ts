import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
      },
      colors: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fadeInUp": {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slideInRight": {
          from: {
            opacity: "0",
            transform: "translateX(50px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(45 86% 68% / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(45 86% 68% / 0.4)",
          },
        },
        "kenBurns": {
          "0%": {
            transform: "scale(1) rotate(0deg)",
          },
          "50%": {
            transform: "scale(1.1) rotate(0.5deg)",
          },
          "100%": {
            transform: "scale(1.05) rotate(0deg)",
          },
        },
        "parallaxFloat": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px)",
          },
          "25%": {
            transform: "translateY(-15px) translateX(5px)",
          },
          "50%": {
            transform: "translateY(-10px) translateX(-5px)",
          },
          "75%": {
            transform: "translateY(-20px) translateX(3px)",
          },
        },
        "gradientShift": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        "subtleZoom": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.02)",
          },
        },
        "floatingParticles": {
          "0%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.7",
          },
          "33%": {
            transform: "translateY(-30px) rotate(120deg)",
            opacity: "1",
          },
          "66%": {
            transform: "translateY(-10px) rotate(240deg)",
            opacity: "0.8",
          },
          "100%": {
            transform: "translateY(0px) rotate(360deg)",
            opacity: "0.7",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "fadeInUp": "fadeInUp 0.6s ease-out",
        "slideInRight": "slideInRight 0.6s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "kenBurns": "kenBurns 20s ease-in-out infinite",
        "parallaxFloat": "parallaxFloat 8s ease-in-out infinite",
        "gradientShift": "gradientShift 6s ease-in-out infinite",
        "subtleZoom": "subtleZoom 15s ease-in-out infinite",
        "floatingParticles": "floatingParticles 12s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
