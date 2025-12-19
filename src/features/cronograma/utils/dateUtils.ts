import { isWithinInterval, isAfter, format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export const parseDateTime = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  return new Date(dateStr.replace(' ', 'T'));
};

export const getFaseStatus = (startStr: string, endStr: string) => {
  const now = new Date();
  
  if (!startStr || !endStr) return 'PENDIENTE';

  const start = parseDateTime(startStr);
  const end = parseDateTime(endStr);

  if (!isValid(start) || !isValid(end)) return 'PENDIENTE';

  if (isWithinInterval(now, { start, end })) return 'ACTIVA';
  if (isAfter(now, end)) return 'FINALIZADA';
  return 'PENDIENTE';
};

export const formatDateTimePretty = (dateStr?: string) => {
  if (!dateStr) return '--/--/---- --:--';
  const fecha = parseDateTime(dateStr);
  if (!isValid(fecha)) return 'Fecha inválida';
  return format(fecha, 'dd/MM/yyyy HH:mm', { locale: es });
};