// src/features/medallero/utils/medallero.validators.ts

import { MedalData } from '../types/medallero.types';

export const validators = {
  isValidNumber(value: string, min: number, max: number): boolean {
    if (value === '') return true; // Permite campo vacío temporalmente
    const num = parseInt(value);
    return !isNaN(num) && num >= min && num <= max && /^\d+$/.test(value);
  },

  validateOro(value: string): boolean {
    return this.isValidNumber(value, 0, 10);
  },

  validatePlata(value: string): boolean {
    return this.isValidNumber(value, 0, 10);
  },

  validateBronce(value: string): boolean {
    return this.isValidNumber(value, 0, 10);
  },

  validateMenciones(value: string): boolean {
    return this.isValidNumber(value, 0, 20);
  },

  validateMedalData(data: MedalData[]): string | null {
    for (const row of data) {
      if (row.oro < 0 || row.oro > 10) {
        return `El valor de Oro para ${row.nombre_nivel} debe estar entre 0 y 10`;
      }
      if (row.plata < 0 || row.plata > 10) {
        return `El valor de Plata para ${row.nombre_nivel} debe estar entre 0 y 10`;
      }
      if (row.bronce < 0 || row.bronce > 10) {
        return `El valor de Bronce para ${row.nombre_nivel} debe estar entre 0 y 10`;
      }
      if (row.menciones < 0 || row.menciones > 20) {
        return `El valor de Menciones para ${row.nombre_nivel} debe estar entre 0 y 20`;
      }
    }
    return null;
  }
};