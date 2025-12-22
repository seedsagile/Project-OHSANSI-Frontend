import { useState, useEffect } from 'react';
import { getGradosPorAreaYNivelAPI } from '../services/competidores-Service';
import type { Area } from '../types/area-Type';

interface Grado {
  id_grado_escolaridad: number;
  nombre: string;
}

interface UseGradoProps {
  selectedAreas: Area[];
  selectedNiveles: { [areaId: number]: number[] };
  selectedGrados: number[];
  onChangeSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

export const useGrado = ({
  selectedAreas,
  selectedNiveles,
  selectedGrados,
  onChangeSelected,
}: UseGradoProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [marcarTodo, setMarcarTodo] = useState(false);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  const handleCheckboxChange = (id: number) => {
    if (selectedGrados.includes(id)) {
      onChangeSelected(selectedGrados.filter((g) => g !== id));
    } else {
      onChangeSelected([...selectedGrados, id]);
    }
  };

  const handleMarcarTodo = () => {
    const nuevoEstado = !marcarTodo;
    setMarcarTodo(nuevoEstado);

    if (nuevoEstado) {
      onChangeSelected(grados.map((g) => g.id_grado_escolaridad));
    } else {
      onChangeSelected([]);
    }
  };

  useEffect(() => {
    const fetchGrados = async () => {
      try {
        setLoading(true);
        let acumulados: Grado[] = [];

        for (const area of selectedAreas) {
          const niveles = selectedNiveles[area.id_area] || [];
          for (const nivelId of niveles) {
            const resp = await getGradosPorAreaYNivelAPI(area.id_area, nivelId);
            acumulados = [...acumulados, ...resp];
          }
        }

        const unicos = Array.from(
          new Map(acumulados.map((g) => [g.id_grado_escolaridad, g])).values()
        );

        setGrados(unicos);
      } catch (error) {
        console.error('Error al obtener grados:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedAreas.length > 0) {
      fetchGrados();
    } else {
      setGrados([]);
      setLoading(false);
    }
  }, [selectedAreas, selectedNiveles]);

  useEffect(() => {
    setMarcarTodo(grados.length > 0 && selectedGrados.length === grados.length);
  }, [selectedGrados, grados]);

  return {
    isOpen,
    toggleAccordion,
    grados,
    loading,
    marcarTodo,
    handleCheckboxChange,
    handleMarcarTodo,
  };
};
