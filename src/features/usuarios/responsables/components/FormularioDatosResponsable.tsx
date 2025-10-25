import React, { forwardRef } from 'react'; 
import { useFormContext } from 'react-hook-form';
import { ChevronDown, Info, Mail, Smartphone, User, Hash } from 'lucide-react';
import type { ResponsableFormData } from '../utils/validations';
import type { DatosPersonaVerificada, Gestion } from '../types/index';

type FormularioDatosResponsableProps = {
  gestiones: Gestion[];
  personaVerificada: DatosPersonaVerificada | null;
  isLoading?: boolean;
  isLoadingGestiones?: boolean;
  isReadOnly?: boolean;
  onGestionPasadaChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  gestionPasadaSeleccionada: number | null;
};

export const FormularioDatosResponsable = forwardRef<HTMLInputElement, FormularioDatosResponsableProps>(
  (
    {
      gestiones,
      personaVerificada,
      isLoading = false,
      isLoadingGestiones = false,
      isReadOnly = false,
      onGestionPasadaChange,
      gestionPasadaSeleccionada,
    },
    forwardedRef
  ) => {
    const {
      register,
      formState: { errors, isSubmitting },
      watch,
    } = useFormContext<ResponsableFormData>();

    const ciValue = watch('ci');

    const disableAllPersonalAndCorreoFields = isLoading || isLoadingGestiones || isSubmitting || isReadOnly || !!personaVerificada?.Id_usuario;

    const disablePersonalFields = disableAllPersonalAndCorreoFields;
    const disableCorreoField = disableAllPersonalAndCorreoFields; 
    
    const disableGestionPasadaBase = isLoading || isSubmitting || isReadOnly;
    //const disableGestionPasada = disableGestionPasadaBase || isLoadingGestiones || gestiones.length === 0;

    const esUsuarioExistente = !!personaVerificada?.Id_usuario;

    const inputBaseClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors`;
    const inputNormalClass = 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300';
    const inputErrorClass = 'border-acento-500 focus:ring-acento-300';
    const inputDisabledClass = 'bg-neutro-100 cursor-not-allowed text-neutro-500';
    const inputPrefilledClass = 'bg-principal-50 border-principal-200';
    const inputWithIconClass = 'pl-10';

    const { ref: rhfRefNombres, ...nombresRegisterProps } = register('nombres');
    const nombresRef = (el: HTMLInputElement | null) => {
        rhfRefNombres(el);
        if (!disablePersonalFields) { 
            if (typeof forwardedRef === 'function') {
                forwardedRef(el);
            } else if (forwardedRef) {
                forwardedRef.current = el;
            }
        }
    };
    
    const { ref: rhfRefCorreo, ...correoRegisterProps } = register('correo');
    
    return (
      <div className="space-y-6">
        <fieldset className="space-y-4 border border-neutro-200 p-4 rounded-lg">
          <legend className="text-lg font-semibold text-neutro-800 px-2">Datos Personales</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

            {/* Nombres */}
            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-neutro-700 mb-1">
                Nombres <span className="text-acento-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                <input
                  ref={nombresRef}
                  id="nombres" type="text" placeholder="Ej: Juan José"
                  disabled={disablePersonalFields}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.nombres ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disablePersonalFields ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.nombres ? "true" : "false"}
                  aria-describedby={errors.nombres ? 'nombres-error' : undefined}
                  {...nombresRegisterProps}
                />
                {esUsuarioExistente && (
                  <span title="Campo pre-rellenado" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Info size={16} className="text-principal-500" aria-hidden="true" />
                  </span>
                )}
              </div>
              {errors.nombres?.message && <p id="nombres-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.nombres.message}</p>}
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-neutro-700 mb-1">
                Apellidos <span className="text-acento-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                <input
                  id="apellidos" type="text" placeholder="Ej: Pérez García"
                  disabled={disablePersonalFields}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.apellidos ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disablePersonalFields ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.apellidos ? "true" : "false"}
                  aria-describedby={errors.apellidos ? 'apellidos-error' : undefined}
                  {...register('apellidos')}
                />
                {esUsuarioExistente && (
                  <span title="Campo pre-rellenado" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Info size={16} className="text-principal-500" aria-hidden="true" />
                  </span>
                )}
              </div>
              {errors.apellidos?.message && <p id="apellidos-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.apellidos.message}</p>}
            </div>

            {/* Correo Electrónico (Institucional) */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-neutro-700 mb-1">
                Correo Electrónico (Institucional) <span className="text-acento-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                <input
                  ref={rhfRefCorreo} 
                  id="correo" type="email" placeholder="Ej: juan.perez@uni.edu.bo"
                  disabled={disableCorreoField}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.correo ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disableCorreoField ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.correo ? "true" : "false"}
                  aria-describedby={errors.correo ? 'correo-error correo-hint' : 'correo-hint'}
                  {...correoRegisterProps}
                />
                {esUsuarioExistente && (
                  <span title="Campo pre-rellenado" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Info size={16} className="text-principal-500" aria-hidden="true" />
                  </span>
                )}
              </div>
              {!errors.correo && <p id="correo-hint" className="mt-1 text-xs text-neutro-500">Debe ser un correo institucional (ej: @uni.edu.bo).</p>}
              {errors.correo?.message && <p id="correo-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.correo.message}</p>}
            </div>

            {/* Carnet de Identidad (Siempre deshabilitado) */}
            <div>
              <label htmlFor="ci-principal" className="block text-sm font-medium text-neutro-700 mb-1">
                Carnet de Identidad
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                <input
                  id="ci-principal" type="text" readOnly disabled
                  className={`${inputBaseClass} ${inputWithIconClass} ${inputDisabledClass}`}
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
              <div className="relative">
                <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                <input
                  id="celular" type="tel" placeholder="Ej: 79123245" maxLength={8}
                  disabled={disablePersonalFields}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.celular ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disablePersonalFields ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.celular ? "true" : "false"}
                  aria-describedby={errors.celular ? 'celular-error celular-hint' : 'celular-hint'}
                  {...register('celular')}
                />
                {esUsuarioExistente && (
                    <span title="Campo pre-rellenado" className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Info size={16} className="text-principal-500" aria-hidden="true" />
                    </span>
                )}
              </div>
              {!errors.celular && <p id="celular-hint" className="mt-1 text-xs text-neutro-500">Número de 8 dígitos (ej: 7xxxxxxx o 6xxxxxxx).</p>}
              {errors.celular?.message && <p id="celular-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.celular.message}</p>}
            </div>

          </div>
        </fieldset>

        {/* Sección Gestión Pasada (solo visible si es usuario existente Y NO es readOnly) */}
        {esUsuarioExistente && !isReadOnly && (
          <fieldset className="space-y-4 border border-neutro-200 p-4 rounded-lg">
            <legend className="text-lg font-semibold text-neutro-800 px-2">Gestión Pasada (Opcional)</legend>
            <div className="relative">
              <label htmlFor="gestionPasadaId" className="block text-sm font-medium text-neutro-700 mb-1">
                Seleccione gestión pasada en la que participó
              </label>
              <select
                id="gestionPasadaId"
                value={gestionPasadaSeleccionada ?? ''}
                onChange={onGestionPasadaChange}
                disabled={disableGestionPasadaBase}
                className={`appearance-none w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                  inputNormalClass
                } ${disableGestionPasadaBase ? inputDisabledClass : ''}`}
              >
                <option value="">
                  {isLoadingGestiones ? 'Cargando gestiones...' :
                    gestiones.length === 0 ? 'No participó en gestiones anteriores' :
                    '-- Ninguna --'
                  }
                </option>
                {gestiones.map((g) => (
                  <option
                    key={g.Id_olimpiada}
                    value={g.Id_olimpiada}
                    data-gestion={g.gestion}
                  >
                    Gestión {g.gestion}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-9 h-5 w-5 text-neutro-400 pointer-events-none" aria-hidden="true" />
            </div>
          </fieldset>
        )}
      </div>
    );
  }
);

FormularioDatosResponsable.displayName = 'FormularioDatosResponsable';