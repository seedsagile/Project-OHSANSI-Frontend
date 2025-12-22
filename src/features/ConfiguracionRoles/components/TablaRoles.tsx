import React, { useState, useEffect } from 'react';
import { Save, X, LoaderCircle, Check, Info, Shield } from 'lucide-react';
import type { AccionSistema, RolGlobal, PermisoRol } from '../types';

interface TablaRolesProps {
  acciones: AccionSistema[];
  roles: RolGlobal[];
  permisosIniciales: PermisoRol[];
  onGuardar: (permisos: PermisoRol[]) => void;
  onCancelar: () => void;
  isSaving?: boolean;
}

export const TablaRoles: React.FC<TablaRolesProps> = ({
  acciones,
  roles,
  permisosIniciales,
  onGuardar,
  onCancelar,
  isSaving = false,
}) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Set<string>>(new Set());

  // Cargar estado inicial
  useEffect(() => {
    const iniciales = new Set<string>();
    permisosIniciales.forEach((p) => {
      if (p.activo) {
        iniciales.add(`${p.id_rol}-${p.id_accion}`);
      }
    });
    setPermisosSeleccionados(iniciales);
  }, [permisosIniciales]);

  const handleToggle = (idRol: number, idAccion: number) => {
    const key = `${idRol}-${idAccion}`;
    const nuevoSet = new Set(permisosSeleccionados);
    if (nuevoSet.has(key)) nuevoSet.delete(key);
    else nuevoSet.add(key);
    setPermisosSeleccionados(nuevoSet);
  };

  const toggleColumn = (idRol: number) => {
    const nuevoSet = new Set(permisosSeleccionados);
    const keysColumna = acciones.map(a => `${idRol}-${a.id}`);
    const allSelected = keysColumna.every(k => nuevoSet.has(k));

    if (allSelected) {
      keysColumna.forEach(k => nuevoSet.delete(k));
    } else {
      keysColumna.forEach(k => nuevoSet.add(k));
    }
    setPermisosSeleccionados(nuevoSet);
  };

  const isColumnFullySelected = (idRol: number) => {
    if (acciones.length === 0) return false;
    return acciones.every(a => permisosSeleccionados.has(`${idRol}-${a.id}`));
  };

  const handleGuardarClick = () => {
    const payload: PermisoRol[] = [];
    roles.forEach((rol) => {
      acciones.forEach((accion) => {
        const key = `${rol.id}-${accion.id}`;
        payload.push({
          id_rol: rol.id,
          id_accion: accion.id,
          activo: permisosSeleccionados.has(key),
        });
      });
    });
    onGuardar(payload);
  };

  const CustomCheckbox = ({ checked, onChange, label }: any) => (
    <label className="relative flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-all" title={label}>
      <input
        type="checkbox"
        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-white checked:border-blue-600 transition-all cursor-pointer"
        checked={checked}
        onChange={onChange}
        disabled={isSaving}
      />
      <Check size={16} strokeWidth={4} className="absolute text-blue-600 pointer-events-none opacity-0 peer-checked:opacity-100 transition-transform scale-50 peer-checked:scale-100" />
    </label>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
      
      <header className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
          <Shield size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matriz de Permisos por Rol</h2>
          <p className="text-sm text-gray-500">Administra qué acciones puede ejecutar cada rol en el sistema.</p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-inner bg-white relative">
        <div className="overflow-auto max-h-[600px] scrollbar-thin">
          <table className="w-full border-collapse text-left min-w-[800px]">
            <thead className="sticky top-0 z-20 bg-gray-900 text-white shadow-md">
              <tr>
                <th className="py-4 px-6 font-bold text-sm w-[300px] sticky left-0 bg-gray-900 z-30 shadow-lg border-r border-gray-700">
                  Acciones del Sistema
                </th>
                {roles.map((rol) => (
                  <th key={rol.id} className="py-3 px-4 text-center min-w-[140px] align-top">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold text-sm">{rol.nombre}</span>
                      <div className="bg-white/10 p-1 rounded hover:bg-white/20 cursor-pointer" onClick={() => toggleColumn(rol.id)}>
                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${isColumnFullySelected(rol.id) ? 'bg-white border-white' : 'border-white/60'}`}>
                           {isColumnFullySelected(rol.id) && <Check size={12} className="text-gray-900" strokeWidth={4} />}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {acciones.map((accion, idx) => (
                <tr key={accion.id} className={`group hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className={`py-3 px-6 text-sm font-medium text-gray-700 sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="flex flex-col">
                      <span>{accion.nombre}</span>
                      {accion.descripcion && <span className="text-[10px] text-gray-400 font-normal mt-0.5 max-w-[250px] truncate">{accion.descripcion}</span>}
                    </div>
                  </td>
                  {roles.map((rol) => (
                    <td key={rol.id} className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <CustomCheckbox
                          checked={permisosSeleccionados.has(`${rol.id}-${accion.id}`)}
                          onChange={() => handleToggle(rol.id, accion.id)}
                          label={`Permitir ${accion.nombre} a ${rol.nombre}`}
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

      <footer className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onCancelar} disabled={isSaving} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
          Cancelar
        </button>
        <button onClick={handleGuardarClick} disabled={isSaving} className="px-8 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm transition-colors flex items-center gap-2">
          {isSaving ? <LoaderCircle className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Guardar Cambios</span>
        </button>
      </footer>
    </div>
  );
};