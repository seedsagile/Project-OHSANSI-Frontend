import React, { useState, useEffect } from 'react';
import { Save, X, LoaderCircle, Check } from 'lucide-react';
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
    if (nuevoSet.has(key)) {
      nuevoSet.delete(key);
    } else {
      nuevoSet.add(key);
    }
    setPermisosSeleccionados(nuevoSet);
  };

  const handleGuardarClick = () => {
    const payload: PermisoFase[] = [];
    fases.forEach((fase) => {
      acciones.forEach((accion) => {
        const key = `${fase.id_fase}-${accion.id_accion}`;
        payload.push({
          id_fase: fase.id_fase,
          id_accion: accion.id_accion,
          habilitado: permisosSeleccionados.has(key),
        });
      });
    });
    onGuardar(payload);
  };

  return (
    <div className="flex flex-col h-full w-full bg-blanco p-4 md:p-6 rounded-2xl shadow-sm border border-neutro-200">
      
      <header className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-negro tracking-tight">
          Configuración de Acciones del sistema de Fases Globales
        </h2>
      </header>

      <div className="flex-1 overflow-hidden rounded-xl border border-neutro-200 shadow-inner bg-white relative">
        <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-neutro-300 scrollbar-track-neutro-100">
          <table className="w-full border-collapse text-left min-w-[800px]">
            
            {/* Cabecera Azul (Sticky) */}
            <thead className="sticky top-0 z-20 bg-principal-500 text-white shadow-md">
              <tr>
                <th className="py-4 px-6 font-bold text-sm md:text-base w-1/3 sticky left-0 bg-principal-500 z-30">
                  Acciones del Sistema
                </th>
                {fases.map((fase) => (
                  <th
                    key={fase.id_fase}
                    className="py-4 px-4 text-center font-bold text-sm md:text-base min-w-[140px]"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span>{fase.nombre}</span>
                      {fase.activa && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-normal border border-white/30">
                          (Activa)
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Cuerpo de Tabla (Sin Categorías) */}
            <tbody className="text-neutro-800 divide-y divide-neutro-200">
              {acciones.map((accion, index) => (
                <tr
                  key={accion.id_accion}
                  // Filas Zebra: Pares blancas, Impares gris suave (neutro-100)
                  className={`group transition-colors hover:bg-principal-50 ${
                    index % 2 !== 0 ? 'bg-neutro-100' : 'bg-white'
                  }`}
                >
                  {/* Nombre de Acción (Sticky Left) */}
                  <td className={`py-3 px-6 font-medium text-sm md:text-base sticky left-0 z-10 transition-colors group-hover:bg-principal-50 ${
                    index % 2 !== 0 ? 'bg-neutro-100' : 'bg-white'
                  }`}>
                    {accion.nombre}
                  </td>

                  {/* Checkboxes */}
                  {fases.map((fase) => {
                    const isChecked = permisosSeleccionados.has(
                      `${fase.id_fase}-${accion.id_accion}`
                    );
                    
                    return (
                      <td
                        key={fase.id_fase}
                        className="py-3 px-4 text-center relative"
                      >
                        <div className="flex justify-center items-center h-full">
                          <label 
                            className="relative flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-negro/5 transition-all"
                            htmlFor={`check-${fase.id_fase}-${accion.id_accion}`}
                          >
                            <input
                              id={`check-${fase.id_fase}-${accion.id_accion}`}
                              type="checkbox"
                              className="peer appearance-none w-6 h-6 border-2 border-neutro-400 rounded bg-white checked:bg-white checked:border-negro transition-all cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-principal-400 outline-none"
                              checked={isChecked}
                              onChange={() => handleToggle(fase.id_fase, accion.id_accion)}
                              disabled={isSaving}
                            />
                            <Check 
                              size={18} 
                              strokeWidth={4}
                              className="absolute text-negro pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200 transform peer-checked:scale-100 scale-50" 
                            />
                          </label>
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

      {/* Footer con botones */}
      <footer className="mt-8 flex justify-end items-center gap-4 pt-4">
        <button
          type="button"
          onClick={onCancelar}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neutro-200 text-neutro-700 font-semibold hover:bg-neutro-300 transition-colors disabled:opacity-50"
        >
          <X size={18} />
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarClick}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-principal-500 text-blanco font-semibold hover:bg-principal-600 transition-all shadow-sm disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Guardar</span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};