import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as responsableService from '../services/responsablesService';
import type { VerificacionUsuarioCompleta } from '../types';
import type { VerificacionCIForm } from '../utils/validations';
import { verificacionCISchema } from '../utils/validations';

export function useVerificacionResponsable(
  onVerificationComplete: (data: VerificacionUsuarioCompleta | null) => void,
  onError: (message: string) => void
) {
  const [ciVerificado, setCiVerificado] = useState<string>('');

  const formMethodsVerificacion = useForm<VerificacionCIForm>({
    resolver: zodResolver(verificacionCISchema),
    mode: 'all',
    shouldFocusError: true,
    delayError: 400,
    criteriaMode: 'all',
  });

  const { mutate: verificarCI, isPending: isVerifyingCI } = useMutation<
    VerificacionUsuarioCompleta | null,
    Error,
    string
  >({
    mutationFn: responsableService.verificarCI,

    onSuccess: async (data, ciInput) => {
      setCiVerificado(ciInput);
      onVerificationComplete(data);
    },
    onError: (error) => {
      setCiVerificado('');
      // 🔽 --- CORRECCIÓN DEL BUG ---
      // Se elimina la lógica de fallback '||'.
      // Ahora simplemente pasamos el 'error.message' (que puede ser '')
      // al hook 'useGestionResponsable', que es el encargado
      // de interpretarlo y mostrar el mensaje genérico del CA #8.
      onError(error.message);
      // 🔽 --- FIN DE CORRECCIÓN ---
    },
  });

  const handleVerificarCISubmit = formMethodsVerificacion.handleSubmit(
    (formData) => {
      verificarCI(formData.ci);
    }
  );

  const resetVerification = useCallback(() => {
    setCiVerificado('');
    formMethodsVerificacion.reset();
  }, [formMethodsVerificacion]);

  return {
    isVerifying: isVerifyingCI,
    formMethodsVerificacion,
    handleVerificarCISubmit,
    resetVerification,
    ciVerificado,
  };
}