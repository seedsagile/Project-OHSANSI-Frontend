import { useState, useCallback } from 'react';
import { useMutation} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as evaluadorService from '../services/evaluadorService';
import { GESTION_ACTUAL_ANIO } from '../utils/constants';
import type { DatosPersonaVerificada } from '../types';
import type { VerificacionCIForm } from '../utils/validations';
import { verificacionCISchema } from '../utils/validations';

export function useVerificacionEvaluador(
    onVerificationComplete: (
        data: DatosPersonaVerificada | null,
        isAssignedToCurrentGestion: boolean,
        initialAreas: number[]
    ) => void,
    onError: (message: string) => void
) {
  const [ciVerificado, setCiVerificado] = useState<string>('');
  const [verificandoAsignacionActual, setVerificandoAsignacionActual] = useState(false);

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema),
    mode: 'all',
    shouldFocusError: true,
    delayError: 400,
    criteriaMode: 'all',
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<
    DatosPersonaVerificada | null,
    Error,
    string
  >({
    mutationFn: evaluadorService.verificarCI,
    onSuccess: async (data, ciInput) => {
      setCiVerificado(ciInput);
      let isAssigned = false;
      let initialAreas: number[] = [];

      if (data) {
        setVerificandoAsignacionActual(true);
        try {
          const areasActualesIdsData = await evaluadorService.obtenerAreasPasadas(GESTION_ACTUAL_ANIO, ciInput);
          const areasActualesIds = Array.isArray(areasActualesIdsData) ? areasActualesIdsData : [];

          if (areasActualesIds.length > 0) {
              isAssigned = true;
              initialAreas = areasActualesIds;
          }

        } catch (errorCaught) {
          onError('Advertencia: No se pudo verificar si el Evaluador ya está asignado.');
        } finally {
          setVerificandoAsignacionActual(false);
        }
      }
      onVerificationComplete(data, isAssigned, initialAreas);
    },
    onError: (error) => {
      setCiVerificado('');
      onError(error.message || 'No se pudo verificar el CI.');
    },
  });

  const handleVerificarCISubmit = formMethodsVerificacion.handleSubmit((formData) => {
    verificarCI(formData.ci);
  });

  const resetVerification = useCallback(() => {
      setCiVerificado('');
      setVerificandoAsignacionActual(false);
      formMethodsVerificacion.reset();
  }, [formMethodsVerificacion]);

  return {
    isVerifying: isVerifyingCI || verificandoAsignacionActual,
    formMethodsVerificacion,
    handleVerificarCISubmit,
    resetVerification,
    ciVerificado,
  };
}