// src/features/medallero/routes/PaginaMedallero.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { useMedallero } from '../hooks/useMedallero';
import { AreaSelector } from '../components/AreaSelector';
import { MedalTable } from '../components/MedalTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SuccessModal } from '../components/SuccessModal';

export const PaginaMedallero = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    areas,
    selectedArea,
    medalData,
    loading,
    error,
    saving,
    isParametrized,
    loadAreas,
    handleAreaSelect,
    updateMedalValue,
    saveMedallero,
  } = useMedallero(userId);

  useEffect(() => {
    loadAreas();
  }, []);

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleSave = async () => {
    const success = await saveMedallero();
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  if (loading && areas.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Parametrizar Medallero
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <AreaSelector 
            areas={areas}
            selectedArea={selectedArea}
            onSelect={handleAreaSelect}
            loading={loading}
          />

          {selectedArea && (
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-700">Tipo de Competición: </span>
              <span className="text-gray-900">Grupal/Individual</span>
            </div>
          )}

          {!selectedArea ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Debe seleccionar un área para ver sus niveles.</p>
            </div>
          ) : medalData.length > 0 ? (
            <>
              <MedalTable 
                medalData={medalData}
                onUpdate={updateMedalValue}
                isParametrized={isParametrized}
              />

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedArea || isParametrized}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay niveles disponibles para esta área</p>
            </div>
          )}
        </div>
      </div>

      <SuccessModal isOpen={showSuccess} areaName={selectedArea?.nombre || ''} />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};