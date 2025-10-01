import { useState, useMemo } from 'react';
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

export function useGestionNiveles(id_area_seleccionada?: number) {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);
    const [nombreNivelCreando, setNombreNivelCreando] = useState<string>('');

    const { data: todosLosNiveles = [], isLoading } = useQuery({
        queryKey: ['niveles'],
        queryFn: nivelesService.obtenerNiveles,
    });

    const nivelesFiltrados = useMemo(() => {
        if (!id_area_seleccionada) return [];
        return todosLosNiveles.filter(nivel => nivel.id_area === id_area_seleccionada);
    }, [todosLosNiveles, id_area_seleccionada]);

    const { mutate, isPending: isCreating } = useMutation<Nivel, Error, Omit<CrearNivelData, 'id_area'>>({
        mutationFn: (data) => {
            if (!id_area_seleccionada) throw new Error("No hay un área seleccionada.");
            return nivelesService.crearNivel({ ...data, id_area: id_area_seleccionada });
        },
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

    const handleGuardarNivel = (data: Omit<CrearNivelData, 'id_area'>) => {
        const nombreNormalizado = normalizarNombre(data.nombre);
        
        const esDuplicado = nivelesFiltrados.some(nivel => normalizarNombre(nivel.nombre) === nombreNormalizado);

        if (esDuplicado) {
            setConfirmationModal({
                isOpen: true,
                title: 'Nombre Duplicado',
                message: `Ya existe un nivel con el nombre "${data.nombre}" en esta área.`,
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
        setNombreNivelCreando(''); // Limpiar el estado al cerrar
    };
    const cerrarModalConfirmacion = () => setConfirmationModal(initialConfirmationState);

    return {
        niveles: nivelesFiltrados,
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