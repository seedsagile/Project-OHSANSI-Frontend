import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '../services/nivelesService';
import type { Nivel, CrearNivelData } from '../types';
import { normalizarTexto } from '../utils/esquemas';

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

export function useGestionNiveles() {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);
    const [nombreNivelCreando, setNombreNivelCreando] = useState<string>('');
    
    const modalTimerRef = useRef<number | undefined>(undefined);

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
                message: `El nivel "${nombreNivelCreando}" ha sido registrado correctamente.`,
                type: 'success',
            });

            clearTimeout(modalTimerRef.current);
            modalTimerRef.current = window.setTimeout(() => {
                cerrarModalConfirmacion();
            }, 2500);
        },
        onError: (error) => {
            clearTimeout(modalTimerRef.current);
            setConfirmationModal({
                isOpen: true,
                title: 'Error al Crear',
                message: error.message,
                type: 'error',
            });
        },
    });

    useEffect(() => {
        return () => {
            clearTimeout(modalTimerRef.current);
        };
    }, []);

    const handleGuardarNivel = (data: CrearNivelData) => {
        const nombreNormalizado = normalizarTexto(data.nombre);
        
        const duplicado = niveles.find(
            nivel => normalizarTexto(nivel.nombre) === nombreNormalizado
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
        
        setNombreNivelCreando(nombreNormalizado);
        
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Creación',
            message: `¿Está seguro de que desea crear el nivel "${nombreNormalizado}"?`,
            type: 'confirmation',
            onConfirm: () => mutate({ nombre: nombreNormalizado }),
        });
    };

    const abrirModalCrear = () => setModalCrearAbierto(true);
    const cerrarModalCrear = () => {
        setModalCrearAbierto(false);
        setNombreNivelCreando('');
    };
    const cerrarModalConfirmacion = () => {
        setConfirmationModal(initialConfirmationState);
        clearTimeout(modalTimerRef.current);
    };

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