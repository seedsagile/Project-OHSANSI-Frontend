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

  const handleInputChange = (value: string) => {
    // ➡️ 1. RESTRICCIÓN INMEDIATA: Filtrar solo letras, acentos, ñ y espacios
    // Utiliza una regex para reemplazar cualquier carácter que NO sea una letra (incluye acentos y ñ) o un espacio.
    const regexSoloLetrasYEspacios = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g;
    const valorFiltrado = value.replace(regexSoloLetrasYEspacios, '');

    // Actualizar el estado local del input con el valor filtrado
    setInputValue(valorFiltrado);
    setError('');

    // Si el valor filtrado está vacío, limpiar la búsqueda en el componente padre
    if (valorFiltrado.trim().length === 0) {
      onSearchChange('');
      return;
    }

    // 2. VALIDACIÓN LÓGICA (usando la función que verifica espacios dobles, etc.)
    const validacion = validarBusqueda(valorFiltrado);
    
    if (!validacion.valido && validacion.mensaje) {
      setError(validacion.mensaje);
      // No se llama a onSearchChange, manteniendo el estado filtrado pero con error visual
      return;
    }

    // 3. Si es válido (solo letras, espacios, y pasa la validación de formato), actualizar búsqueda
    onSearchChange(valorFiltrado);
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
          // ➡️ Usar la nueva función de manejo
          onChange={(e) => handleInputChange(e.target.value)} 
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
          Solo letras y espacios - Máximo 50 caracteres
        </p>
      )}
    </div>
  );
};