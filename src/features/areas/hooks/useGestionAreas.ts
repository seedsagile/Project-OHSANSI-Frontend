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
    const [areaSeleccionada, setAreaSeleccionada] = useState<Area | undefined>(undefined);
    const [nombreAreaCreando, setNombreAreaCreando] = useState<string>('');

    const { data: areas = [], isLoading } = useQuery({
        queryKey: ['areas'],
        queryFn: areasService.obtenerAreas,
    });
    
    const { mutate, isPending: isCreating } = useMutation<Area, Error, CrearAreaData>({
        mutationFn: areasService.crearArea,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            toast.success(`Área "${nombreAreaCreando}" creada exitosamente`);
            cerrarModalCrear();
            setNombreAreaCreando('');
        },
        onError: (error) => {
            toast.error(error.message);
            setNombreAreaCreando('');
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

        setNombreAreaCreando(data.nombre);
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Creación',
            message: `¿Está seguro de que desea crear el área "${data.nombre}"?`,
            type: 'confirmation',
            onConfirm: () => mutate(data),
        });
    };

    const abrirModalCrear = () => setModalCrearAbierto(true);
    const cerrarModalCrear = () => {
        setModalCrearAbierto(false);
        setNombreAreaCreando('');
    };
    const cerrarModalConfirmacion = () => setConfirmationModal(initialConfirmationState);

    return {
        areas,
        isLoading,
        isCreating,
        modalCrearAbierto,
        confirmationModal,
        areaSeleccionada,
        setAreaSeleccionada,
        abrirModalCrear,
        cerrarModalCrear,
        cerrarModalConfirmacion,
        handleGuardarArea,
    };
}