import { forwardRef, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Info, Mail, Smartphone, User, Hash } from 'lucide-react';
import { APELLIDO_MAX_LENGTH, CELULAR_MAX_LENGTH, CORREO_MAX_LENGTH, NOMBRE_MAX_LENGTH, type EvaluadorFormData } from '../utils/validations';
import type { DatosPersonaVerificada, Gestion } from '../types/index';

type FormularioDatosEvaluadorProps = {
  gestiones: Gestion[];
  personaVerificada: DatosPersonaVerificada | null;
  isLoading?: boolean;
  isLoadingGestiones?: boolean;
  isReadOnly?: boolean;
  onGestionSelect: (value: string | number | null) => void;
  gestionPasadaSeleccionadaId: number | null;
};

export const FormularioDatosEvaluador = forwardRef<HTMLInputElement, FormularioDatosEvaluadorProps>(
  (
    {
      gestiones,
      personaVerificada,
      isLoading = false,
      isLoadingGestiones = false,
      isReadOnly = false,
      onGestionSelect,
      gestionPasadaSeleccionadaId,
    },
    forwardedRef
  ) => {
    const {
      register,
      formState: { errors, isSubmitting },
      watch,
    } = useFormContext<EvaluadorFormData>();

    const ciValue = watch('ci');

    const disableAllPersonalAndCorreoFields = isLoading || isLoadingGestiones || isSubmitting || isReadOnly || !!personaVerificada?.Id_usuario;
    const disablePersonalFields = disableAllPersonalAndCorreoFields;
    const disableCorreoField = disableAllPersonalAndCorreoFields;
    const disableGestionPasadaBase = isLoading || isSubmitting || isReadOnly;
    const disableGestionPasada = disableGestionPasadaBase || isLoadingGestiones;
    const esUsuarioExistente = !!personaVerificada?.Id_usuario;

    const inputBaseClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors`;
    const inputNormalClass = 'border-neutro-300 focus:border-principal-500 focus:ring-principal-300';
    const inputErrorClass = 'border-acento-500 focus:ring-acento-300';
    const inputDisabledClass = 'bg-neutro-100 cursor-not-allowed text-neutro-500';
    const inputPrefilledClass = 'bg-principal-50 border-principal-200';
    const inputWithIconClass = 'pl-10';

    const { ref: rhfRefNombres, ...nombresRegisterProps } = register('nombres');
    const { ref: rhfRefCorreo, ...correoRegisterProps } = register('correo');

    const nombresRef = (el: HTMLInputElement | null) => {
        rhfRefNombres(el);
        if (!esUsuarioExistente && !isReadOnly) {
            if (typeof forwardedRef === 'function') {
                forwardedRef(el);
            } else if (forwardedRef) {
                forwardedRef.current = el;
            }
        }
    };

    const correoRef = (el: HTMLInputElement | null) => {
        rhfRefCorreo(el);
        if (esUsuarioExistente && !isReadOnly) {
            if (typeof forwardedRef === 'function') {
                forwardedRef(el);
            } else if (forwardedRef) {
                forwardedRef.current = el;
            }
        }
    };

    const gestionOptions = useMemo(() => {
        const options = gestiones.map(g => ({
            value: g.Id_olimpiada,
            label: `Gestión ${g.gestion}`
        }));
        if (!isLoadingGestiones && gestiones.length > 0) {
            return [{ value: '', label: '-- Ninguna --'}, ...options];
        }
        return options;

    }, [gestiones, isLoadingGestiones]);

    const dropdownPlaceholder = useMemo(() => {
        if (isLoadingGestiones) return 'Cargando gestiones...';
        if (gestiones.length === 0 && esUsuarioExistente && !isReadOnly) return 'No participó en gestiones anteriores';
        return '-- Seleccione Gestión (Opcional) --';
    }, [isLoadingGestiones, gestiones, esUsuarioExistente, isReadOnly]);


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
                  id="nombres" type="text" placeholder="Ej: Juan José" maxLength={NOMBRE_MAX_LENGTH}
                  disabled={disablePersonalFields}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.nombres ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disablePersonalFields ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.nombres ? "true" : "false"}
                  aria-describedby={errors.nombres ? 'nombres-error' : undefined}
                  {...nombresRegisterProps}
                />
                {esUsuarioExistente && !isReadOnly && (
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
                  id="apellidos" type="text" placeholder="Ej: Pérez García" maxLength={APELLIDO_MAX_LENGTH}
                  disabled={disablePersonalFields}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.apellidos ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disablePersonalFields ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.apellidos ? "true" : "false"}
                  aria-describedby={errors.apellidos ? 'apellidos-error' : undefined}
                  {...register('apellidos')}
                />
                {esUsuarioExistente && !isReadOnly && (
                  <span title="Campo pre-rellenado" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Info size={16} className="text-principal-500" aria-hidden="true" />
                  </span>
                )}
              </div>
              {errors.apellidos?.message && <p id="apellidos-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.apellidos.message}</p>}
            </div>

            {/* Correo Electrónico */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-neutro-700 mb-1">
                Correo Electrónico <span className="text-acento-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutro-400 pointer-events-none" aria-hidden="true" />
                <input
                  ref={correoRef}
                  id="correo" type="email" placeholder="Ej: juan.perez@example.com" maxLength={CORREO_MAX_LENGTH}
                  disabled={disableCorreoField}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.correo ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disableCorreoField ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.correo ? "true" : "false"}
                  aria-describedby={errors.correo ? 'correo-error correo-hint' : 'correo-hint'}
                  {...correoRegisterProps}
                />
                {esUsuarioExistente && !isReadOnly && (
                  <span title="Campo pre-rellenado" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Info size={16} className="text-principal-500" aria-hidden="true" />
                  </span>
                )}
              </div>
              {errors.correo?.message && <p id="correo-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.correo.message}</p>}
            </div>

            {/* Carnet de Identidad */}
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
                  id="celular" type="tel" placeholder="7xxxxxxx o 6xxxxxxx" maxLength={CELULAR_MAX_LENGTH}
                  disabled={disablePersonalFields}
                  className={`${inputBaseClass} ${inputWithIconClass} ${
                    errors.celular ? inputErrorClass : esUsuarioExistente ? inputPrefilledClass : inputNormalClass
                  } ${disablePersonalFields ? inputDisabledClass : ''}`}
                  aria-required="true"
                  aria-invalid={errors.celular ? "true" : "false"}
                  aria-describedby={errors.celular ? 'celular-error celular-hint' : 'celular-hint'}
                  {...register('celular')}
                />
                {esUsuarioExistente && !isReadOnly && (
                    <span title="Campo pre-rellenado" className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Info size={16} className="text-principal-500" aria-hidden="true" />
                    </span>
                )}
              </div>
              {errors.celular?.message && <p id="celular-error" role="alert" className="mt-1 text-xs text-acento-600">{errors.celular.message}</p>}
            </div>

          </div>
        </fieldset>

        {/* Sección Gestión Pasada */}
        {esUsuarioExistente && !isReadOnly && (
          <fieldset className="space-y-4 border border-neutro-200 p-4 rounded-lg">
            <legend className="text-lg font-semibold text-neutro-800 px-2">Gestión Pasada (Opcional)</legend>
            <div className="relative">
              <label htmlFor="gestionPasadaId-dropdown" className="block text-sm font-medium text-neutro-700 mb-1">
                Seleccione gestión pasada en la que participó
              </label>
              <CustomDropdown
                options={gestionOptions}
                selectedValue={gestionPasadaSeleccionadaId}
                onSelect={onGestionSelect}
                placeholder={dropdownPlaceholder}
                disabled={disableGestionPasada}
              />
            </div>
          </fieldset>
        )}
      </div>
    );
  }
);

FormularioDatosEvaluador.displayName = 'FormularioDatosEvaluador';