import { useEffect, useState } from 'react';
import apiClient from '../../../api/ApiPhp';
import type { Area } from '../types/area-Type';

interface UseAreaProps {
  responsableId: number;
  selectedAreas: Area[];
  onChangeSelected?: (selected: Area[]) => void;
}

export const useArea = ({ responsableId, selectedAreas, onChangeSelected }: UseAreaProps) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSelectedAreas, setLocalSelectedAreas] = useState<Area[]>([]);

  useEffect(() => {
    setLocalSelectedAreas(selectedAreas);
  }, [selectedAreas]);
  console.log('responsableId:', responsableId);
  console.log('Hook useArea ejecutado');

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/responsable/${responsableId}`);
        //console.log('Áreas obtenidas:', response);
        setAreas(response.data.data.areas || []);
        //console.log('Áreas obtenidas:', response);
      } catch (error) {
        console.error('Error al obtener áreas:', error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    if (responsableId > 0) {
      fetchAreas();
    }
  }, [responsableId]);

  const toggleArea = (area: Area) => {
    const isSelected = localSelectedAreas.some((a) => a.id_area === area.id_area);

    const newSelected = isSelected
      ? localSelectedAreas.filter((a) => a.id_area !== area.id_area)
      : [...localSelectedAreas, area];

    setLocalSelectedAreas(newSelected);
    onChangeSelected?.(newSelected);
  };

  const selectAll = () => {
    const allSelected = localSelectedAreas.length === areas.length;
    const newSelected = allSelected ? [] : areas;

    setLocalSelectedAreas(newSelected);
    onChangeSelected?.(newSelected);
  };

  const isAllSelected = areas.length > 0 && localSelectedAreas.length === areas.length;

  return {
    areas,
    loading,
    localSelectedAreas,
    toggleArea,
    selectAll,
    isAllSelected,
  };
};
