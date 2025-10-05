// src/features/niveles/hooks/useGestionNiveles.ts

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

/**
 * Normaliza un string para realizar comparaciones robustas, ignorando mayúsculas,
 * acentos, espacios extra, y plurales simples.
 * Ejemplos:
 * - "Matemáticas"  -> "matematica"
 * - " Cómputación" -> "computacion"
 * - "Niveles"      -> "nivel"
 */
const normalizarParaComparar = (nombre: string): string => {
    if (!nombre) return '';

    return nombre
        .trim()
        .toLowerCase()
        // Descompone los caracteres acentuados en su versión base + diacrítico
        .normalize('NFD')
        // Elimina los diacríticos (acentos, diéresis, etc.)
        .replace(/[\u0300-\u036f]/g, '')
        // Colapsa múltiples espacios en uno solo
        .replace(/\s+/g, ' ')
        // Elimina plurales simples al final de la palabra (s o es)
        .replace(/e?s$/, '');
};


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
        const nombreNormalizado = normalizarParaComparar(data.nombre);
        
        // Buscamos si existe un nivel que, al ser normalizado, sea idéntico.
        const duplicado = niveles.find(
            nivel => normalizarParaComparar(nivel.nombre) === nombreNormalizado
        );

        if (duplicado) {
            setConfirmationModal({
                isOpen: true,
                title: 'Nombre Duplicado',
                message: `El nombre "${data.nombre}" es muy similar a "${duplicado.nombre}", que ya está registrado. Por favor, ingrese un nombre diferente.`,
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