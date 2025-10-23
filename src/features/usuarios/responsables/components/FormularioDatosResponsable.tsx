// src/features/usuarios/responsables/components/FormularioDatosResponsable.tsx
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import type { ResponsableFormData } from '../utils/validations';
import type { DatosPersonaVerificada, Gestion } from '../types/index';

type FormularioDatosResponsableProps = {
  gestiones: Gestion[];
  personaVerificada: DatosPersonaVerificada | null;
  isLoading?: boolean;
};

export function FormularioDatosResponsable({
  gestiones,
  personaVerificada,
  isLoading = false,
}: FormularioDatosResponsableProps) {
  const {
    register,
    formState: { errors, isSubmitting },
    watch,
  } = useFormContext<ResponsableFormData>();

  const ciValue = watch('ci');
  const shouldDisableFields = isLoading || isSubmitting;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2">
        Datos Personales
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Nombres */}
        <div>
          <label htmlFor="nombres" className="block text-sm font-medium text-neutro-700 mb-1">
            Nombres <span className="text-acento-500">*</span>
          </label>
          <input
            id="nombres" type="text" placeholder="Ej: Juan José"
            disabled={shouldDisableFields}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.nombres ? 'border-acento-500 focus:ring-acento-300' : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300'
            } ${shouldDisableFields ? 'bg-neutro-100 cursor-not-allowed' : ''}`}
            aria-required="true"
            // --- VERIFICACIÓN ARIA ---
            aria-invalid={errors.nombres ? "true" : "false"}
            aria-describedby={errors.nombres ? 'nombres-error' : undefined}
            {...register('nombres')}
          />
          {errors.nombres?.message && <p id="nombres-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.nombres.message}</p>}
        </div>

        {/* Apellidos */}
        <div>
          <label htmlFor="apellidos" className="block text-sm font-medium text-neutro-700 mb-1">
            Apellidos <span className="text-acento-500">*</span>
          </label>
          <input
            id="apellidos" type="text" placeholder="Ej: Pérez García"
            disabled={shouldDisableFields}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.apellidos ? 'border-acento-500 focus:ring-acento-300' : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300'
            } ${shouldDisableFields ? 'bg-neutro-100 cursor-not-allowed' : ''}`}
             aria-required="true"
             // --- VERIFICACIÓN ARIA ---
             aria-invalid={errors.apellidos ? "true" : "false"}
             aria-describedby={errors.apellidos ? 'apellidos-error' : undefined}
            {...register('apellidos')}
          />
          {errors.apellidos?.message && <p id="apellidos-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.apellidos.message}</p>}
        </div>

        {/* Correo Electrónico */}
        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-neutro-700 mb-1">
            Correo Electrónico (Institucional) <span className="text-acento-500">*</span>
          </label>
          <input
            id="correo" type="email" placeholder="Ej: juan.perez@uni.edu.bo"
            disabled={shouldDisableFields}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.correo ? 'border-acento-500 focus:ring-acento-300' : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300'
            } ${shouldDisableFields ? 'bg-neutro-100 cursor-not-allowed' : ''}`}
             aria-required="true"
             // --- VERIFICACIÓN ARIA ---
             aria-invalid={errors.correo ? "true" : "false"}
             aria-describedby={errors.correo ? 'correo-error' : undefined}
            {...register('correo')}
          />
          {errors.correo?.message && <p id="correo-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.correo.message}</p>}
        </div>

        {/* Carnet de Identidad (Solo Lectura) */}
        <div>
          <label htmlFor="ci-principal" className="block text-sm font-medium text-neutro-700 mb-1">
            Carnet de Identidad
          </label>
          <input
            id="ci-principal" type="text" readOnly disabled
            className="w-full px-3 py-2 border rounded-lg bg-neutro-100 border-neutro-300 text-neutro-500 cursor-not-allowed"
            value={ciValue || ''}
            aria-label="Carnet de Identidad (no editable)"
          />
           {personaVerificada?.id_persona && (
             <p className="mt-1 text-xs text-info-600">
               Datos pre-rellenados para persona existente.
             </p>
           )}
        </div>

        {/* Celular */}
        <div>
          <label htmlFor="celular" className="block text-sm font-medium text-neutro-700 mb-1">
            Celular <span className="text-acento-500">*</span>
          </label>
          <input
            id="celular" type="tel" placeholder="Ej: 79123245" maxLength={8}
            disabled={shouldDisableFields}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.celular ? 'border-acento-500 focus:ring-acento-300' : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300'
            } ${shouldDisableFields ? 'bg-neutro-100 cursor-not-allowed' : ''}`}
              aria-required="true"
              // --- VERIFICACIÓN ARIA ---
              aria-invalid={errors.celular ? "true" : "false"}
              aria-describedby={errors.celular ? 'celular-error' : undefined}
            {...register('celular')}
          />
          {errors.celular?.message && <p id="celular-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.celular.message}</p>}
        </div>
      </div>

      {/* Sección Gestión Pasada (Opcional) */}
      <h2 className="text-lg font-semibold text-neutro-800 border-b border-neutro-200 pb-2 mt-6">
        Gestión Pasada (Opcional)
      </h2>
      <div className="relative">
        <label htmlFor="gestionPasadaId" className="block text-sm font-medium text-neutro-700 mb-1">
          Seleccione gestión pasada (si aplica)
        </label>
        <select
          id="gestionPasadaId"
          disabled={shouldDisableFields || gestiones.length === 0}
          className={`appearance-none w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
            errors.gestionPasadaId ? 'border-acento-500 focus:ring-acento-300' : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300'
          } ${shouldDisableFields || gestiones.length === 0 ? 'bg-neutro-100 cursor-not-allowed' : ''}`}
          // --- VERIFICACIÓN ARIA ---
          aria-invalid={errors.gestionPasadaId ? "true" : "false"}
          aria-describedby={errors.gestionPasadaId ? 'gestion-error' : undefined}
          {...register('gestionPasadaId')}
        >
          <option value="">{isLoading ? 'Cargando...' : gestiones.length === 0 ? 'No hay gestiones' : 'Seleccionar Gestión'}</option>
          {gestiones.map((gestion) => (
            <option key={gestion.id_gestion} value={gestion.id_gestion}>
              {gestion.nombre}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-9 h-5 w-5 text-neutro-400 pointer-events-none" aria-hidden="true" />
        {errors.gestionPasadaId?.message && <p id="gestion-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.gestionPasadaId.message}</p>}
      </div>
    </div>
  );
}