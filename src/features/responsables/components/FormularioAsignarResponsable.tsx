import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { FormularioData } from '../types/IndexResponsable';
import { handlePaste, restringirCaracteres } from '../utils/formUtils';
import { NOMBRE_MAX_LENGTH, CARACTERES_ACETADOS_NOMBRE_COMPLETO, CARACTERES_ACETADOS_EMAIL, CI_MAX_LENGTH, CARACTERES_ACETADOS_CI, CODIGO_MAX_LENGTH, CARACTERES_ACETADOS_CODIGO } from '../utils/resposableVarGlobalesUtils';

type Props = {
  register: UseFormRegister<FormularioData>;
  errors: FieldErrors<FormularioData>;
  setValue: UseFormSetValue<FormularioData>;
};

export function FormularioAsignarResponsable({ register, errors, setValue }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutro-800">Datos del Responsable</h2>
      
      <div>
        <label htmlFor="nombreCompleto" className="block text-md font-medium text-neutro-600 mb-1">
          Nombre completo del responsable
        </label>
        <input
          type="text"
          id="nombreCompleto"
          placeholder="Ingrese el nombre y apellidos"
          maxLength={NOMBRE_MAX_LENGTH}
          onPaste={(e) => handlePaste(e, setValue, 'nombreCompleto', CARACTERES_ACETADOS_NOMBRE_COMPLETO)}
          onKeyDown={(e) => restringirCaracteres(e, CARACTERES_ACETADOS_NOMBRE_COMPLETO)}         
          {...register('nombreCompleto')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.nombreCompleto ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.nombreCompleto && <p className="text-acento-600 text-sm mt-1">{errors.nombreCompleto.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-md font-medium text-neutro-600 mb-1">
          Correo electrónico institucional
        </label>
        <input
          type="email"
          id="email"
          placeholder="ejemplo@institucion.edu"
          onPaste={(e) => handlePaste(e, setValue, 'email', CARACTERES_ACETADOS_EMAIL)}
          onKeyDown={(e) => restringirCaracteres(e, CARACTERES_ACETADOS_EMAIL)}
          {...register('email')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.email ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.email && <p className="text-acento-600 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="ci" className="block text-md font-medium text-neutro-600 mb-1">
          Carnet de Identidad
        </label>
        <input
          type="text"
          id="ci"
          placeholder="Ej: 1234567 o 1234567-1B"
          maxLength={CI_MAX_LENGTH}
          onPaste={(e) => handlePaste(e, setValue, 'ci', CARACTERES_ACETADOS_CI)}
          onKeyDown={(e) => restringirCaracteres(e, CARACTERES_ACETADOS_CI)}
          {...register('ci')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.ci ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.ci && <p className="text-acento-600 text-sm mt-1">{errors.ci.message}</p>}
      </div>
      
      <div>
        <label htmlFor="codigo_encargado" className="block text-md font-medium text-neutro-600 mb-1">
          Código de Acceso de Responsable
        </label>
        <input
          type="text"
          id="codigo_encargado"
          placeholder="Ingrese el código único. Ej: MAT01"
          maxLength={CODIGO_MAX_LENGTH}
          onPaste={(e) => handlePaste(e, setValue, 'codigo_encargado', CARACTERES_ACETADOS_CODIGO)}
          onKeyDown={(e) => restringirCaracteres(e, CARACTERES_ACETADOS_CODIGO)}
          {...register('codigo_encargado')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.codigo_encargado ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.codigo_encargado && <p className="text-acento-600 text-sm mt-1">{errors.codigo_encargado.message}</p>}
        <p className="text-sm text-neutro-500 mt-1">
          Este código es proporcionado por la institución y valida el rol del usuario.
        </p>
      </div>
    </div>
  );
}