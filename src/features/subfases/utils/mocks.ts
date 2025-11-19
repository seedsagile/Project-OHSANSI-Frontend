import { SubFase } from '../types';

export const MOCK_AREAS = [
  { id_area: 1, nombre: 'Matemáticas' },
  { id_area: 2, nombre: 'Física' },
  { id_area: 3, nombre: 'Robótica' },
  { id_area: 4, nombre: 'Química' },
];

export const MOCK_NIVELES_MATEMATICAS = [
  { id_nivel: 101, nombre: '1ro de Secundaria' },
  { id_nivel: 102, nombre: '2do de Secundaria' },
  { id_nivel: 103, nombre: '3ro de Secundaria' },
  { id_nivel: 104, nombre: '4to de Secundaria' },
  { id_nivel: 105, nombre: '5to de Secundaria' },
  { id_nivel: 106, nombre: '6to de Secundaria' },
];

export const MOCK_NIVELES_ROBOTICA = [
  { id_nivel: 201, nombre: 'Categoría A (Constructores - Lego)' },
  { id_nivel: 202, nombre: 'Categoría B (Programadores - Arduino)' },
  { id_nivel: 203, nombre: 'Categoría C (Innovadores - Libre)' },
];

export const MOCK_NIVELES_FISICA = [
  { id_nivel: 301, nombre: 'Nivel Intermedio' },
  { id_nivel: 302, nombre: 'Nivel Avanzado' },
];

export const MOCK_SUBFASES_MATE: SubFase[] = [
  {
    id_subfase: 1,
    nombre: 'Examen Clasificatorio',
    orden: 1,
    estado: 'FINALIZADA',
    cant_estudiantes: 150,
    cant_evaluadores: 8,
    progreso: 100,
  },
  {
    id_subfase: 2,
    nombre: 'Examen Final Teórico',
    orden: 2,
    estado: 'EN_EVALUACION',
    cant_estudiantes: 45,
    cant_evaluadores: 4,
    progreso: 65,
  },
  {
    id_subfase: 3,
    nombre: 'Ronda de Problemas',
    orden: 3,
    estado: 'NO_INICIADA',
    cant_estudiantes: 10, // Top 10 finalistas estimados
    cant_evaluadores: 4,
    progreso: 0,
  },
];

//[cite_start]// CASO DE USO B: Proceso Inicial (Robótica) [cite: 8]
// Muestra una fase terminada y las siguientes listas para empezar.
export const MOCK_SUBFASES_ROBO: SubFase[] = [
  {
    id_subfase: 10,
    nombre: 'Revisión de Hardware (Homologación)',
    orden: 1,
    estado: 'FINALIZADA',
    cant_estudiantes: 25,
    cant_evaluadores: 2,
    progreso: 100,
  },
  {
    id_subfase: 11,
    nombre: 'Competencia en Pista',
    orden: 2,
    estado: 'NO_INICIADA', // Lista para iniciar
    cant_estudiantes: 20, // Algunos descalificados en hardware
    cant_evaluadores: 4,
    progreso: 0,
  },
  {
    id_subfase: 12,
    nombre: 'Defensa de Proyecto',
    orden: 3,
    estado: 'NO_INICIADA',
    cant_estudiantes: 5, // Finalistas
    cant_evaluadores: 5, // Jurado completo
    progreso: 0,
  }
];

//[cite_start]// CASO DE USO C: Proceso Nuevo (Física) [cite: 9]
// Todo en cero. Ideal para probar el inicio del flujo.
export const MOCK_SUBFASES_FISICA: SubFase[] = [
    {
      id_subfase: 20,
      nombre: 'Examen Conceptual',
      orden: 1,
      estado: 'NO_INICIADA',
      cant_estudiantes: 60,
      cant_evaluadores: 3,
      progreso: 0,
    },
    {
      id_subfase: 21,
      nombre: 'Examen Analítico',
      orden: 2,
      estado: 'NO_INICIADA',
      cant_estudiantes: 30,
      cant_evaluadores: 3,
      progreso: 0,
    },
    {
        id_subfase: 22,
        nombre: 'Fase Experimental (Lab)',
        orden: 3,
        estado: 'NO_INICIADA',
        cant_estudiantes: 10,
        cant_evaluadores: 2,
        progreso: 0,
      }
  ];