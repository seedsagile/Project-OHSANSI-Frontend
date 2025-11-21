// src/features/evaluaciones/components/SearchBar.tsx

import { Search } from 'lucide-react';
import { validarBusqueda } from '../utils/validations';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  disabled?: boolean;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  disabled = false,
}: SearchBarProps) => {
  const [error, setError] = useState<string>('');
  const [inputValue, setInputValue] = useState(searchTerm);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleChange = (value: string) => {
    setInputValue(value);
    setError('');

    // Si está vacío, permitir y limpiar búsqueda
    if (value.trim().length === 0) {
      onSearchChange('');
      return;
    }

    // Validar con Zod
    const validacion = validarBusqueda(value);
    
    if (!validacion.valido && validacion.mensaje) {
      setError(validacion.mensaje);
      // No actualizar la búsqueda si hay error
      return;
    }

    // Si es válido, actualizar búsqueda
    onSearchChange(value);
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Nombre Completo del competidor"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          maxLength={50}
          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {!error && (
        <p className="text-xs text-gray-500 mt-1">
          Solo letras - Máximo 50 caracteres
        </p>
      )}
    </div>
  );
};