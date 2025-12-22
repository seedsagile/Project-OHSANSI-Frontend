export interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  ci: string;
  fecha_nac: string;
  genero: 'M' | 'F' | string;
  telefono: string;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}
