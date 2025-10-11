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
    type: 'confirmation' | 'info' | 'error' | 'success';
};

const initialConfirmationState: ConfirmationModalState = {
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
};

// Normaliza nombres para comparación (elimina acentos, convierte a minúsculas, elimina espacios extras)
const normalizarParaComparacion = (nombre: string): string => {
    const normalizado = nombre
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/\s+/g, ' '); // Normalizar espacios
    
    // Eliminar terminaciones de plural para comparar singular/plural
    if (normalizado.endsWith('es') && normalizado.length > 3) {
        // "niveles" -> "nivel", "sociales" -> "social"
        return normalizado.slice(0, -2);
    } else if (normalizado.endsWith('s') && normalizado.length > 2) {
        // "fisicas" -> "fisica", "ciencias" -> "ciencia"
        return normalizado.slice(0, -1);
    }
    
    return normalizado;
};

// Verifica si existe un área con nombre similar o duplicado
const existeNombreDuplicado = (nombreNuevo: string, areasExistentes: Area[]): boolean => {
    const nombreNormalizado = normalizarParaComparacion(nombreNuevo);
    
    return areasExistentes.some(area => {
        const areaNormalizada = normalizarParaComparacion(area.nombre);
        return areaNormalizada === nombreNormalizado;
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
            
            // Obtener el nombre del área guardada (de la respuesta o del estado temporal)
            const nombreMostrar = nuevaArea?.nombre || nombreAreaGuardada;
            
            console.log('Área guardada:', nuevaArea); // Para debug
            
            // Validación 14: Mensaje de confirmación exitoso
            setConfirmationModal({
                isOpen: true,
                title: '¡Registro Exitoso!',
                message: `El área "${nombreMostrar}" ha sido registrado correctamente.`,
                type: 'success',
            });
            
            // Validación 17 y 18: Cerrar modales después del éxito
            setTimeout(() => {
                setConfirmationModal(initialConfirmationState);
                setModalCrearAbierto(false);
                setNombreAreaGuardada('');
            }, 2000);
        },
        onError: (error) => {
            // Validación 15: Error si el nombre ya existe
            if (error.message.toLowerCase().includes('existe')) {
                setConfirmationModal({
                    isOpen: true,
                    title: 'Error de Duplicado',
                    message: 'El nombre del Área se encuentra registrado.',
                    type: 'error',
                });
            } else {
                toast.error(error.message);
            }
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