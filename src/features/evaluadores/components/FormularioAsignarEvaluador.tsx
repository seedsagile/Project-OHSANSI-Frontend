// src/evaluadores/components/FormularioAsignarEvaluador.tsx

import React from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { FormularioDataEvaluador } from '../tipos/IndexEvaluador';

type Props = {
  register: UseFormRegister<FormularioDataEvaluador>;
  errors: FieldErrors<FormularioDataEvaluador>;
};

export function FormularioAsignarEvaluador({ register, errors }: Props) {
  // Función para limpiar y validar nombre/apellido en tiempo real (SOLO previene caracteres inválidos)
  const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart;
    const originalValue = input.value;
    
    // Eliminar caracteres que no sean letras, espacios o acentos
    const cleanedValue = originalValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    
    if (originalValue !== cleanedValue) {
      input.value = cleanedValue;
      if (cursorPosition) {
        input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      }
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  // Prevenir pegar contenido inválido en nombre/apellido
  const handleNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanedText = pastedText.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    
    if (cleanedText) {
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;
      const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
      
      input.value = newValue.substring(0, 20);
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  // Función para limpiar y validar CI en tiempo real
  const handleCIInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart;
    const originalValue = input.value;
    
    const cleanedValue = originalValue.replace(/[^0-9]/g, '');
    
    if (originalValue !== cleanedValue) {
      input.value = cleanedValue;
      if (cursorPosition) {
        input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      }
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  // Prevenir pegar contenido inválido en CI
  const handleCIPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanedText = pastedText.replace(/[^0-9]/g, '');
    
    if (cleanedText) {
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;
      const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
      
      input.value = newValue.substring(0, 15);
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  // Función para limpiar y validar email en tiempo real
  const handleEmailInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart;
    const originalValue = input.value;
    
    // Solo permitir: letras, @, punto, guión bajo y guión (SIN números)
    const cleanedValue = originalValue.replace(/[^a-zA-Z@.\-_]/g, '');
    
    if (originalValue !== cleanedValue) {
      input.value = cleanedValue;
      if (cursorPosition) {
        input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      }
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  // Prevenir pegar contenido inválido en email
  const handleEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanedText = pastedText.replace(/[^a-zA-Z@.\-_]/g, '');
    
    if (cleanedText) {
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;
      const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
      
      input.value = newValue.substring(0, 50);
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  // Función para limpiar y validar código en tiempo real
  const handleCodeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart;
    const originalValue = input.value;
    
    const cleanedValue = originalValue.replace(/[^a-zA-Z0-9]/g, '');
    
    if (originalValue !== cleanedValue) {
      input.value = cleanedValue;
      if (cursorPosition) {
        input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      }
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  // Prevenir pegar contenido inválido en código
  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanedText = pastedText.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanedText) {
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;
      const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
      
      input.value = newValue.substring(0, 10);
      
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
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
            maxLength={20}
            onInput={handleNameInput}
            onPaste={handleNamePaste}
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
            maxLength={20}
            onInput={handleNameInput}
            onPaste={handleNamePaste}
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
          maxLength={15}
          onInput={handleCIInput}
          onPaste={handleCIPaste}
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
          placeholder="usuario@uno.com"
          maxLength={50}
          onInput={handleEmailInput}
          onPaste={handleEmailPaste}
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
            maxLength={32}
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
            maxLength={32}
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
          maxLength={10}
          onInput={handleCodeInput}
          onPaste={handleCodePaste}
          {...register('codigo_evaluador')}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${errors.codigo_evaluador ? 'border-acento-500' : 'border-neutro-300'}`}
        />
        {errors.codigo_evaluador && <p className="text-acento-600 text-sm mt-1">{errors.codigo_evaluador.message}</p>}
        <p className="text-sm text-neutro-500 mt-1">
          Este código es proporcionado por la institución.
        </p>
      </div>
    </div>
  );
}