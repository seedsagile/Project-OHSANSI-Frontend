// src/evaluadores/tipos/IndexEvaluador.ts

// Tipo para los datos que vienen del formulario
export type FormularioDataEvaluador = {
  nombreCompleto: string;
  email: string;
  ci: string;
  username: string;
  password: string;
  password_confirmation: string;
  codigo_evaluador: string;
};

// Define la estructura del payload que se enviará a la API
export type PayloadEvaluador = {
  nombre: string;
  apellido: string;
  ci: string;
  fecha_nac: string;
  genero: string;
  telefono: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  codigo_evaluador: string;
};