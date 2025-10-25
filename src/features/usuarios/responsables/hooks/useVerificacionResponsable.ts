// src/features/usuarios/responsables/hooks/useVerificacionResponsable.ts
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as responsableService from '../services/responsablesService';
// CORRECCIÓN: Cambiada la ruta de importación a la ubicación actual del archivo
import { GESTION_ACTUAL_ANIO } from '../utils/constants';
import type { DatosPersonaVerificada, PasoRegistroResponsable } from '../types';
import type { VerificacionCIForm } from '../utils/validations';
import { verificacionCISchema } from '../utils/validations';

export function useVerificacionResponsable(
    onVerificationComplete: (
        data: DatosPersonaVerificada | null,
        ci: string,
        initialReadOnlyState: boolean,
        initialAreas: number[]
    ) => void,
    onError: (message: string) => void
) {
  const [pasoActual, setPasoActual] = useState<PasoRegistroResponsable>('VERIFICACION_CI');
  const [ciVerificado, setCiVerificado] = useState<string>('');
  const [verificandoAsignacionActual, setVerificandoAsignacionActual] = useState(false);

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema),
    mode: 'onSubmit',
  });

  // Utiliza la constante importada GESTION_ACTUAL_ANIO
  const { refetch: refetchAsignacionActual } = useQuery<number[], Error>({
    queryKey: ['areasAsignadasActuales', ciVerificado, GESTION_ACTUAL_ANIO],
    queryFn: () => responsableService.obtenerAreasPasadas(GESTION_ACTUAL_ANIO, ciVerificado),
    enabled: false, // Solo se ejecuta manually con refetch
    staleTime: 0,
    gcTime: 0, // Evita caché innecesaria aquí
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<
    DatosPersonaVerificada | null,
    Error,
    string
  >({
    mutationFn: responsableService.verificarCI,
    onSuccess: async (data, ciInput) => {
      setCiVerificado(ciInput);
      let isReadOnly = false;
      let initialAreas: number[] = [];

      if (data) {
        setVerificandoAsignacionActual(true);
        setPasoActual('CARGANDO_VERIFICACION');
        try {
          const { data: areasActualesIdsData, isSuccess } = await refetchAsignacionActual();
          if (isSuccess) {
              const areasActualesIds = Array.isArray(areasActualesIdsData) ? areasActualesIdsData : [];
              if (areasActualesIds.length > 0) {
                  isReadOnly = true;
                  initialAreas = areasActualesIds;
              }
          } else {
              console.warn("No se pudo confirmar la asignación actual.");
          }

        } catch (errorCaught) {
          console.error("Error al verificar asignación actual:", errorCaught);
          onError('Advertencia: No se pudo verificar si el responsable ya está asignado.');
        } finally {
          setVerificandoAsignacionActual(false);
        }
      }

      const nextStep: PasoRegistroResponsable = isReadOnly ? 'READ_ONLY' : 'FORMULARIO_DATOS';
      setPasoActual(nextStep);
      onVerificationComplete(data, ciInput, isReadOnly, initialAreas);
    },
    onError: (error) => {
      setCiVerificado('');
      setPasoActual('VERIFICACION_CI');
      onError(error.message || 'No se pudo verificar CI.');
    },
  });

  const handleVerificarCISubmit = formMethodsVerificacion.handleSubmit((formData) => {
    setPasoActual('CARGANDO_VERIFICACION');
    verificarCI(formData.ci);
  });

  const resetVerification = useCallback(() => {
      setPasoActual('VERIFICACION_CI');
      setCiVerificado('');
      setVerificandoAsignacionActual(false);
      formMethodsVerificacion.reset();
  }, [formMethodsVerificacion]);

  return {
    pasoActualVerificacion: pasoActual,
    isVerifying: isVerifyingCI || verificandoAsignacionActual,
    formMethodsVerificacion,
    handleVerificarCISubmit,
    resetVerification,
    ciVerificado,
  };
}