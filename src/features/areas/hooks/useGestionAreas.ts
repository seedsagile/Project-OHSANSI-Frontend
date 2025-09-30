import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areasService } from '../services/areasService';
import type { Area, CrearAreaData } from '../types';
import toast from 'react-hot-toast';

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
            setConfirmationModal(initialConfirmationState);
        }
    });

    const handleGuardarArea = (data: CrearAreaData) => {
        const nombreNormalizado = normalizarNombre(data.nombre);
        
        const esDuplicado = areas.some(area => normalizarNombre(area.nombre) === nombreNormalizado);

        if (esDuplicado) {
            setConfirmationModal({
                isOpen: true,
                title: 'Nombre Duplicado',
                message: `Ya existe un área con el nombre "${data.nombre}". Por favor, ingrese un nombre diferente.`,
                type: 'info',
            });
            return;
        }

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
        handleGuardarArea,
    };
}