import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { areasService } from '../../areas/services/areasService';
import { nivelesService } from '../../niveles/services/nivelesService';
import { asignacionesService } from '../services/asignarServices';
import type { AsignacionPayload } from '../types';

type ApiErrorResponse = {
    message: string;
};

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

    const { data: todasLasAreas = [], isLoading: isLoadingAreas } = useQuery({ queryKey: ['areas'], queryFn: areasService.obtenerAreas });
    const { data: todosLosNiveles = [], isLoading: isLoadingNiveles } = useQuery({ queryKey: ['niveles'], queryFn: nivelesService.obtenerNiveles });
    const { data: nivelesAsignados = [], isLoading: isLoadingAsignados, isFetched } = useQuery({
        queryKey: ['asignaciones', areaSeleccionadaId],
        queryFn: () => asignacionesService.obtenerNivelesPorArea(areaSeleccionadaId!),
        enabled: !!areaSeleccionadaId,
    });

    useEffect(() => {
        if (isFetched && nivelesAsignados) {
            const idsActivos = new Set(nivelesAsignados.filter(a => a.activo).map(a => a.id_nivel));
            setNivelesSeleccionados(idsActivos);
        } else if (!areaSeleccionadaId) {
            setNivelesSeleccionados(new Set());
        }
    }, [nivelesAsignados, isFetched, areaSeleccionadaId]);

    const { mutate: guardarAsignaciones, isPending: isSaving } = useMutation({
        mutationFn: async ({ paraCrear, paraActualizar }: { paraCrear: AsignacionPayload[], paraActualizar: AsignacionPayload[] }) => {
            const promises = [];
            if (paraCrear.length > 0) {
                promises.push(asignacionesService.crearAsignacionesDeArea(paraCrear));
            }
            if (paraActualizar.length > 0) {
                promises.push(asignacionesService.actualizarNivelesDeArea(areaSeleccionadaId!, paraActualizar));
            }
            return Promise.all(promises);
        },
        onSuccess: () => {
            setModalState({ isOpen: true, type: 'success', title: '¡Guardado!', message: 'Las asignaciones se han actualizado correctamente.' });
            queryClient.invalidateQueries({ queryKey: ['asignaciones', areaSeleccionadaId] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const errorMessage = error.response?.data?.message || 'No se pudieron guardar los cambios. Inténtelo de nuevo.';
            setModalState({ isOpen: true, type: 'error', title: 'Error', message: errorMessage });
        },
    });

    const handleGuardar = () => {
        if (!areaSeleccionadaId || !todosLosNiveles) return;

        const asignacionesOriginalesMap = new Map(nivelesAsignados.map(a => [a.id_nivel, a]));
        
        const paraCrear: AsignacionPayload[] = [];
        const paraActualizar: AsignacionPayload[] = [];

        todosLosNiveles.forEach(nivel => {
            const yaExiste = asignacionesOriginalesMap.has(nivel.id_nivel);
            const estaSeleccionado = nivelesSeleccionados.has(nivel.id_nivel);

            if (yaExiste) {
                const asignacionOriginal = asignacionesOriginalesMap.get(nivel.id_nivel)!;
                if (asignacionOriginal.activo !== estaSeleccionado) {
                    paraActualizar.push({
                        id_area: areaSeleccionadaId,
                        id_nivel: nivel.id_nivel,
                        activo: estaSeleccionado,
                    });
                }
            } else if (estaSeleccionado) {
                paraCrear.push({
                    id_area: areaSeleccionadaId,
                    id_nivel: nivel.id_nivel,
                    activo: true,
                });
            }
        });

        if (paraCrear.length === 0 && paraActualizar.length === 0) {
            setModalState({ isOpen: true, type: 'info', title: 'Sin Cambios', message: 'No se ha realizado ninguna modificación.' });
            return;
        }

        guardarAsignaciones({ paraCrear, paraActualizar });
    };

    const handleToggleNivel = (id_nivel: number) => {
        setNivelesSeleccionados(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id_nivel)) {
                newSet.delete(id_nivel);
            } else {
                newSet.add(id_nivel);
            }
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