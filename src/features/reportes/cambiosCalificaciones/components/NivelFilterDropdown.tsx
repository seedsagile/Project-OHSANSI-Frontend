import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import type { NivelFiltro } from '../types';

interface NivelFilterDropdownProps {
  id?: string;
  niveles: NivelFiltro[];
  selectedNiveles: Set<number>;
  isLoading: boolean;
  onToggleNivel: (id: number) => void;
  onToggleAll: (ids: number[]) => void;
  disabled: boolean;
}

export const NivelFilterDropdown: React.FC<NivelFilterDropdownProps> = ({
  id,
  niveles,
  selectedNiveles,
  isLoading,
  onToggleNivel,
  onToggleAll,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lógica de "Seleccionar Todos"
  const areAllSelected = useMemo(
    () => niveles.length > 0 && niveles.every(n => selectedNiveles.has(n.id_nivel)),
    [niveles, selectedNiveles]
  );

  // Click Outside: Exactamente igual que en CustomDropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    // 1. Contenedor Relativo (Igual que CustomDropdown)
    <div className="relative" ref={dropdownRef}>
      
      {/* 2. Botón Trigger (Estilos idénticos a CustomDropdown) */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex justify-between items-center bg-principal-500 transition-colors px-4 py-3 font-semibold text-white 
          ${isOpen ? 'rounded-t-xl hover:bg-principal-600' : 'rounded-lg hover:bg-principal-600'}
          ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        <span className="font-medium truncate">
          {selectedNiveles.size > 0 
            ? `${selectedNiveles.size} Nivel(es)` 
            : "Seleccionar Nivel"}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* 3. Menú Desplegable (Posicionamiento Absoluto estándar) 
          Eliminamos createPortal y usamos la misma estrategia que CustomDropdown 
      */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 w-full bg-white border-2 border-principal-500 rounded-b-xl shadow-lg overflow-hidden">
          <div className="max-h-[250px] overflow-y-auto p-2 space-y-1">
            
            {isLoading ? (
              <div className="p-4 text-center">
                <LoaderCircle className="animate-spin mx-auto text-principal-500"/>
              </div>
            ) : niveles.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No hay niveles disponibles</div>
            ) : (
              <>
                {/* Opción: Marcar Todos */}
                <label className="flex items-center gap-3 p-2 hover:bg-principal-50 rounded-lg cursor-pointer border-b border-gray-100 mb-1 transition-colors select-none">
                  <input 
                    type="checkbox" 
                    checked={areAllSelected}
                    onChange={() => onToggleAll(niveles.map(n => n.id_nivel))}
                    className="w-4 h-4 text-principal-600 rounded border-gray-300 focus:ring-principal-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-principal-700 uppercase">Marcar Todos</span>
                </label>

                {/* Lista de Niveles */}
                {niveles.map((nivel) => (
                  <label 
                    key={nivel.id_nivel} 
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors select-none ${
                      selectedNiveles.has(nivel.id_nivel) ? 'bg-principal-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedNiveles.has(nivel.id_nivel)}
                      onChange={() => onToggleNivel(nivel.id_nivel)}
                      className="w-4 h-4 text-principal-600 rounded border-gray-300 focus:ring-principal-500"
                    />
                    <span className={`text-sm ${selectedNiveles.has(nivel.id_nivel) ? 'text-principal-700 font-medium' : 'text-gray-700'}`}>
                      {nivel.nombre}
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};