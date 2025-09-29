// src/evaluadores/components/FormularioAsignarEvaluador.tsx

import React from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { FormularioDataEvaluador } from '../tipos/IndexEvaluador';

type Props = {
  register: UseFormRegister<FormularioDataEvaluador>;
  errors: FieldErrors<FormularioDataEvaluador>;
};

export function FormularioAsignarEvaluador({ register, errors }: Props) {
  // Función para permitir solo letras, espacios y acentos (Nombre y Apellido)
  const handleNameInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const isValidChar = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(char);
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(char);
    
    if (!isValidChar && !isControlKey) {
      e.preventDefault();
    }
  };

  // Función para permitir solo números (CI)
  const handleCIInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const isNumber = /^[0-9]$/.test(char);
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(char);
    
    if (!isNumber && !isControlKey) {
      e.preventDefault();
    }
  };

  // Función para email - permite solo caracteres válidos para email
  const handleEmailInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    // Permite: letras, números, punto, guión bajo, porcentaje, más, guión, arroba
    const isValidChar = /^[a-zA-Z0-9.@]$/.test(char);
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(char);
    
    if (!isValidChar && !isControlKey) {
      e.preventDefault();
    }
  };

  // Función para permitir solo letras y números (Código evaluador)
  const handleCodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const isValidChar = /^[a-zA-Z0-9]$/.test(char);
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(char);
    
    if (!isValidChar && !isControlKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutro-800">Datos del Evaluador</h2>
      
      {/* Nombre y Apellido lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-md font-medium text-neutro-600 mb-1">
            Nombre del evaluador
          </label>
          <input
            type="text"
            id="nombre"
            placeholder="Ingrese el nombre"
            onKeyDown={handleNameInput}
            {...register('nombre')}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.nombre ? 'border-acento-500' : 'border-neutro-300'}`}
          />
          {errors.nombre && <p className="text-acento-600 text-sm mt-1">{errors.nombre.message}</p>}
        </div>

        <div>
          <label htmlFor="apellido" className="block text-md font-medium text-neutro-600 mb-1">
            Apellido del evaluador
          </label>
          <input
            type="text"
            id="apellido"
            placeholder="Ingrese el apellido"
            onKeyDown={handleNameInput}
            {...register('apellido')}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.apellido ? 'border-acento-500' : 'border-neutro-300'}`}
          />
          {errors.apellido && <p className="text-acento-600 text-sm mt-1">{errors.apellido.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="ci" className="block text-md font-medium text-neutro-600 mb-1">
          Carnet de Identidad
        </label>
        <input
          type="text"
          id="ci"
          placeholder="Ej: 1234567"
          onKeyDown={handleCIInput}
          {...register('ci')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.ci ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.ci && <p className="text-acento-600 text-sm mt-1">{errors.ci.message}</p>}
      </div>
    
      <div>
        <label htmlFor="email" className="block text-md font-medium text-neutro-600 mb-1">
          Correo electrónico 
        </label>
        <input
          type="email"
          id="email"
          placeholder="ejemplo@institucion.edu"
          onKeyDown={handleEmailInput}
          {...register('email')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.email ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.email && <p className="text-acento-600 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Contraseñas lado a lado */}
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
          placeholder="Ej: E123MAT"
          onKeyDown={handleCodeInput}
          {...register('codigo_evaluador')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.codigo_evaluador ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.codigo_evaluador && <p className="text-acento-600 text-sm mt-1">{errors.codigo_evaluador.message}</p>}
        <p className="text-sm text-neutro-500 mt-1">
          Este código es proporcionado por la institución .
        </p>
      </div>
    </div>
  );
}