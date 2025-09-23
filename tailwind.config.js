/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1.25rem" }],   // 12px
      sm: ["0.875rem", { lineHeight: "1.5rem" }],   // 14px
      base: ["1rem", { lineHeight: "1.75rem" }],    // 16px → texto principal
      lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px → subtítulos
      xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px → encabezados
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
      "5xl": ["3rem", { lineHeight: "1" }],           // 48px → títulos grandes
    },

    // Container responsive centrado
    container: {
      center: true,
      padding: "1rem", // 16px padding horizontal
      screens: {
        sm: "640px",    // móviles grandes
        md: "768px",    // tablets
        lg: "1024px",   // escritorio normal
        xl: "1280px",   // escritorio grande
        "2xl": "1440px",// escritorio muy grande
      },
    },

    extend: {
      colors: {
        // Marca principal: morado del dashboard
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",   // Este es el morado principal (sidebar, botones)
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#7c3aed",
        },

        // Teal (verde-agua): para botones o indicadores
        tealx: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",   // color visible en botones secundarios
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          DEFAULT: "#14b8a6",
        },

        // Amarillo para tarjetas destacadas, bloques de métricas
        amberx: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",   // amarillo principal (paneles de KPIs)
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          DEFAULT: "#f59e0b",
        },

        // ⚫⚪ Neutros para fondos, bordes, texto gris
        neutral: {
          50:  "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280", // texto secundario
          600: "#4b5563",
          700: "#374151", // texto principal oscuro
          800: "#1f2937", // encabezados o contenedores
          900: "#111827", // texto muy fuerte
        },

        // Soporte directo para `text-black`, `bg-white`
        black: "#000000",
        white: "#ffffff",

        // ✅ Colores de estados
        success: {
          500: "#22c55e", // verde éxito
          600: "#16a34a",
          700: "#15803d",
        },
        danger: {
          500: "#ef4444", // rojo error
          600: "#dc2626",
          700: "#b91c1c",
        },
        info: {
          500: "#14b8a6", // mismo que teal
          600: "#0d9488",
          700: "#0f766e",
        },
        warning: {
          500: "#f59e0b", // mismo que amber
          600: "#d97706",
          700: "#b45309",
        },
      },

      // Espaciados personalizados (puedes usar `gap-4.5`, `p-5.5`, etc.)
      spacing: {
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
      },

      // Bordes redondeados adicionales
      borderRadius: {
        "2xl": "1rem",     // 16px
        "3xl": "1.5rem",   // 24px
      },

      // Sombras suaves para tarjetas y paneles
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)", // sombra leve
        panel: "0 0 0 1px rgba(0,0,0,0.05), 0 4px 6px -1px rgba(0,0,0,0.1)", // más profunda
      },
    },
  },

  // Plugins recomendados
  plugins: [
    require("@tailwindcss/forms"),      // mejora campos de formulario
    require("@tailwindcss/typography"), // mejora textos largos (.prose)
  ],
};