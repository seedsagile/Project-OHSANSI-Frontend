// responsables/hooks/useVerificacionResponsable.ts
import { useState, useCallback } from 'react'; // <-- Quita useState si ya no se usa para nada más
import { useMutation} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as responsableService from '../services/responsablesService';
import { GESTION_ACTUAL_ANIO } from '../utils/constants';
// --- Quita PasoRegistroResponsable si ya no se usa ---
import type { DatosPersonaVerificada /*, PasoRegistroResponsable */ } from '../types';
import type { VerificacionCIForm } from '../utils/validations';
import { verificacionCISchema } from '../utils/validations';

export function useVerificacionResponsable(
    onVerificationComplete: (
        data: DatosPersonaVerificada | null,
        ci: string,
        isAssignedToCurrentGestion: boolean, // <-- Nombre actualizado para claridad
        initialAreas: number[]
    ) => void,
    onError: (message: string) => void
) {
  // --- ELIMINADO ---
  // const [pasoActual, setPasoActual] = useState<PasoRegistroResponsable>('VERIFICACION_CI');
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
      let isAssigned = false; // <-- Nombre actualizado
      let initialAreas: number[] = [];

      if (data) {
        setVerificandoAsignacionActual(true);
        // --- ELIMINADO ---
        // setPasoActual('CARGANDO_VERIFICACION');
        try {
          const areasActualesIdsData = await responsableService.obtenerAreasPasadas(GESTION_ACTUAL_ANIO, ciInput);
          const areasActualesIds = Array.isArray(areasActualesIdsData) ? areasActualesIdsData : [];
          if (areasActualesIds.length > 0) {
              isAssigned = true; // <-- Nombre actualizado
              initialAreas = areasActualesIds;
          }
        } catch (errorCaught) {
          console.error("Error al verificar asignación actual:", errorCaught);
          onError('Advertencia: No se pudo verificar si el responsable ya está asignado.');
        } finally {
          setVerificandoAsignacionActual(false);
        }
      }

      // --- ELIMINADO ---
      // const nextStep: PasoRegistroResponsable = isAssigned ? 'READ_ONLY' : 'FORMULARIO_DATOS';
      // setPasoActual(nextStep);

      // Llama al callback con el resultado
      onVerificationComplete(data, ciInput, isAssigned, initialAreas); // <-- Nombre actualizado
    },
    onError: (error) => {
      setCiVerificado('');
      // --- ELIMINADO ---
      // setPasoActual('VERIFICACION_CI');
      onError(error.message || 'No se pudo verificar CI.');
    },
  });

  const handleVerificarCISubmit = formMethodsVerificacion.handleSubmit((formData) => {
    // --- ELIMINADO ---
    // setPasoActual('CARGANDO_VERIFICACION');
    verificarCI(formData.ci);
  });

  const resetVerification = useCallback(() => {
      // --- ELIMINADO ---
      // setPasoActual('VERIFICACION_CI');
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