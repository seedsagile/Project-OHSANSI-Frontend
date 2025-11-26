// src/features/ConfiguracionFases/components/TablaFases.tsx

import React, { useState, useEffect } from 'react';
import { Save, X, LoaderCircle, Check, Info } from 'lucide-react';
import type { AccionSistema, FaseGlobal, PermisoFase } from '../types';

interface TablaFasesProps {
  acciones: AccionSistema[];
  fases: FaseGlobal[];
  permisosIniciales: PermisoFase[];
  onGuardar: (permisos: PermisoFase[]) => void;
  onCancelar: () => void;
  isSaving?: boolean;
}

export const TablaFases: React.FC<TablaFasesProps> = ({
  acciones,
  fases,
  permisosIniciales,
  onGuardar,
  onCancelar,
  isSaving = false,
}) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Set<string>>(new Set());
  
  // Estado derivado para identificar qué permisos ya venían activados del servidor
  const [permisosBloqueados, setPermisosBloqueados] = useState<Set<string>>(new Set());

  // Carga inicial
  useEffect(() => {
    const iniciales = new Set<string>();
    const bloqueados = new Set<string>();
    
    permisosIniciales.forEach((p) => {
      if (p.habilitado) {
        const key = `${p.id_fase}-${p.id_accion}`;
        iniciales.add(key);
        bloqueados.add(key); // Guardamos los que ya estaban activos
      }
    });
    setPermisosSeleccionados(iniciales);
    setPermisosBloqueados(bloqueados);
  }, [permisosIniciales]);

  const handleToggle = (idFase: number, idAccion: number) => {
    const key = `${idFase}-${idAccion}`;
    
    // Si ya estaba guardado como habilitado, no se puede desmarcar
    if (permisosBloqueados.has(key)) return;

    const nuevoSet = new Set(permisosSeleccionados);
    if (nuevoSet.has(key)) nuevoSet.delete(key);
    else nuevoSet.add(key);
    setPermisosSeleccionados(nuevoSet);
  };

  // Toggle Columna (Respetando bloqueos)
  const toggleColumn = (idFase: number) => {
    const nuevoSet = new Set(permisosSeleccionados);
    const keysColumna = acciones.map(a => `${idFase}-${a.id}`);

    // Ver si todo lo "desbloqueado" está seleccionado
    const allSelectableSelected = keysColumna.every(k => {
      if (permisosBloqueados.has(k)) return true; // Ignorar bloqueados (siempre true)
      return nuevoSet.has(k);
    });

    if (allSelectableSelected) {
      // Desmarcar solo los que NO están bloqueados
      keysColumna.forEach(k => {
        if (!permisosBloqueados.has(k)) nuevoSet.delete(k);
      });
    } else {
      // Marcar todo
      keysColumna.forEach(k => nuevoSet.add(k));
    }
    setPermisosSeleccionados(nuevoSet);
  };

  const isColumnFullySelected = (idFase: number) => {
    if (acciones.length === 0) return false;
    return acciones.every(a => permisosSeleccionados.has(`${idFase}-${a.id}`));
  };

  const handleGuardarClick = () => {
    const payload: PermisoFase[] = [];
    fases.forEach((fase) => {
      acciones.forEach((accion) => {
        const key = `${fase.id}-${accion.id}`;
        payload.push({
          id_fase: fase.id,
          id_accion: accion.id,
          habilitado: permisosSeleccionados.has(key),
        });
      });
    });
    onGuardar(payload);
  };

  // Componente Checkbox Reutilizable
  const CustomCheckbox = ({ 
    checked, 
    onChange, 
    label,
    disabled = false
  }: { checked: boolean; onChange: () => void; label: string, disabled?: boolean }) => (
    <label 
      className={`relative flex items-center justify-center p-2 rounded-full transition-all ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-negro/5'
      }`}
      title={label + (disabled && checked ? " (Ya registrado, no se puede desmarcar)" : "")}
    >
      <input
        type="checkbox"
        className={`peer appearance-none w-5 h-5 border-2 rounded bg-white transition-all outline-none
          ${checked ? 'checked:bg-white checked:border-negro' : 'border-neutro-400'}
          ${disabled ? 'bg-neutro-100 border-neutro-300' : 'focus:ring-2 focus:ring-offset-1 focus:ring-principal-400'}
        `}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
      <Check 
        size={16} 
        strokeWidth={4}
        className={`absolute text-negro pointer-events-none transition-opacity duration-200 transform scale-50
          ${checked ? 'opacity-100 scale-100' : 'opacity-0'}
          ${disabled ? 'text-neutro-500' : ''}
        `}
      />
    </label>
  );

  if (acciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-neutro-200 shadow-sm p-8 text-center">
        <Info className="w-12 h-12 text-neutro-300 mb-3" />
        <p className="text-lg text-neutro-500 font-medium">
          No existen acciones disponibles para seleccionar.
        </p>
      </div>
    );
  }

  // Calculamos si hay cambios nuevos:
  // Si la cantidad seleccionada es igual a la bloqueada, significa que no hemos marcado nada nuevo.
  const hayCambiosNuevos = permisosSeleccionados.size > permisosBloqueados.size;

  return (
    <div className="flex flex-col h-full w-full bg-blanco p-4 md:p-6 rounded-2xl shadow-sm border border-neutro-200">
      
      <header className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-negro tracking-tight">
          Configurar Cronograma de Fases
        </h2>
      </header>

      <div className="flex-1 overflow-hidden rounded-xl border border-neutro-200 shadow-inner bg-white relative">
        <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100">
          <table className="w-full border-collapse text-left min-w-[600px] sm:min-w-[800px]">
            
            <thead className="sticky top-0 z-20 bg-principal-500 text-white shadow-md">
              <tr>
                <th className="py-4 px-4 md:px-6 font-bold text-sm md:text-base w-[160px] sm:w-[280px] sticky left-0 bg-principal-500 z-30 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)] border-r border-principal-400/50 align-bottom">
                  <div className="flex items-end pb-3 h-full">
                    Acciones del Sistema
                  </div>
                </th>
                
                {fases.map((fase) => (
                  <th
                    key={fase.id}
                    className="py-3 px-2 md:px-4 text-center font-bold text-sm md:text-base min-w-[120px] md:min-w-[140px] align-top"
                  >
                    <div className="flex flex-col items-center justify-between gap-2 h-full">
                      <span className="whitespace-normal leading-tight">{fase.nombre}</span>
                      
                      <div className="mt-1 bg-white/10 p-1 rounded-lg hover:bg-white/20 transition-colors">
                        <label 
                          className="relative flex items-center justify-center cursor-pointer"
                          title={`Activar/Desactivar todo en ${fase.nombre}`}
                        >
                          <input
                            type="checkbox"
                            className="peer appearance-none w-5 h-5 border-2 border-white/60 rounded bg-transparent checked:bg-white checked:border-white transition-all cursor-pointer"
                            checked={isColumnFullySelected(fase.id)}
                            onChange={() => toggleColumn(fase.id)}
                            disabled={isSaving}
                          />
                          <Check 
                            size={16} 
                            strokeWidth={4}
                            className="absolute text-principal-600 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200 transform peer-checked:scale-100" 
                          />
                        </label>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-neutro-800 divide-y divide-neutro-200">
              {acciones.map((accion, index) => (
                <tr
                  key={accion.id}
                  className={`group transition-colors hover:bg-principal-50 ${
                    index % 2 !== 0 ? 'bg-neutro-100' : 'bg-white'
                  }`}
                >
                  <td className={`py-3 px-4 md:px-6 font-medium text-xs md:text-base sticky left-0 z-10 transition-colors group-hover:bg-principal-50 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)] border-r border-neutro-200 ${
                     index % 2 !== 0 ? 'bg-neutro-100' : 'bg-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2 h-full">
                      <div className="flex flex-col justify-center">
                        <span className="break-words leading-tight">{accion.nombre}</span>
                        {accion.descripcion && (
                           <span className="text-[10px] text-neutro-400 font-normal hidden sm:block max-w-[180px] truncate mt-0.5">
                             {accion.descripcion}
                           </span>
                        )}
                      </div>
                      
                      {accion.descripcion && (
                         <Info size={16} className="text-neutro-400 flex-shrink-0 sm:hidden ml-auto" />
                      )}
                    </div>
                  </td>

                  {fases.map((fase) => {
                    const key = `${fase.id}-${accion.id}`;
                    const isChecked = permisosSeleccionados.has(key);
                    const isLocked = permisosBloqueados.has(key); // Criterio 5
                    
                    return (
                      <td
                        key={fase.id}
                        className="py-3 px-2 md:px-4 text-center relative"
                      >
                        <div className="flex justify-center items-center h-full">
                          <CustomCheckbox 
                            checked={isChecked}
                            onChange={() => handleToggle(fase.id, accion.id)}
                            label={`Habilitar ${accion.nombre} en ${fase.nombre}`}
                            disabled={isSaving || isLocked} // Deshabilitar si guarda o si está bloqueado
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-6 pt-6 border-t border-neutro-200 flex flex-col-reverse sm:flex-row justify-end items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onCancelar}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-neutro-200 text-neutro-700 font-semibold hover:bg-neutro-300 transition-colors disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          <X size={20} />
          <span>Cancelar</span>
        </button>

        <button
          type="button"
          onClick={handleGuardarClick}
          // CORRECCIÓN: Deshabilitado si guarda O si NO hay cambios nuevos (seleccionados == bloqueados)
          disabled={isSaving || !hayCambiosNuevos}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
        >
          {isSaving ? (
            <>
              <LoaderCircle size={20} className="animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>Guardar</span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};