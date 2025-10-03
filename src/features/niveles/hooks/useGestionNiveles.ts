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

const normalizarNombre = (nombre: string) => 
    nombre.trim().toLowerCase().replace(/\s+/g, ' ');

export function useGestionNiveles() {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);
    const [nombreNivelCreando, setNombreNivelCreando] = useState<string>('');

    const { data: niveles = [], isLoading } = useQuery({
        queryKey: ['niveles'],
        queryFn: nivelesService.obtenerNiveles,
    });

    const { mutate, isPending: isCreating } = useMutation<Nivel, Error, CrearNivelData>({
        mutationFn: (data) => nivelesService.crearNivel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['niveles'] });
            cerrarModalCrear();
            setConfirmationModal({
                isOpen: true,
                title: '¡Registro Exitoso!',
                message: `El nivel "${nombreNivelCreando}" fue creado exitosamente.`,
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
        const nombreNormalizado = normalizarNombre(data.nombre);
        const esDuplicado = niveles.some(nivel => normalizarNombre(nivel.nombre) === nombreNormalizado);

        if (esDuplicado) {
            setConfirmationModal({
                isOpen: true,
                title: 'Nombre Duplicado',
                message: `Ya existe un nivel con el nombre "${data.nombre}".`,
                type: 'info',
            });
            return;
        }
        
        setNombreNivelCreando(data.nombre);
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
        setNombreNivelCreando('');
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