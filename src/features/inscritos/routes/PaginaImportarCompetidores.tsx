import { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImportarCompetidores } from '../hooks/useRegistrarCompetidores';
import { Modal } from '../../../components/ui/Modal';
import { Save, X, LoaderCircle } from 'lucide-react';
import { DropzoneArea } from '../components/DropzoneArea';
import { TablaResultados } from '../components/TablaResultados';
import { Alert } from '../../../components/ui/Alert';

export function PaginaImportarCompetidores() {
    const {
        datos,
        nombreArchivo,
        esArchivoValido,
        isParsing,
        isLoadingData,
        isSubmitting,
        modalState,
        onDrop,
        handleSave,
        handleCancel,
        closeModal,
        columnasDinamicas,
        invalidHeaders,
    } = useImportarCompetidores();

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        noClick: true,
        disabled: isLoadingData || isParsing,
        accept: { 'text/csv': ['.csv'] }
    });

    const filasValidasParaGuardar = useMemo(() => datos.filter(d => d.esValida).length, [datos]);
    const hayErroresDeFila = useMemo(() => datos.length > 0 && datos.some(d => !d.esValida), [datos]);
    const isPageBusy = isLoadingData || isParsing || isSubmitting;

    return (
        <>
            <div className="bg-neutro-100 min-h-screen p-4 md:p-8 font-display flex items-center justify-center">
                <main className="bg-blanco w-full max-w-7xl rounded-xl shadow-sombra-3 p-6 md:p-8">
                    
                    <header className="flex justify-center items-center mb-6">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tighter">Registrar Competidores</h1>
                    </header>

                    <Alert
                        type="info"
                        message={
                            <div>
                                <p className="font-bold">¡Importante!</p>
                                <p className="mt-1">
                                    Para evitar problemas con acentos y caracteres especiales (ej: Pérez, Potosí), asegúrese de que su archivo esté guardado en formato <strong>CSV UTF-8 (delimitado por comas)</strong>.
                                </p>
                            </div>
                        }
                    />

                    <section className="my-8">
                        {isLoadingData ? (
                            <div className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-neutro-300 bg-neutro-50 text-center">
                                <LoaderCircle className="animate-spin h-10 w-10 text-principal-500" />
                                <p className="mt-4 font-semibold text-neutro-600">
                                    Cargando datos de validación (áreas y niveles)...
                                </p>
                                <p className="text-sm text-neutro-500">
                                    Por favor, espere un momento.
                                </p>
                            </div>
                        ) : (

                            <DropzoneArea 
                                getRootProps={getRootProps}
                                getInputProps={getInputProps}
                                isDragActive={isDragActive}
                                isParsing={isParsing}
                                nombreArchivo={nombreArchivo}
                                open={open}
                            />
                        )}
                    </section>
                    
                    {invalidHeaders.length > 0 && (
                        <Alert 
                            type="error" 
                            message="Se encontraron columnas no reconocidas (marcadas en rojo). El archivo no se puede guardar hasta que se corrijan." 
                        />
                    )}
                    {hayErroresDeFila && (
                        <Alert 
                            type="warning" 
                            message="Se encontraron errores en algunas filas. Las celdas con problemas están marcadas. Pase el mouse sobre ellas para ver los detalles." 
                        />
                    )}
                    
                    <TablaResultados
                        data={datos}
                        columns={columnasDinamicas}
                        invalidHeaders={invalidHeaders}
                    />

                    <footer className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-12">
                        <button 
                            onClick={handleCancel}
                            disabled={(datos.length === 0 && !nombreArchivo) || isPageBusy}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-neutro-200 text-neutro-700 hover:bg-neutro-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="h-5 w-5" />
                            <span>Limpiar</span>
                        </button>
                        
                        <button 
                            onClick={handleSave} 
                            disabled={!esArchivoValido || isPageBusy} 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500 text-blanco hover:bg-principal-600 transition-colors disabled:bg-principal-300 disabled:cursor-not-allowed min-w-[180px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="animate-spin h-5 w-5" />
                                    <span>{`Guardando ${filasValidasParaGuardar} competidores...`}</span>
                                </>
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

            <Modal 
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                type={modalState.type}
                loading={isSubmitting}
            >
                {modalState.message}
            </Modal>
        </>
    );
}