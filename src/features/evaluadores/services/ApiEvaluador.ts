// src/evaluadores/services/ApiEvaluador.ts

import type {
  PayloadEvaluador,
  EvaluadorResponse,
  ErrorValidacionResponse,
} from '../tipos/IndexEvaluador';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const evaluadorService = {
  async crearEvaluador(data: PayloadEvaluador): Promise<EvaluadorResponse> {
    try {
      console.log('=== DEBUG EVALUADOR ===');
      console.log('1. URL completa:', `${API_BASE_URL}/evaluadores`);
      console.log('2. Datos que se envían:', JSON.stringify(data, null, 2));

      const response = await fetch(`${API_BASE_URL}/evaluadores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('3. Status de respuesta:', response.status);
      console.log('4. Status text:', response.statusText);
      console.log('5. Headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('6. Respuesta RAW del servidor:', responseText);

      if (!response.ok) {
        let errorData: ErrorValidacionResponse | null = null;
        try {
          errorData = JSON.parse(responseText) as ErrorValidacionResponse;
          console.log('7. Error parseado como JSON:', errorData);
        } catch (parseError) {
          console.log('7. Error NO es JSON válido:', parseError);
        }

        let mensaje = 'Error al crear el evaluador';

        if (response.status === 422 && errorData) {
          if (errorData.errors) {
            // Construir mensaje personalizado para errores de duplicación
            const mensajes: string[] = [];

            if (errorData.errors.ci && errorData.area_ci && errorData.nivel_ci) {
              mensajes.push(
                `El CI ya está registrado en el área "${errorData.area_ci}" - Nivel "${errorData.nivel_ci}"`
              );
            }

            if (errorData.errors.email && errorData.area_email && errorData.nivel_email) {
              mensajes.push(
                `El email ya está registrado en el área "${errorData.area_email}" - Nivel "${errorData.nivel_email}"`
              );
            }

            if (mensajes.length > 0) {
              mensaje = mensajes.join('. ');
              // Adjuntar los datos completos del error para uso en el hook
              const error = new Error(mensaje);
              (error as Error & { errorData?: ErrorValidacionResponse }).errorData = errorData;
              throw error;
            } else {
              // Otros errores de validación
              const erroresArray = Object.entries(errorData.errors).map(([campo, errores]) => {
                return `${campo}: ${Array.isArray(errores) ? errores.join(', ') : String(errores)}`;
              });
              mensaje = `Errores de validación: ${erroresArray.join('; ')}`;
            }
          } else if (errorData.message) {
            mensaje = errorData.message;
          }
        } else if (response.status === 409) {
          mensaje = errorData?.message || 'Ya existe un evaluador con estos datos';
        } else if (response.status === 400) {
          mensaje = errorData?.message || 'Los datos ingresados no son válidos';
        } else if (response.status >= 500) {
          mensaje = errorData?.message || 'Error interno del servidor';
        }

        console.log('8. Mensaje final de error:', mensaje);
        throw new Error(mensaje);
      }

      let jsonResponse: EvaluadorResponse;
      try {
        jsonResponse = JSON.parse(responseText) as EvaluadorResponse;
        console.log('9. Respuesta exitosa parseada:', jsonResponse);
      } catch (parseError) {
        console.log('9. Error al parsear respuesta exitosa:', parseError);
        throw new Error('La respuesta del servidor no es un JSON válido');
      }

      console.log('10. ¡ÉXITO! Evaluador creado correctamente');
      return jsonResponse;
    } catch (error) {
      console.log('11. ERROR CAPTURADO:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión al servidor');
    }
  },
};
