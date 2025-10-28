import { useState, useCallback } from 'react';
import { useMutation} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as responsableService from '../services/responsablesService';
import { GESTION_ACTUAL_ANIO } from '../utils/constants'; // Asegúrate que esta constante esté exportada y sea correcta
import type { DatosPersonaVerificada } from '../types';
import type { VerificacionCIForm } from '../utils/validations';
import { verificacionCISchema } from '../utils/validations';

export function useVerificacionResponsable(
    onVerificationComplete: (
        data: DatosPersonaVerificada | null,
        // ci: string, // <-- Parámetro 'ci' eliminado en la corrección anterior
        isAssignedToCurrentGestion: boolean,
        initialAreas: number[]
    ) => void,
    onError: (message: string) => void
) {
  const [ciVerificado, setCiVerificado] = useState<string>('');
  const [verificandoAsignacionActual, setVerificandoAsignacionActual] = useState(false);

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema),
    mode: 'onSubmit', // Validar solo al enviar
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<
    DatosPersonaVerificada | null,
    Error, // Tipo de error esperado por la mutación
    string // Tipo del argumento que recibe (el CI)
  >({
    mutationFn: responsableService.verificarCI,
    onSuccess: async (data, ciInput) => {
      // 'data' es el resultado de verificarCI (DatosPersonaVerificada | null)
      // 'ciInput' es el CI que se pasó a la mutación
      setCiVerificado(ciInput); // Guardamos el CI que se verificó
      let isAssigned = false;
      let initialAreas: number[] = [];

      // Si el usuario existe (data no es null), verificar si ya está asignado a la gestión actual
      if (data) {
        setVerificandoAsignacionActual(true); // Indicar que estamos haciendo la segunda verificación
        try {
          // Llamar a la API para obtener áreas de la gestión actual para este CI
          const areasActualesIdsData = await responsableService.obtenerAreasPasadas(GESTION_ACTUAL_ANIO, ciInput);
          // Asegurarse de que sea un array antes de verificar su longitud
          const areasActualesIds = Array.isArray(areasActualesIdsData) ? areasActualesIdsData : [];

          if (areasActualesIds.length > 0) {
              // Si tiene áreas asignadas en la gestión actual
              isAssigned = true;
              initialAreas = areasActualesIds; // Guardar las áreas iniciales
          }
          // Si no tiene áreas, isAssigned permanece false e initialAreas vacío

        } catch (errorCaught) {
          // Si falla la verificación de asignación, notificar pero continuar
          // (se asume que no está asignado si hay error)
          onError('Advertencia: No se pudo verificar si el responsable ya está asignado.');
          // console.error("Error verificando asignación actual:", errorCaught); // Opcional: loguear el error
        } finally {
          setVerificandoAsignacionActual(false); // Terminar el estado de carga de la segunda verificación
        }
      }

      // Llamar al callback principal con todos los resultados
      // onVerificationComplete(data, ciInput, isAssigned, initialAreas); // <-- Se quitó ciInput aquí en la corrección anterior
      onVerificationComplete(data, isAssigned, initialAreas);
    },
    onError: (error) => {
      // Si la mutación principal (verificarCI) falla
      setCiVerificado(''); // Limpiar el CI verificado
      onError(error.message || 'No se pudo verificar el CI.'); // Notificar el error
    },
  });

  // Handler para el submit del formulario de verificación
  const handleVerificarCISubmit = formMethodsVerificacion.handleSubmit((formData) => {
    // Llama a la mutación 'verificarCI' con el CI del formulario validado
    verificarCI(formData.ci);
  });

  // Función para resetear el estado de este hook
  const resetVerification = useCallback(() => {
      setCiVerificado('');
      setVerificandoAsignacionActual(false);
      formMethodsVerificacion.reset(); // Resetea el formulario de react-hook-form
  }, [formMethodsVerificacion]); // Dependencia del método reset del formulario

  return {
    // Estado combinado de carga (verificando CI o verificando asignación)
    isVerifying: isVerifyingCI || verificandoAsignacionActual,
    // Métodos del formulario de verificación para pasar al componente
    formMethodsVerificacion,
    // Handler para el evento onSubmit del formulario
    handleVerificarCISubmit,
    // Función para resetear desde el hook padre
    resetVerification,
    // El CI que fue verificado exitosamente (útil para otras queries)
    ciVerificado,
  };
}