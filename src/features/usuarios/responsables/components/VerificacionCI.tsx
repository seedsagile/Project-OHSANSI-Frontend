// src/features/usuarios/responsables/components/VerificacionCI.tsx
import React from 'react'; // Necesario por BaseSyntheticEvent
import { useFormContext } from 'react-hook-form';
import { Search } from 'lucide-react';
// Asegúrate que la ruta sea correcta
import type { VerificacionCIForm } from '../utils/validations';

type VerificacionCIProps = {
  // Acepta la función envuelta por handleSubmit
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

export function VerificacionCI({ onSubmit }: VerificacionCIProps) {
  const {
    register,
    // No necesitamos handleSubmit aquí
    formState: { errors, isSubmitting }, // Usar isSubmitting del contexto
  } = useFormContext<VerificacionCIForm>();

  return (
    // Usar el prop onSubmit directamente
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="ci-verificacion" className="block text-sm font-semibold text-neutro-700">
          Verificar Carnet de Identidad <span className="text-acento-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            id="ci-verificacion"
            type="text"
            placeholder="Ej: 7912324, 7912324A, 7912324-1B"
            autoFocus
            className={`flex-grow w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.ci
                ? 'border-acento-500 focus:ring-acento-300'
                : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300'
            }`}
            // Usar register del contexto
            {...register('ci')}
          />
          <button
            type="submit"
            disabled={isSubmitting} // Deshabilitar mientras se verifica
            aria-label="Verificar Carnet de Identidad"
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={18} />
            <span>Verificar</span>
          </button>
        </div>
        {/* Mostrar mensaje de error si existe */}
        {errors.ci && (
          <p role="alert" className="mt-1 text-sm text-acento-600">{errors.ci.message}</p>
        )}
      </div>
    </form>
  );
}