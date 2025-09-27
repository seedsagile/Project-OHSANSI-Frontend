import { FormularioAsignarResponsable } from '../components/FormularioAsignarResponsable';
import { Spinner } from '../components/Spinner';
import { useAsignarResponsable } from '../hooks/useAsignarResponsable';

export function PaginaAsignarResponsable() {
  const { 
    register, 
    handleSubmit, 
    errors, 
    isSubmitting 
  } = useAsignarResponsable();

  return (
    <div className="bg-neutro-100 min-h-screen flex items-center justify-center p-4 font-display">
      <main className="bg-blanco w-full max-w-4xl rounded-xl shadow-sombra-3 p-8">
        
        <header className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-extrabold text-negro tracking-tighter text-center">
            Registrar Responsable de Área
          </h1>
        </header>

        <form id="asignar-responsable-form" onSubmit={handleSubmit}>
          <FormularioAsignarResponsable
            register={register}
            errors={errors}
          />
        </form>

        <footer className="flex justify-end items-center gap-4 mt-12">
          <button
            type="button"
            className="flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Cancelar</span>
          </button>
          
          <button 
            type="submit" 
            form="asignar-responsable-form"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-48 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span>Guardar</span>
              </>
            )}
          </button>
        </footer>

      </main>
    </div>
  );
}