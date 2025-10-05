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
    return nombre
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/\s+/g, ' '); // Normalizar espacios
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
    //const [nombreAreaCreando, setNombreAreaCreando] = useState<string>('');

    const { data: areas = [], isLoading } = useQuery({
        queryKey: ['areas'],
        queryFn: areasService.obtenerAreas,
    });
    
    const { mutate, isPending: isCreating } = useMutation<Area, Error, CrearAreaData>({
        mutationFn: areasService.crearArea,
        onSuccess: (nuevaArea) => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            
            // Validación 14: Mensaje de confirmación exitoso
            setConfirmationModal({
                isOpen: true,
                title: '¡Registro Exitoso!',
                message: `El área "${nuevaArea.nombre}" ha sido registrado correctamente.`,
                type: 'success',
            });
            
            //setNombreAreaCreando('');
            
            // Validación 17: Cerrar modal después de 2 segundos
            setTimeout(() => {
                cerrarModalCrear();
                setConfirmationModal(initialConfirmationState);
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
            //setNombreAreaCreando('');
        },
    });

    const handleGuardarArea = (data: CrearAreaData) => {
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

        // Mostrar modal de confirmación antes de guardar
       // setNombreAreaCreando(data.nombre);
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Creación',
            message: `¿Está seguro de que desea crear el área "${data.nombre}"?`,
            type: 'confirmation',
            onConfirm: () => mutate(data),
        });
    };

    const abrirModalCrear = () => setModalCrearAbierto(true);
    
    // Validación 16: Al presionar Cancelar, el formulario se cierra sin guardar
    const cerrarModalCrear = () => {
        setModalCrearAbierto(false);
        //setNombreAreaCreando('');
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