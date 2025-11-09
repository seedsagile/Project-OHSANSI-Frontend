import { useState } from 'react';
import { Area, MedalData, MedalleroSaveData } from '../types/medallero.types';
import { medalleroService } from '../services/medallero.service';
import { validators } from '../utils/medallero.validators';

export const useMedallero = (userId: number | undefined) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [medalData, setMedalData] = useState<MedalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAreas = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await medalleroService.getAreasByResponsable(userId);
      if (response.success && response.data.areas.length > 0) {
        setAreas(response.data.areas);
      } else {
        setError('No tienes áreas asignadas');
      }
    } catch (err) {
      setError('Error al cargar las áreas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadNiveles = async (areaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await medalleroService.getNivelesByArea(areaId);
      if (response.success) {
        // Agrupar niveles duplicados y crear estructura inicial
        const nivelesMap = new Map<string, typeof response.data.niveles[0]>();
        response.data.niveles.forEach(nivel => {
          if (!nivelesMap.has(nivel.nombre_nivel)) {
            nivelesMap.set(nivel.nombre_nivel, nivel);
          }
        });

        const initialData: MedalData[] = Array.from(nivelesMap.values()).map(nivel => ({
          id_area_nivel: nivel.id_area_nivel,
          nombre_nivel: nivel.nombre_nivel,
          oro: 1,
          plata: 1,
          bronce: 1,
          menciones: 3,
        }));

        setMedalData(initialData);
      }
    } catch (err) {
      setError('Error al cargar los niveles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSelect = (area: Area) => {
    setSelectedArea(area);
    loadNiveles(area.id_area);
  };

  const updateMedalValue = (index: number, field: keyof Omit<MedalData, 'id_area_nivel' | 'nombre_nivel'>, value: string) => {
    if (!validators.isPositiveInteger(value)) return;
    
    const newData = [...medalData];
    newData[index] = { ...newData[index], [field]: parseInt(value) || 0 };
    setMedalData(newData);
  };

  const saveMedallero = async () => {
    if (!selectedArea) {
      setError('Debe seleccionar un área');
      return;
    }

    const validationError = validators.validateMedalData(medalData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const dataToSave: MedalleroSaveData[] = medalData.map(item => ({
        id_area: selectedArea.id_area,
        id_area_nivel: item.id_area_nivel,
        oro: item.oro,
        plata: item.plata,
        bronce: item.bronce,
        menciones: item.menciones,
      }));

      await medalleroService.saveMedallero(dataToSave);
      alert('Configuración del medallero guardada exitosamente');
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetData = () => {
    setMedalData(medalData.map(item => ({
      ...item,
      oro: 1,
      plata: 1,
      bronce: 1,
      menciones: 3,
    })));
  };

  return {
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
  };
};