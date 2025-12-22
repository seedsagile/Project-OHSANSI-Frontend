export interface Olimpiada {
  id: number;//esto revisarlo para que si esta asi en la db
  nombre: string;
  gestion: string;
  estado: boolean;
}

export interface ApiResponse {
  success: boolean;
  data: Olimpiada[];
  message: string;
}