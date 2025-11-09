import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as evaluadorService from '../services/evaluadorService';
import type { VerificacionUsuarioCompleta } from '../types';
import type { VerificacionCIForm } from '../utils/validations';
import { verificacionCISchema } from '../utils/validations';

export function useVerificacionEvaluador(
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
    mutationFn: (ci: string) => evaluadorService.verificarCI(ci),
    onSuccess: (data, ciInput) => {
      setCiVerificado(ciInput);
      onVerificationComplete(data);
    },
    onError: (error) => {
      setCiVerificado('');
      onError(error.message || 'No se pudo verificar el CI.');
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