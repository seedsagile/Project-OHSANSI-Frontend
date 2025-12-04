// src/features/competencias/components/ModalCrearCompetencia.tsx
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { CrearCompetenciaData, AreaConNiveles } from '../types';

type ModalCrearCompetenciaProps = {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (data: CrearCompetenciaData) => void;
  areasConNiveles: AreaConNiveles[];
  loading?: boolean;
};

export const ModalCrearCompetencia = ({
  isOpen,
  onClose,
  onGuardar,
  areasConNiveles,
  loading = false,
}: ModalCrearCompetenciaProps) => {
  const [idAreaNivel, setIdAreaNivel] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState('');

  // Debug: Ver qué datos llegan al modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 [Modal] Modal abierto');
      console.log('📋 [Modal] areasConNiveles recibidos:', areasConNiveles);
      console.log('📊 [Modal] Total de áreas:', areasConNiveles?.length || 0);
      
      if (areasConNiveles && areasConNiveles.length > 0) {
        areasConNiveles.forEach((area, index) => {
          console.log(`🎯 [Modal] Área ${index}:`, {
            id_area: area.id_area,
            nombre: area.area,
            niveles: area.niveles?.length || 0
          });
          
          area.niveles?.forEach((nivel, nivelIndex) => {
            console.log(`  📌 [Modal] Nivel ${nivelIndex}:`, {
              id_area_nivel: nivel.id_area_nivel,
              id_nivel: nivel.id_nivel,
              nombre: nivel.nombre
            });
          });
        });
      } else {
        console.warn('⚠️ [Modal] No hay áreas disponibles');
      }
    }
  }, [isOpen, areasConNiveles]);

  if (!isOpen) return null;

  const handleGuardar = () => {
    setError('');

    console.log('💾 [Modal] Intentando guardar:', {
      idAreaNivel,
      fechaInicio,
      fechaFin
    });

    // Validaciones
    if (idAreaNivel === 0 || !fechaInicio || !fechaFin) {
      setError('Por favor complete todos los campos');
      return;
    }

    // Validar que fecha_fin sea posterior a fecha_inicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    onGuardar({
      id_area_nivel: idAreaNivel,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });

    // Limpiar formulario
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setIdAreaNivel(0);
    setFechaInicio('');
    setFechaFin('');
    setError('');
  };

  const handleCancelar = () => {
    limpiarFormulario();
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleCancelar}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-gray-900 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Competencia</h2>
          <button
            onClick={handleCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Mensaje de debug si no hay áreas */}
        {!areasConNiveles || areasConNiveles.length === 0 ? (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ No hay áreas disponibles. Verifica que el usuario tenga áreas asignadas.
            </p>
          </div>
        ) : null}

        <div className="space-y-4">
          {/* Select de Área y Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área y Nivel: <span className="text-red-500">*</span>
            </label>
            <select
              value={idAreaNivel}
              onChange={(e) => {
                const valor = Number(e.target.value);
                console.log('🔄 [Modal] Seleccionado id_area_nivel:', valor);
                setIdAreaNivel(valor);
                setError('');
              }}
              disabled={loading || !areasConNiveles || areasConNiveles.length === 0}
              className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-colors text-lg shadow-inner border-gray-300 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={0}>Seleccione un Área y Nivel</option>
              {areasConNiveles && areasConNiveles.length > 0 ? (
                areasConNiveles.map((area) =>
                  area.niveles && area.niveles.length > 0 ? (
                    area.niveles.map((nivel) => (
                      <option 
                        key={`area-${area.id_area}-nivel-${nivel.id_area_nivel}`} 
                        value={Number(nivel.id_area_nivel)}
                      >
                        {area.area} - {nivel.nombre}
                      </option>
                    ))
                  ) : null
                )
              ) : null}
            </select>
          </div>

          {/* Fecha de Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio: <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setError('');
              }}
              min={today}
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-colors text-lg shadow-inner border-gray-300 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {/* Fecha de Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin: <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setError('');
              }}
              min={fechaInicio || today}
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-colors text-lg shadow-inner border-gray-300 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end pt-4 mt-6">
          <button
            type="button"
            onClick={handleCancelar}
            disabled={loading}
            className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={loading || idAreaNivel === 0 || !fechaInicio || !fechaFin}
            className="flex items-center gap-2 font-semibold py-2.5 px-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};