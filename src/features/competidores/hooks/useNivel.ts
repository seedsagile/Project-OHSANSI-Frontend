import { useState, useEffect } from 'react';
import type { Area } from '../types/area-Type';
import type { Nivel } from '../types/nivel-Type';
import { getNivelesPorAreaAPI } from '../services/competidores-Service';

interface AreaNiveles {
  areaId: number;
  areaNombre: string;
  niveles: Nivel[];
}

interface UseNivelProps {
  selectedAreas: Area[];
  selectedNiveles: { [areaId: number]: number[] };
  onChangeSelected?: (niveles: { [areaId: number]: number[] }) => void;
}

export const useNivel = ({ selectedAreas, selectedNiveles, onChangeSelected }: UseNivelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<{ [areaId: number]: number[] }>({});
  const [nivelesData, setNivelesData] = useState<AreaNiveles[]>([]);
  const [loading, setLoading] = useState(false);
  const closeAccordion = () => setIsOpen(false);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    setLocalSelected(selectedNiveles);
  }, [selectedNiveles]);

  useEffect(() => {
    if (!selectedAreas || selectedAreas.length === 0) {
      setNivelesData([]);
      return;
    }

    const fetchNiveles = async () => {
      try {
        setLoading(true);
        const results: AreaNiveles[] = [];

        for (const area of selectedAreas) {
          const niveles = await getNivelesPorAreaAPI(area.id_area);
          results.push({ areaId: area.id_area, areaNombre: area.nombre, niveles });
        }

        setNivelesData(results);
      } catch (error) {
        console.error('Error al obtener niveles:', error);
        setNivelesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNiveles();
  }, [selectedAreas]);

  const handleCheckboxChange = (areaId: number, nivelId: number) => {
    const current = localSelected[areaId] || [];
    const isSelected = current.includes(nivelId);

    const newSelected = {
      ...localSelected,
      [areaId]: isSelected ? current.filter((id) => id !== nivelId) : [...current, nivelId],
    };

    setLocalSelected(newSelected);
    onChangeSelected?.(newSelected);
  };

  const handleSelectAll = (areaId: number, niveles: Nivel[]) => {
    const allSelected = localSelected[areaId]?.length === niveles.length && niveles.length > 0;

    const newSelected = {
      ...localSelected,
      [areaId]: allSelected ? [] : niveles.map((n) => n.id_nivel),
    };

    setLocalSelected(newSelected);
    onChangeSelected?.(newSelected);
  };

  const isAllSelected = (areaId: number, niveles: Nivel[]) =>
    niveles.length > 0 && localSelected[areaId]?.length === niveles.length;

  return {
    isOpen,
    toggleAccordion,
    closeAccordion,
    localSelected,
    nivelesData,
    loading,
    handleCheckboxChange,
    handleSelectAll,
    isAllSelected,
  };
};
