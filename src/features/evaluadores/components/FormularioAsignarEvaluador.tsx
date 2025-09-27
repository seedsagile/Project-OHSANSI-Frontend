// src/evaluadores/components/FormularioAsignarEvaluador.tsx

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { FormularioDataEvaluador } from '../tipos/IndexEvaluador';

type Props = {
  register: UseFormRegister<FormularioDataEvaluador>;
  errors: FieldErrors<FormularioDataEvaluador>;
};

export function FormularioAsignarEvaluador({ register, errors }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutro-800">Datos del Evaluador</h2>
      
      <div>
        <label htmlFor="nombreCompleto" className="block text-md font-medium text-neutro-600 mb-1">
          Nombre completo del evaluador
        </label>
        <input
          type="text"
          id="nombreCompleto"
          placeholder="Ingrese el nombre y apellidos"
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
          placeholder="Ej: 1234567 CB"
          {...register('ci')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.ci ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.ci && <p className="text-acento-600 text-sm mt-1">{errors.ci.message}</p>}
      </div>

      <div>
        <label htmlFor="username" className="block text-md font-medium text-neutro-600 mb-1">
          Nombre de usuario
        </label>
        <input
          type="text"
          id="username"
          placeholder="Ingrese el nombre de usuario"
          {...register('username')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.username ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.username && <p className="text-acento-600 text-sm mt-1">{errors.username.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-md font-medium text-neutro-600 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            placeholder="Contraseña segura"
            {...register('password')}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.password ? 'border-acento-500' : 'border-neutro-300'}`}
          />
          {errors.password && <p className="text-acento-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-md font-medium text-neutro-600 mb-1">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="password_confirmation"
            placeholder="Repita la contraseña"
            {...register('password_confirmation')}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.password_confirmation ? 'border-acento-500' : 'border-neutro-300'}`}
          />
          {errors.password_confirmation && <p className="text-acento-600 text-sm mt-1">{errors.password_confirmation.message}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="codigo_evaluador" className="block text-md font-medium text-neutro-600 mb-1">
          Código de Evaluador
        </label>
        <input
          type="text"
          id="codigo_evaluador"
          placeholder="Ingrese el código único. Ej: 1234"
          {...register('codigo_evaluador')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.codigo_evaluador ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.codigo_evaluador && <p className="text-acento-600 text-sm mt-1">{errors.codigo_evaluador.message}</p>}
        <p className="text-sm text-neutro-500 mt-1">
          Este código es proporcionado por la institución y valida el rol del evaluador.
        </p>
      </div>
    </div>
  );
}