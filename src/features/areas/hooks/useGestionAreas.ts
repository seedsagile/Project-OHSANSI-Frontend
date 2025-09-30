// src/features/areas/hooks/useGestionAreas.ts
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areasService } from '../services/areasService';
import type { Area, CrearAreaData } from '../types';
import toast from 'react-hot-toast';

// Estado para el modal de confirmación
type ConfirmationModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    type: 'confirmation' | 'info' | 'error';
};

const initialConfirmationState: ConfirmationModalState = {
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
};

// Función de utilidad para normalizar y comparar nombres
const normalizarNombre = (nombre: string) => 
    nombre.trim().toLowerCase().replace(/\s+/g, ' ');

export function useGestionAreas() {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);

    const { data: areas = [], isLoading } = useQuery({
        queryKey: ['areas'],
        queryFn: areasService.obtenerAreas,
    });

    const { mutate, isPending: isCreating } = useMutation<Area, Error, CrearAreaData>({
        mutationFn: areasService.crearArea,
        onSuccess: (nuevaArea) => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            toast.success(`Área "${nuevaArea.nombre}" creada exitosamente`);
            cerrarModalCrear();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSettled: () => {
            setConfirmationModal(initialConfirmationState); // Cierra el modal de confirmación
        }
    });

    // Nueva función que se llama al guardar desde el formulario
    const handleGuardarArea = (data: CrearAreaData) => {
        const nombreNormalizado = normalizarNombre(data.nombre);
        
        // 1. Verificación de duplicados en el cliente
        const esDuplicado = areas.some(area => normalizarNombre(area.nombre) === nombreNormalizado);

        if (esDuplicado) {
            // 2. Si es duplicado, muestra modal de información
            setConfirmationModal({
                isOpen: true,
                title: 'Nombre Duplicado',
                message: `Ya existe un área con el nombre "${data.nombre}". Por favor, ingrese un nombre diferente.`,
                type: 'info',
            });
            return;
        }

        // 3. Si no es duplicado, muestra modal de confirmación
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Creación',
            message: `¿Está seguro de que desea crear el área "${data.nombre}"?`,
            type: 'confirmation',
            onConfirm: () => mutate(data),
        });
    };

    const abrirModalCrear = () => setModalCrearAbierto(true);
    const cerrarModalCrear = () => setModalCrearAbierto(false);
    const cerrarModalConfirmacion = () => setConfirmationModal(initialConfirmationState);

    return {
        areas,
        isLoading,
        isCreating,
        modalCrearAbierto,
        confirmationModal,
        abrirModalCrear,
        cerrarModalCrear,
        cerrarModalConfirmacion,
        handleGuardarArea, // Exponemos la nueva función
    };
}