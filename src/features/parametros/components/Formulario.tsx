import React from "react";
import { Link } from "react-router-dom";

export const Formulario = () => {
  return (
    <div>
      <header className="flex justify-center items-center mb-12">
        <h1 className="text-4xl font-extrabold text-negro tracking-tight text-center">
          Agregar parametro de calificacion
        </h1>
      </header>
      <label htmlFor="">Nota minima</label>
      <input type="text" />
      <label htmlFor="">Nota maxima</label>
      <input type="text" />
      <label htmlFor="">Cantidad maxima de competidores</label>
      <footer className="flex justify-end items-center gap-6 mt-14">
        <Link
          type="button"
          className="flex items-center gap-2 font-medium py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 hover:shadow transition-all"
          to="/dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Cancelar</span>
        </Link>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 hover:shadow transition-all disabled:bg-principal-300 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Guardar</span>
        </button>
      </footer>
    </div>
  );
};
