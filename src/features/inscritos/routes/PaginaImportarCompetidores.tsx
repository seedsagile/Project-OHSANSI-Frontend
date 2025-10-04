import { useDropzone } from 'react-dropzone';
import { useImportarCompetidores } from '../hooks/useRegistrarCompetidores';
import { ModalConfirmacion } from '../../responsables/components/ModalConfirmacion';
import { Save, X } from 'lucide-react';

import { DropzoneArea } from '../components/DropzoneArea';
import { TablaResultados } from '../components/TablaResultados';
import { Alert } from '../../../components/ui/Alert';

export function PaginaImportarCompetidores() {
    const {
        datos, 
        nombreArchivo, 
        esArchivoValido, 
        isParsing, 
        isSubmitting,
        modalState, 
        onDrop, 
        handleSave, 
        handleCancel, 
        closeModal, 
        columnasDinamicas,
    } = useImportarCompetidores();

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop, noClick: true, accept: { 'text/csv': ['.csv'] }
    });

    return (
        <>
            <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex items-center justify-center">
                <main className="bg-blanco w-full max-w-6xl rounded-xl shadow-sombra-3 p-6 md:p-8">
                    
                    <header className="flex justify-center items-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">Registrar Competidores</h1>
                    </header>

                    <section className="mb-8">
                        <DropzoneArea
                            getRootProps={getRootProps}
                            getInputProps={getInputProps}
                            isDragActive={isDragActive}
                            isParsing={isParsing}
                            nombreArchivo={nombreArchivo}
                            open={open}
                        />
                    </section>
                    
                    {datos.length > 0 && !esArchivoValido && (
                        <Alert 
                            type="error" 
                            message="Se encontraron errores en el archivo. Las filas inválidas están marcadas en rojo. Pase el mouse sobre ellas para ver los detalles." 
                        />
                    )}

                    <TablaResultados data={datos} columns={columnasDinamicas} />

                    <footer className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-12">
                        <button 
                            onClick={handleCancel}
                            disabled={datos.length === 0 && !nombreArchivo}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="h-5 w-5" />
                            <span>Limpiar</span>
                        </button>
                        
                        <button onClick={handleSave} disabled={!esArchivoValido || isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed min-w-[150px]">
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    <span>Guardar</span>
                                </>
                            )}
                        </button>
                    </footer>
                </main>
            </div>

            <ModalConfirmacion 
                {...modalState} 
                onClose={closeModal} 
                loading={isSubmitting}
            >
                {modalState.message}
            </ModalConfirmacion>
        </>
    );
}