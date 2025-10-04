import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areasService } from '../../areas/services/areasService';
import { nivelesService } from '../../niveles/services/nivelesService';

type ModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
};

const initialModalState: ModalState = { isOpen: false, title: '', message: '', type: 'info' };

export function useAsignarNiveles() {
    const queryClient = useQueryClient();
    const [areaSeleccionadaId, setAreaSeleccionadaId] = useState<number | undefined>();
    const [nivelesSeleccionados, setNivelesSeleccionados] = useState<Set<number>>(new Set());
    const [modalState, setModalState] = useState<ModalState>(initialModalState);

    // 1. Cargar todas las áreas para el selector
    const { data: todasLasAreas = [], isLoading: isLoadingAreas } = useQuery({
        queryKey: ['areas'],
        queryFn: areasService.obtenerAreas,
    });

    // 2. Cargar todos los niveles disponibles para la lista
    const { data: todosLosNiveles = [], isLoading: isLoadingNiveles } = useQuery({
        queryKey: ['niveles'],
        queryFn: nivelesService.obtenerNiveles,
    });

    // 3. Cargar los niveles ya asignados al área seleccionada
    /*const { data: nivelesAsignados = [], isLoading: isLoadingAsignados } = useQuery({
        queryKey: ['areas', areaSeleccionadaId, 'niveles'],
        queryFn: () => areasService.obtenerNivelesPorArea(areaSeleccionadaId!),
        enabled: !!areaSeleccionadaId,
    });*/
    
    // 4. Sincronizar checkboxes cuando se carga una nueva área
    useEffect(() => {
        if (areaSeleccionadaId) {
            const ids = new Set(nivelesAsignados.map(n => n.id_nivel));
            setNivelesSeleccionados(ids);
        } else {
            setNivelesSeleccionados(new Set());
        }
    }, [nivelesAsignados, areaSeleccionadaId]);

    // 5. Mutación para guardar los cambios
    const { mutate: guardarAsignaciones, isPending: isSaving } = useMutation({
        mutationFn: (ids_niveles: number[]) => areasService.actualizarNivelesDeArea(areaSeleccionadaId!, ids_niveles),
        onSuccess: () => {
            setModalState({ isOpen: true, type: 'success', title: '¡Guardado!', message: 'Las asignaciones se han actualizado correctamente.' });
            queryClient.invalidateQueries({ queryKey: ['areas', areaSeleccionadaId, 'niveles'] });
        },
        onError: () => {
            setModalState({ isOpen: true, type: 'error', title: 'Error', message: 'No se pudieron guardar los cambios. Inténtelo de nuevo.' });
        },
    });

    const handleGuardar = () => {
        if (!areaSeleccionadaId) return;
        guardarAsignaciones(Array.from(nivelesSeleccionados));
    };
    
    const handleToggleNivel = (id_nivel: number) => {
        setNivelesSeleccionados(prev => {
            const newSet = new Set(prev);
            newSet.has(id_nivel) ? newSet.delete(id_nivel) : newSet.add(id_nivel);
            return newSet;
        });
    };
    
    const closeModal = () => setModalState(initialModalState);

    return {
        todasLasAreas,
        todosLosNiveles,
        areaSeleccionadaId,
        setAreaSeleccionadaId,
        nivelesSeleccionados,
        handleToggleNivel,
        handleGuardar,
        isLoading: isLoadingAreas || isLoadingNiveles || isLoadingAsignados,
        isSaving,
        modalState,
        closeModal,
    };
}