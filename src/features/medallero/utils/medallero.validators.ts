import { MedalData } from '../types/medallero.types';

export const validators = {
  isPositiveInteger(value: string): boolean {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
  },

  validateMedalData(data: MedalData[]): string | null {
    for (const row of data) {
      if (row.oro < 0 || row.plata < 0 || row.bronce < 0 || row.menciones < 0) {
        return 'Todos los valores deben ser números positivos';
      }
    }
    return null;
  }
};