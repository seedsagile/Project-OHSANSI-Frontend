/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],

  theme: {
    // Tipografía global
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    },

    // Escala profesional de texto
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1.25rem" }],   // 12px
      sm: ["0.875rem", { lineHeight: "1.5rem" }],   // 14px
      base: ["1rem", { lineHeight: "1.75rem" }],    // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
      xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
      "5xl": ["3rem", { lineHeight: "1" }],           // 48px
    },

    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",   // móviles grandes
        md: "768px",   // tablets
        lg: "1024px",  // escritorio
        xl: "1280px",  // escritorio grande
        "2xl": "1440px",
      },
    },

    extend: {
      // Paleta de colores personalizada
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // color principal
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },

        // Colores secundarios
        accent: {
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },

        // Neutros
        neutral: {
          50:  "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },

        // Estados (éxito, error)
        success: {
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        warning: {
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
      },

      // Espaciados personalizados
      spacing: {
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
      },

      // Bordes y radios adicionales
      borderRadius: {
        "2xl": "1rem",     // 16px
        "3xl": "1.5rem",   // 24px
      },

      // Sombras personalizadas
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        panel: "0 0 0 1px rgba(0,0,0,0.05), 0 4px 6px -1px rgba(0,0,0,0.1)",
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
