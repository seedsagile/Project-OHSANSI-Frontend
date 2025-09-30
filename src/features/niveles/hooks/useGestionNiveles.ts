// src/features/niveles/hooks/useGestionNiveles.ts
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '../services/nivelesService';
import type { Nivel, CrearNivelData } from '../types';
import toast from 'react-hot-toast';

export function useGestionNiveles(id_area_seleccionada?: number) {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

    // Query para obtener los niveles, se activa solo si hay un área seleccionada
    const { data: niveles = [], isLoading } = useQuery({
        queryKey: ['niveles', id_area_seleccionada],
        queryFn: () => nivelesService.obtenerNivelesPorArea(id_area_seleccionada!),
        enabled: !!id_area_seleccionada, // La query solo se ejecuta si el id existe
    });

    // Mutación para crear un nuevo nivel
    const { mutate: crearNivel, isPending: isCreating } = useMutation<Nivel, Error, Omit<CrearNivelData, 'id_area'>>({
        mutationFn: (data) => {
            if (!id_area_seleccionada) {
                throw new Error("No hay un área seleccionada para asociar el nivel.");
            }
            return nivelesService.crearNivel({ ...data, id_area: id_area_seleccionada });
        },
        onSuccess: (nuevoNivel) => {
            queryClient.invalidateQueries({ queryKey: ['niveles', id_area_seleccionada] });
            toast.success(`Nivel "${nuevoNivel.nombre}" creado exitosamente.`);
            cerrarModalCrear();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const abrirModalCrear = () => setModalCrearAbierto(true);
    const cerrarModalCrear = () => setModalCrearAbierto(false);

    return {
        niveles,
        isLoading,
        isCreating,
        modalCrearAbierto,
        abrirModalCrear,
        cerrarModalCrear,
        crearNivel,
    };
}