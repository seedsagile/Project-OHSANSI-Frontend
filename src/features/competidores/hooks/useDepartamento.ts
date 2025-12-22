import { useState } from 'react';

interface Departamento {
  id: number;
  nombre: string;
}

interface AccordionDepartamentoProps {
  selectedDepartamentos: string[];
  onChangeSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useDepartamento = ({
  selectedDepartamentos,
  onChangeSelected,
}: AccordionDepartamentoProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const departamentos: Departamento[] = [
    { id: 1, nombre: 'La Paz' },
    { id: 2, nombre: 'Cochabamba' },
    { id: 3, nombre: 'Santa Cruz' },
    { id: 4, nombre: 'Oruro' },
    { id: 5, nombre: 'Potosí' },
    { id: 6, nombre: 'Chuquisaca' },
    { id: 7, nombre: 'Tarija' },
    { id: 8, nombre: 'Beni' },
    { id: 9, nombre: 'Pando' },
  ];

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  const toggleDepartamento = (nombre: string) => {
    const isSelected = selectedDepartamentos.includes(nombre);
    const newSelected = isSelected
      ? selectedDepartamentos.filter((d) => d !== nombre)
      : [...selectedDepartamentos, nombre];

    onChangeSelected(newSelected);
  };

  const selectAll = () => {
    const allSelected = selectedDepartamentos.length === departamentos.length;
    const newSelected = allSelected ? [] : departamentos.map((d) => d.nombre);
    onChangeSelected(newSelected);
  };

  const isAllSelected =
    departamentos.length > 0 && selectedDepartamentos.length === departamentos.length;

  return {
    isOpen,
    toggleAccordion,
    departamentos,
    toggleDepartamento,
    selectAll,
    isAllSelected,
  };
};
