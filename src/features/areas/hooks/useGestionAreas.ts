import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areasService } from '../services/areasService';
import type { Area, CrearAreaData } from '../types';

type ConfirmationModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    type: 'confirmation' | 'info' | 'error' | 'success';
};

const initialConfirmationState: ConfirmationModalState = {
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
};

const normalizarYGenerarVariaciones = (nombre: string): string[] => {
    const normalizado = nombre.trim().toLowerCase().replace(/\s+/g, ' ');
    const variaciones = [normalizado];
    if (normalizado.endsWith('s')) {
        variaciones.push(normalizado.slice(0, -1));
    } else {
        variaciones.push(normalizado + 's');
    }
    if (normalizado.endsWith('es')) {
        variaciones.push(normalizado.slice(0, -2));
    } else if (!normalizado.endsWith('s')) {
        variaciones.push(normalizado + 'es');
    }
    return [...new Set(variaciones)];
};

const existeNombreSimilar = (nombreNuevo: string, areasExistentes: Area[]): boolean => {
    const variacionesNuevas = normalizarYGenerarVariaciones(nombreNuevo);
    return areasExistentes.some(area => {
        const variacionesExistentes = normalizarYGenerarVariaciones(area.nombre);
        return variacionesNuevas.some(vn => variacionesExistentes.includes(vn));
    });
};


export function useGestionAreas() {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);
    const [areaSeleccionada, setAreaSeleccionada] = useState<Area | undefined>(undefined);
    const [nombreAreaGuardada, setNombreAreaGuardada] = useState<string>('');

    const { data: areas = [], isLoading } = useQuery({
        queryKey: ['areas'],
        queryFn: areasService.obtenerAreas,
    });
    
    const { mutate, isPending: isCreating } = useMutation<Area, Error, CrearAreaData>({
        mutationFn: areasService.crearArea,
        onSuccess: (nuevaArea) => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            cerrarModalCrear();
            setConfirmationModal({
                isOpen: true,
                type: 'success',
                title: '¡Registro Exitoso!',
                message: `El área "${nombreAreaCreando}" fue creada exitosamente.`
            });
        },
        onError: (error) => {
            setConfirmationModal({
                isOpen: true,
                type: 'error',
                title: 'Error al Crear',
                message: error.message,
            });
        },
    });

    const handleGuardarArea = (data: CrearAreaData) => {
        // Guardar el nombre antes de enviar (por si la API no lo devuelve)
        setNombreAreaGuardada(data.nombre);
        
        // Validación 15: Verificar si ya existe un área con el mismo nombre
        const esDuplicado = existeNombreDuplicado(data.nombre, areas);

        if (esDuplicado) {
            setConfirmationModal({
                isOpen: true,
                title: 'Error de Duplicado',
                message: 'El nombre del Área se encuentra registrado.',
                type: 'error',
            });
            return;
        }

        // GUARDAR DIRECTAMENTE SIN MODAL DE CONFIRMACIÓN
        mutate(data);
    };

    const abrirModalCrear = () => setModalCrearAbierto(true);
    
    // Validación 16: Al presionar Cancelar, el formulario se cierra sin guardar
    const cerrarModalCrear = () => {
        setModalCrearAbierto(false);
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