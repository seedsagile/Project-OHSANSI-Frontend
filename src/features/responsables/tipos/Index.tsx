// Define la estructura del objeto 'persona' que espera la API
export type Persona = {
  nombre: string;
  apellido: string;
  ci: string;
  fecha_nac: string; // Asumiremos una fecha por ahora
  genero: string;      // Asumiremos un género por ahora
  telefono: string;    // Asumiremos un teléfono por ahora
  email: string;
};

// Define la estructura completa del payload que se enviará a la API
export type PayloadResponsable = {
  fecha_asignacion: string;
  activo: boolean;
  id_area: number; // La API espera un número
  persona: Persona;
};

// Tipo para los datos que vienen del formulario
export type FormularioData = {
    nombreCompleto: string;
    email: string;
    ci: string;
    id_area: string; // El formulario nos dará un string
};

// Tipo para las áreas que cargaremos en el dropdown
export type Area = {
  id: number;
  nombre: string;
};