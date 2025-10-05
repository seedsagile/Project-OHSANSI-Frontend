import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '../services/nivelesService';
import type { Nivel, CrearNivelData } from '../types';

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

// --- FUNCIÓN DE NORMALIZACIÓN CORREGIDA ---
const normalizarParaComparar = (nombre: string): string => {
    if (!nombre) return '';
    let s = nombre
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    
    // Se aplica la misma lógica de duplicados para una comparación precisa
    s = s.replace(/([^lrcn\s])\1+/g, '$1'); 
    
    return s.replace(/\s+/g, ' ');
};

export function useGestionNiveles() {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);

    const { data: niveles = [], isLoading } = useQuery({
        queryKey: ['niveles'],
        queryFn: nivelesService.obtenerNiveles,
    });

    const { mutate, isPending: isCreating } = useMutation<Nivel, Error, CrearNivelData>({
        mutationFn: (data) => nivelesService.crearNivel(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['niveles'] });
            cerrarModalCrear();
            setConfirmationModal({
                isOpen: true,
                title: '¡Registro Exitoso!',
                message: `El nivel "${data.nombre}" ha sido registrado correctamente.`,
                type: 'success',
            });
        },
        onError: (error) => {
            setConfirmationModal({
                isOpen: true,
                title: 'Error al Crear',
                message: error.message,
                type: 'error',
            });
        },
    });

    const handleGuardarNivel = (data: CrearNivelData) => {
        const nombreNormalizado = normalizarParaComparar(data.nombre);
        
        const duplicado = niveles.find(
            nivel => normalizarParaComparar(nivel.nombre) === nombreNormalizado
        );

        if (duplicado) {
            setConfirmationModal({
                isOpen: true,
                title: 'Nombre Duplicado',
                message: "El nombre del nivel ya se encuentra registrado.",
                type: 'error',
            });
            return;
        }
        
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Creación',
            message: `¿Está seguro de que desea crear el nivel "${data.nombre}"?`,
            type: 'confirmation',
            onConfirm: () => mutate(data),
        });
    };

    const abrirModalCrear = () => setModalCrearAbierto(true);
    const cerrarModalCrear = () => {
        setModalCrearAbierto(false);
    };
    const cerrarModalConfirmacion = () => setConfirmationModal(initialConfirmationState);

    return {
        niveles,
        isLoading,
        isCreating,
        modalCrearAbierto,
        confirmationModal,
        abrirModalCrear,
        cerrarModalCrear,
        cerrarModalConfirmacion,
        handleGuardarNivel,
    };
}