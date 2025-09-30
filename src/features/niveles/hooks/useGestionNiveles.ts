import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nivelesService } from '../services/nivelesService';
import type { Nivel, CrearNivelData } from '../types';
import toast from 'react-hot-toast';

export function useGestionNiveles(id_area_seleccionada?: number) {
    const queryClient = useQueryClient();
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

    const { data: todosLosNiveles = [], isLoading } = useQuery({
        queryKey: ['niveles'],
        queryFn: nivelesService.obtenerNiveles,
    });

    const nivelesFiltrados = useMemo(() => {
        if (!id_area_seleccionada) return [];
        return todosLosNiveles.filter(nivel => nivel.id_area === id_area_seleccionada);
    }, [todosLosNiveles, id_area_seleccionada]);

    const { mutate: crearNivel, isPending: isCreating } = useMutation<Nivel, Error, Omit<CrearNivelData, 'id_area'>>({
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
    });

    const abrirModalCrear = () => setModalCrearAbierto(true);
    const cerrarModalCrear = () => setModalCrearAbierto(false);

    return {
        niveles: nivelesFiltrados,
        isLoading,
        isCreating,
        modalCrearAbierto,
        abrirModalCrear,
        cerrarModalCrear,
        crearNivel,
    };
}