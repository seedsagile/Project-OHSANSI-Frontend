// src/features/medallero/routes/PaginaMedallero.tsx

import { useEffect } from 'react';
import { Medal, AlertCircle, X, Save } from 'lucide-react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { useMedallero } from '../hooks/useMedallero';
import { AreaSelector } from '../components/AreaSelector';
import { MedalTable } from '../components/MedalTable';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const PaginaMedallero = () => {
  const { userId } = useAuth();
  
  const {
    areas,
    selectedArea,
    medalData,
    loading,
    error,
    saving,
    loadAreas,
    handleAreaSelect,
    updateMedalValue,
    saveMedallero,
    resetData,
  } = useMedallero(userId);

  // Cargar áreas al montar
  useEffect(() => {
    loadAreas();
  }, []);

  if (loading && areas.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Medal className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Parametrizar Medallero
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Area Selector */}
        <AreaSelector 
          areas={areas}
          selectedArea={selectedArea}
          onSelect={handleAreaSelect}
          loading={loading}
        />

        {/* Competition Type Info */}
        {selectedArea && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Área seleccionada: </span>
                <span className="text-gray-900 font-semibold">{selectedArea.nombre}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Gestión: </span>
                <span className="text-gray-900 font-semibold">{selectedArea.gestion}</span>
              </div>
            </div>
          </div>
        )}

        {/* Medal Table */}
        {medalData.length > 0 ? (
          <>
            <MedalTable 
              medalData={medalData}
              onUpdate={updateMedalValue}
            />

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={resetData}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
              <button
                onClick={saveMedallero}
                disabled={saving || !selectedArea}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </>
        ) : selectedArea ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay niveles disponibles para esta área</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Seleccione un área para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};