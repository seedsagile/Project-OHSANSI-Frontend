export interface SistemaEstado {
  status: 'operativo' | 'mantenimiento';
  server_timestamp: string;
  gestion_actual: {
    id: number;
    nombre: string;
    gestion: string;
  };
  fase_global_activa: {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
  };
  cronograma_vigente: {
    fecha_inicio: string;
    fecha_fin: string;
    en_fecha: boolean;
    mensaje: string;
  };
}