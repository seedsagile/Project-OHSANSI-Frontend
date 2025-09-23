import React from 'react';
import ReactDOM from 'react-dom/client';
import { PaginaImportarCompetidores } from './features/inscritos/rutas/PaginaImportarCompetidores';
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PaginaImportarCompetidores />
  </React.StrictMode>
);