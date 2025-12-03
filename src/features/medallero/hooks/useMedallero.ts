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
  const [isParametrized, setIsParametrized] = useState(false);

  const loadAreas = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await medalleroService.getAreasByResponsable(userId);
      if (response.success && response.data.areas.length > 0) {
        // Ordenar áreas alfabéticamente (A-Z)
        const sortedAreas = response.data.areas.sort((a, b) => 
          a.nombre_area.localeCompare(b.nombre_area)
        );
        setAreas(sortedAreas);
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
        // Agrupar niveles duplicados
        const nivelesMap = new Map<string, typeof response.data.niveles[0]>();
        response.data.niveles.forEach(nivel => {
          if (!nivelesMap.has(nivel.nombre_nivel)) {
            nivelesMap.set(nivel.nombre_nivel, nivel);
          }
        });

        // Ordenar niveles alfabéticamente (A-Z)
        const sortedNiveles = Array.from(nivelesMap.values()).sort((a, b) => 
          a.nombre_nivel.localeCompare(b.nombre_nivel)
        );

        // Verificar si TODOS los niveles ya están parametrizados
        const todosParametrizados = sortedNiveles.every(nivel => 
          nivel.oro !== undefined && nivel.oro !== null
        );

        setIsParametrized(todosParametrizados);

        const initialData: MedalData[] = sortedNiveles.map(nivel => {
          // Determinar si este nivel específico ya está parametrizado
          const nivelParametrizado = nivel.oro !== undefined && nivel.oro !== null;
          
          return {
            id_area_nivel: nivel.id_area_nivel,
            nombre_nivel: nivel.nombre_nivel,
            oro: nivel.oro ?? 1,
            plata: nivel.plata ?? 1,
            bronce: nivel.bronce ?? 1,
            menciones: nivel.menciones ?? 0,
            ya_parametrizado: nivelParametrizado,
          };
        });

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
    setMedalData([]);
    setIsParametrized(false);
    loadNiveles(area.id_area);
  };

  const updateMedalValue = (
    index: number, 
    field: keyof Omit<MedalData, 'id_area_nivel' | 'nombre_nivel' | 'ya_parametrizado'>, 
    value: string
  ) => {
    // Validar según el campo
    let isValid = false;
    switch (field) {
      case 'oro':
      case 'plata':
      case 'bronce':
        isValid = validators.isValidNumber(value, 0, 10);
        break;
      case 'menciones':
        isValid = validators.isValidNumber(value, 0, 20);
        break;
    }

    if (!isValid) return;
    
    const newData = [...medalData];
    newData[index] = { ...newData[index], [field]: value === '' ? 0 : parseInt(value) };
    setMedalData(newData);
  };

  const saveMedallero = async () => {
    if (!selectedArea) {
      setError('Debe seleccionar un área');
      return false;
    }

    const validationError = validators.validateMedalData(medalData);
    if (validationError) {
      setError(validationError);
      return false;
    }

    // Solo enviar niveles que NO están parametrizados
    const nivelesAGuardar = medalData.filter(item => !item.ya_parametrizado);
    
    if (nivelesAGuardar.length === 0) {
      setError('Todos los niveles ya están parametrizados');
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const dataToSave: MedalleroSaveData[] = nivelesAGuardar.map(item => ({
        id_area_nivel: item.id_area_nivel,
        oro: item.oro,
        plata: item.plata,
        bronce: item.bronce,
        menciones: item.menciones,
      }));

      const response = await medalleroService.saveMedallero(dataToSave);
      
      if (response.success) {
        // Marcar todos los niveles como parametrizados
        setIsParametrized(true);
        const updatedData = medalData.map(item => ({
          ...item,
          ya_parametrizado: true
        }));
        setMedalData(updatedData);
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
};