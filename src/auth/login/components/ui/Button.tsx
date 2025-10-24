// src/auth/login/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className, // Añadir className a las props
  ...props
}) => {
  // --- ESTILOS BASE Y VARIANTES ACTUALIZADOS ---
  const baseClasses =
    'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'; // Padding ajustado a py-2.5

  const variants = {
    // Usar colores del tema principal
    primary: 'bg-principal-600 text-blanco hover:bg-principal-700 focus:ring-principal-500',
    // Secundaria (si la necesitas) - puedes ajustar colores
    secondary: 'bg-neutro-600 text-blanco hover:bg-neutro-700 focus:ring-neutro-500',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      // Combinar clases base, variantes y las que vengan de props (className)
      className={`${baseClasses} ${variants[variant]} ${className || ''}`}
    >
      {loading ? (
        <>
          {/* Añadir un spinner simple para el estado de carga */}
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
};