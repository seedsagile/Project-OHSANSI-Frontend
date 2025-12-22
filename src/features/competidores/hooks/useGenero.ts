import { useState, useEffect } from 'react';
import { getGenerosAPI } from '../services/competidores-Service';

interface Genero {
  id: string;
  nombre: string;
}

interface UseGeneroProps {
  selectedGenero: string[];
  onChangeSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useGenero = ({ selectedGenero, onChangeSelected }: UseGeneroProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        setLoading(true);
        const data = await getGenerosAPI();
        setGeneros(data);
      } catch (error) {
        console.error('Error cargando los géneros:', error);
        setGeneros([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneros();
  }, []);

  const toggleGenero = (generoId: string) => {
    const isSelected = selectedGenero.includes(generoId);
    const newSelected = isSelected
      ? selectedGenero.filter((id) => id !== generoId)
      : [...selectedGenero, generoId];

    onChangeSelected(newSelected);
  };

  const selectAll = () => {
    const allSelected = selectedGenero.length === generos.length;
    const newSelected = allSelected ? [] : generos.map((g) => g.id);
    onChangeSelected(newSelected);
  };

  const isAllSelected = generos.length > 0 && selectedGenero.length === generos.length;

  return {
    isOpen,
    toggleAccordion,
    generos,
    loading,
    toggleGenero,
    selectAll,
    isAllSelected,
  };
};
