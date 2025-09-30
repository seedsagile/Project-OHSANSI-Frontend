import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '../services/nivelesService';
import type { Nivel, CrearNivelData } from '../types';
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

export function useGestionNiveles(id_area_seleccionada?: number) {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>(initialConfirmationState);

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
        onSuccess: (nuevoNivel) => {
            queryClient.invalidateQueries({ queryKey: ['niveles'] });
            toast.success(`Nivel "${nuevoNivel.nombre}" creado exitosamente.`);
            cerrarModalCrear();
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => {
            setConfirmationModal(initialConfirmationState);
        }
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

        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Creación',
            message: `¿Está seguro de que desea crear el nivel "${data.nombre}"?`,
            type: 'confirmation',
            onConfirm: () => mutate(data),
        });
    };

    const abrirModalCrear = () => setModalCrearAbierto(true);
    const cerrarModalCrear = () => setModalCrearAbierto(false);
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