import { useState, useCallback } from 'react';
import { useMutation} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as responsableService from '../services/responsablesService';
import { GESTION_ACTUAL_ANIO } from '../utils/constants';
import type { DatosPersonaVerificada } from '../types';
import type { VerificacionCIForm } from '../utils/validations';
import { verificacionCISchema } from '../utils/validations';

export function useVerificacionResponsable(
    onVerificationComplete: (
        data: DatosPersonaVerificada | null,
        ci: string,
        isAssignedToCurrentGestion: boolean,
        initialAreas: number[]
    ) => void,
    onError: (message: string) => void
) {
  const [ciVerificado, setCiVerificado] = useState<string>('');
  const [verificandoAsignacionActual, setVerificandoAsignacionActual] = useState(false);

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema),
    mode: 'onSubmit',
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<
    DatosPersonaVerificada | null,
    Error,
    string
  >({
    mutationFn: responsableService.verificarCI,
    onSuccess: async (data, ciInput) => {
      setCiVerificado(ciInput);
      let isAssigned = false;
      let initialAreas: number[] = [];

      if (data) {
        setVerificandoAsignacionActual(true);
        try {
          const areasActualesIdsData = await responsableService.obtenerAreasPasadas(GESTION_ACTUAL_ANIO, ciInput);
          const areasActualesIds = Array.isArray(areasActualesIdsData) ? areasActualesIdsData : [];
          if (areasActualesIds.length > 0) {
              isAssigned = true;
              initialAreas = areasActualesIds;
          }
        } catch (errorCaught) {
          onError('Advertencia: No se pudo verificar si el responsable ya está asignado.');
        } finally {
          setVerificandoAsignacionActual(false);
        }
      }

      onVerificationComplete(data, ciInput, isAssigned, initialAreas);
    },
    onError: (error) => {
      setCiVerificado('');
      onError(error.message || 'No se pudo verificar CI.');
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