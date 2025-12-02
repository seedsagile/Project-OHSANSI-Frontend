import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const portalContentRef = useRef<HTMLDivElement>(null); 
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const areAllSelected = useMemo(
    () => niveles.length > 0 && niveles.every(n => selectedNiveles.has(n.id_nivel)),
    [niveles, selectedNiveles]
  );
  
  const calculatePosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true); 
    } else {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        portalContentRef.current &&
        !portalContentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const MenuPortal = isOpen ? createPortal(
    <div
      ref={portalContentRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        zIndex: 9999, 
      }}
      className="bg-white border-2 border-principal-500 rounded-b-xl shadow-xl p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()} 
    >
      {isLoading ? (
        <div className="p-4 text-center"><LoaderCircle className="animate-spin mx-auto text-principal-500"/></div>
      ) : niveles.length === 0 ? (
        <div className="p-4 text-center text-neutro-500 text-sm">No hay niveles disponibles</div>
      ) : (
        <>
          <label className="flex items-center gap-3 p-2 hover:bg-principal-50 rounded-lg cursor-pointer border-b border-neutro-100 mb-1 transition-colors">
            <input 
              type="checkbox" 
              checked={areAllSelected}
              onChange={() => onToggleAll(niveles.map(n => n.id_nivel))}
              className="w-4 h-4 text-principal-600 rounded border-neutro-300 focus:ring-principal-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-principal-700 uppercase">Marcar Todos</span>
          </label>

          <div className="space-y-1">
            {niveles.map((nivel) => (
              <label key={nivel.id_nivel} className="flex items-center gap-3 p-2 hover:bg-neutro-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedNiveles.has(nivel.id_nivel)}
                  onChange={() => onToggleNivel(nivel.id_nivel)}
                  className="w-4 h-4 text-principal-600 rounded border-neutro-300 focus:ring-principal-500"
                />
                <span className="text-sm text-neutro-700">{nivel.nombre}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id} 
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        disabled={disabled}
        aria-expanded={isOpen}
        className={`w-full flex justify-between items-center bg-principal-500 transition-colors px-4 py-3 font-semibold text-white 
          ${isOpen ? 'rounded-t-xl' : 'rounded-lg hover:bg-principal-600'}
          ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        <span className="font-medium truncate">
          {selectedNiveles.size > 0 
            ? `${selectedNiveles.size} Nivel(es) seleccionado(s)` 
            : "Seleccionar Nivel"}
        </span>
        <ChevronDown 
          size={18} 
          className={`w-5 h-5 text-blanco transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {MenuPortal}
    </div>
  );
};