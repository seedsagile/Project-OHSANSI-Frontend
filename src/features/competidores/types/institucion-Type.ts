export interface Institucion {
  id_institucion: number;
  nombre: string;
  tipo: string;
  departamento: string;
  direccion: string;
  telefono: string | null;
  email: '' | null;
  id_persona: number | null;
  created_at: string | null;
  updated_at: string | null;
}
