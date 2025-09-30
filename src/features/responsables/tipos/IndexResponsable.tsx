// Define la estructura del objeto 'persona' que espera la API
export type Persona = {
  nombre: string;
  apellido: string;
  ci: string;
  fecha_nac: string;
  genero: string;
  telefono: string;
  email: string;
};

// Define la estructura del payload que se enviara a la API
export type PayloadResponsable = {
  codigo_encargado: string;
  fecha_asignacion: string;
  persona: Persona;
};

// Tipo para los datos que vienen del formulario
export type FormularioData = {
    nombreCompleto: string;
    email: string;
    ci: string;
    codigo_encargado: string;
};