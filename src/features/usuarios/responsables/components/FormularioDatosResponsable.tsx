// src/features/usuarios/responsables/components/FormularioDatosResponsable.tsx
import React, { forwardRef } from 'react'; // Importar forwardRef
import { useFormContext } from 'react-hook-form';
// NUEVO: Importar iconos necesarios
import { ChevronDown, Info, Mail, Smartphone, User, Hash } from 'lucide-react';
// Asegúrate que las rutas sean correctas
import type { ResponsableFormData } from '../utils/validations';
import type { DatosPersonaVerificada, Gestion } from '../types/index';

type FormularioDatosResponsableProps = {
  gestiones: Gestion[];
  personaVerificada: DatosPersonaVerificada | null;
  isLoading?: boolean;
};

// --- MODIFICADO: Usar forwardRef para aceptar la ref del hook padre ---
export const FormularioDatosResponsable = forwardRef<HTMLInputElement, FormularioDatosResponsableProps>(
  ({ gestiones, personaVerificada, isLoading = false }, ref) => {
    const {
      register,
      formState: { errors, isSubmitting },
      watch,
    } = useFormContext<ResponsableFormData>();

    const ciValue = watch('ci'); // Observa el valor del CI para mostrarlo
    const shouldDisableFields = isLoading || isSubmitting; // Deshabilitar campos si está cargando o enviando
    const tieneDatosPrecargados = !!personaVerificada?.id_persona; // Booleano para fácil uso

    // --- Clases base para inputs, se modifican según estado ---
    const inputBaseClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors`;
    const inputNormalClass = 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300';
    const inputErrorClass = 'border-acento-500 focus:ring-acento-300'; // Estilo para errores
    const inputDisabledClass = 'bg-neutro-100 cursor-not-allowed text-neutro-500'; // Estilo deshabilitado
    const inputPrefilledClass = 'bg-principal-50 border-principal-200'; // Estilo para pre-rellenados
    const inputWithIconClass = 'pl-10'; // Padding izquierdo para inputs con icono

    return (
      <div className="space-y-6">
        {/* --- MODIFICADO: Uso de fieldset y legend --- */}
        <fieldset className="space-y-4 border border-neutro-200 p-4 rounded-lg">
          <legend className="text-lg font-semibold text-neutro-800 px-2">
            Datos Personales
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Nombres */}
            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-neutro-700 mb-1">
                Nombres <span className="text-acento-500">*</span>
              </label>
              {/* --- MODIFICADO: Icono y ref --- */}
              <div className="relative">
                 <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                 <input
                   ref={ref} // Asignar la ref al primer input
                   id="nombres" type="text" placeholder="Ej: Juan José"
                   disabled={shouldDisableFields}
                   className={`${inputBaseClass} ${inputWithIconClass} ${
                     errors.nombres ? inputErrorClass :
                     tieneDatosPrecargados ? inputPrefilledClass : inputNormalClass
                   } ${shouldDisableFields ? inputDisabledClass : ''}`}
                   aria-required="true"
                   aria-invalid={errors.nombres ? "true" : "false"}
                   aria-describedby={errors.nombres ? 'nombres-error' : undefined}
                   {...register('nombres')}
                 />
                 {tieneDatosPrecargados && !shouldDisableFields && (
                    <Info size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-principal-500" title="Campo pre-rellenado" aria-hidden="true" />
                 )}
               </div>
              {errors.nombres?.message && <p id="nombres-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.nombres.message}</p>}
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-neutro-700 mb-1">
                Apellidos <span className="text-acento-500">*</span>
              </label>
              {/* --- MODIFICADO: Icono --- */}
               <div className="relative">
                 <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                 <input
                   id="apellidos" type="text" placeholder="Ej: Pérez García"
                   disabled={shouldDisableFields}
                   className={`${inputBaseClass} ${inputWithIconClass} ${
                     errors.apellidos ? inputErrorClass :
                     tieneDatosPrecargados ? inputPrefilledClass : inputNormalClass
                   } ${shouldDisableFields ? inputDisabledClass : ''}`}
                   aria-required="true"
                   aria-invalid={errors.apellidos ? "true" : "false"}
                   aria-describedby={errors.apellidos ? 'apellidos-error' : undefined}
                   {...register('apellidos')}
                 />
                 {tieneDatosPrecargados && !shouldDisableFields && (
                    <Info size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-principal-500" title="Campo pre-rellenado" aria-hidden="true" />
                 )}
               </div>
              {errors.apellidos?.message && <p id="apellidos-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.apellidos.message}</p>}
            </div>

            {/* Correo Electrónico */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-neutro-700 mb-1">
                Correo Electrónico (Institucional) <span className="text-acento-500">*</span>
              </label>
              {/* --- MODIFICADO: Icono --- */}
              <div className="relative">
                 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                 <input
                   id="correo" type="email" placeholder="Ej: juan.perez@uni.edu.bo"
                   disabled={shouldDisableFields}
                   className={`${inputBaseClass} ${inputWithIconClass} ${errors.correo ? inputErrorClass : inputNormalClass} ${shouldDisableFields ? inputDisabledClass : ''}`}
                   aria-required="true"
                   aria-invalid={errors.correo ? "true" : "false"}
                   // --- MODIFICADO: aria-describedby incluye hint ---
                   aria-describedby={errors.correo ? 'correo-error correo-hint' : 'correo-hint'}
                   {...register('correo')}
                 />
              </div>
              {/* --- NUEVO: Hint --- */}
              {!errors.correo && <p id="correo-hint" className="mt-1 text-xs text-neutro-500">Debe ser un correo institucional (ej: @uni.edu.bo).</p>}
              {errors.correo?.message && <p id="correo-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.correo.message}</p>}
            </div>

            {/* Carnet de Identidad (Solo Lectura) */}
            <div>
              <label htmlFor="ci-principal" className="block text-sm font-medium text-neutro-700 mb-1">
                Carnet de Identidad
              </label>
              {/* --- MODIFICADO: Icono --- */}
              <div className="relative">
                 <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                 <input
                   id="ci-principal" type="text" readOnly disabled
                   className={`${inputBaseClass} ${inputWithIconClass} ${inputDisabledClass}`} // Clases combinadas
                   value={ciValue || ''}
                   aria-label="Carnet de Identidad (no editable)"
                 />
               </div>
            </div>

            {/* Celular */}
            <div>
              <label htmlFor="celular" className="block text-sm font-medium text-neutro-700 mb-1">
                Celular <span className="text-acento-500">*</span>
              </label>
               {/* --- MODIFICADO: Icono --- */}
              <div className="relative">
                 <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                 <input
                   id="celular" type="tel" placeholder="Ej: 79123245" maxLength={8}
                   disabled={shouldDisableFields}
                   className={`${inputBaseClass} ${inputWithIconClass} ${
                     errors.celular ? inputErrorClass :
                     tieneDatosPrecargados ? inputPrefilledClass : inputNormalClass
                   } ${shouldDisableFields ? inputDisabledClass : ''}`}
                   aria-required="true"
                   aria-invalid={errors.celular ? "true" : "false"}
                   // --- MODIFICADO: aria-describedby incluye hint ---
                   aria-describedby={errors.celular ? 'celular-error celular-hint' : 'celular-hint'}
                   {...register('celular')}
                 />
                {tieneDatosPrecargados && !shouldDisableFields && (
                    <Info size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-principal-500" title="Campo pre-rellenado" aria-hidden="true" />
                )}
               </div>
               {/* --- NUEVO: Hint --- */}
               {!errors.celular && <p id="celular-hint" className="mt-1 text-xs text-neutro-500">Número de 8 dígitos (ej: 7xxxxxxx o 6xxxxxxx).</p>}
               {errors.celular?.message && <p id="celular-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.celular.message}</p>}
            </div>
          </div>
        </fieldset>

        {/* --- MODIFICADO: Uso de fieldset y legend --- */}
        <fieldset className="space-y-4 border border-neutro-200 p-4 rounded-lg">
           <legend className="text-lg font-semibold text-neutro-800 px-2">
            Gestión Pasada (Opcional)
          </legend>
          <div className="relative">
            <label htmlFor="gestionPasadaId" className="block text-sm font-medium text-neutro-700 mb-1">
              Seleccione gestión pasada (si aplica)
            </label>
            <select
              id="gestionPasadaId"
              disabled={shouldDisableFields || gestiones.length === 0}
              className={`appearance-none w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                errors.gestionPasadaId ? inputErrorClass : inputNormalClass
              } ${shouldDisableFields || gestiones.length === 0 ? inputDisabledClass : ''}`}
              aria-invalid={errors.gestionPasadaId ? "true" : "false"}
              aria-describedby={errors.gestionPasadaId ? 'gestion-error' : undefined}
              {...register('gestionPasadaId')}
            >
              <option value="">{isLoading ? 'Cargando...' : gestiones.length === 0 ? 'No hay gestiones disponibles' : '-- Ninguna --'}</option>
              {gestiones.map((gestion) => (
                <option key={gestion.id_gestion} value={gestion.id_gestion}>
                  {gestion.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-9 h-5 w-5 text-neutro-400 pointer-events-none" aria-hidden="true" />
            {errors.gestionPasadaId?.message && <p id="gestion-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.gestionPasadaId.message}</p>}
          </div>
        </fieldset>
      </div>
    );
  }
);

// Añadir displayName para DevTools de React
FormularioDatosResponsable.displayName = 'FormularioDatosResponsable';