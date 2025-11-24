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

  useEffect(() => {
    const iniciales = new Set<string>();
    permisosIniciales.forEach((p) => {
      if (p.habilitado) {
        iniciales.add(`${p.id_fase}-${p.id_accion}`);
      }
    });
    setPermisosSeleccionados(iniciales);
  }, [permisosIniciales]);

  const handleToggle = (idFase: number, idAccion: number) => {
    const key = `${idFase}-${idAccion}`;
    const nuevoSet = new Set(permisosSeleccionados);
    if (nuevoSet.has(key)) nuevoSet.delete(key);
    else nuevoSet.add(key);
    setPermisosSeleccionados(nuevoSet);
  };

  const toggleColumn = (idFase: number) => {
    const nuevoSet = new Set(permisosSeleccionados);
    const keysColumna = acciones.map(a => `${idFase}-${a.id}`);
    const allSelected = keysColumna.every(k => nuevoSet.has(k));

    if (allSelected) {
      keysColumna.forEach(k => nuevoSet.delete(k));
    } else {
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

  const CustomCheckbox = ({ 
    checked, 
    onChange, 
    label,
    className = ""
  }: { checked: boolean; onChange: () => void; label: string, className?: string }) => (
    <label 
      className={`relative flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-negro/5 transition-all ${className}`}
      title={label}
    >
      <input
        title={label}
        type="checkbox"
        className="peer appearance-none w-5 h-5 border-2 border-neutro-400 rounded bg-white checked:bg-white checked:border-negro transition-all cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-principal-400 outline-none"
        checked={checked}
        onChange={onChange}
        disabled={isSaving}
      />
      <Check 
        size={16} 
        strokeWidth={4}
        className="absolute text-negro pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200 transform peer-checked:scale-100 scale-50" 
      />
    </label>
  );

  return (
    <div className="flex flex-col h-full w-full bg-blanco p-4 md:p-6 rounded-2xl shadow-sm border border-neutro-200">
      
      <header className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-negro tracking-tight">
          Configuración de Acciones del sistema de Fases Globales
        </h2>
      </header>

      <div className="flex-1 overflow-hidden rounded-xl border border-neutro-200 shadow-inner bg-white relative">
        <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100">
          <table className="w-full border-collapse text-left min-w-[600px] sm:min-w-[800px]">
            
            <thead className="sticky top-0 z-20 bg-principal-500 text-white shadow-md">
              <tr>
                <th className="py-4 px-4 md:px-6 font-bold text-sm md:text-base w-[200px] sm:w-[280px] sticky left-0 bg-principal-500 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] border-r border-principal-400/50 align-bottom">
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
                            title={fase.nombre}
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
                  <td className={`py-3 px-4 md:px-6 font-medium text-xs md:text-base sticky left-0 z-10 transition-colors group-hover:bg-principal-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-neutro-200 ${
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

                  {fases.map((fase) => (
                    <td
                      key={fase.id}
                      className="py-3 px-2 md:px-4 text-center relative"
                    >
                      <div className="flex justify-center items-center h-full">
                        <CustomCheckbox 
                          checked={permisosSeleccionados.has(`${fase.id}-${accion.id}`)}
                          onChange={() => handleToggle(fase.id, accion.id)}
                          label={`Habilitar ${accion.nombre} en ${fase.nombre}`}
                        />
                      </div>
                    </td>
                  ))}
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
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-all shadow-sm disabled:opacity-70 cursor-pointer active:scale-[0.98]"
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